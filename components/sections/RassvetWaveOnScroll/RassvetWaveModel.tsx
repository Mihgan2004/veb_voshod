"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { waveFragmentShader, waveVertexShader } from "./shaders";
import {
  WAVE_IMAGE,
  type WaveSceneConfig,
  WAVE_CONFIG_REDUCED,
} from "./wave-config";
import { clamp01, coverPlaneSize, lerp } from "./wave-math";

type RassvetWaveModelProps = {
  scrollProgress: MotionValue<number>;
  config: WaveSceneConfig;
  reducedMotion: boolean;
};

export function RassvetWaveModel({
  scrollProgress,
  config,
  reducedMotion,
}: RassvetWaveModelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(WAVE_IMAGE);
  const { width, height } = texture.image as { width: number; height: number };
  const { viewport } = useThree();
  const imageAspect = width / height;

  const amplitudeStart = reducedMotion
    ? WAVE_CONFIG_REDUCED.amplitude
    : config.amplitude;
  const amplitudeEnd = reducedMotion
    ? WAVE_CONFIG_REDUCED.amplitudeEnd
    : config.amplitudeEnd;
  const waveLength = reducedMotion
    ? WAVE_CONFIG_REDUCED.waveLength
    : config.waveLength;
  const timeSpeed = reducedMotion
    ? WAVE_CONFIG_REDUCED.timeSpeed
    : config.timeSpeed;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: amplitudeStart },
      uWaveLength: { value: waveLength },
      uTexture: { value: texture },
      vUvScale: { value: new THREE.Vector2(1, 1) },
    }),
    [amplitudeStart, texture, waveLength],
  );

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh?.material || !(mesh.material instanceof THREE.ShaderMaterial)) {
      return;
    }

    const p = clamp01(scrollProgress.get());

    const initialWidth = viewport.width * config.initialWidthFactor;
    const initialHeight = initialWidth / imageAspect;
    const { coverWidth, coverHeight } = coverPlaneSize(
      viewport.width,
      viewport.height,
      imageAspect,
      config.coverOverscan,
    );

    const scaleX = lerp(initialWidth, coverWidth, p);
    const scaleY = lerp(initialHeight, coverHeight, p);
    mesh.scale.set(scaleX, scaleY, 1);

    const scaleRatio = scaleX / scaleY;
    mesh.material.uniforms.vUvScale.value.set(1, imageAspect / scaleRatio);

    mesh.material.uniforms.uTime.value += timeSpeed;
    mesh.material.uniforms.uAmplitude.value = lerp(amplitudeStart, amplitudeEnd, p);
    mesh.material.uniforms.uWaveLength.value = waveLength;
  });

  return (
    <mesh ref={meshRef} scale={[1, 1, 1]}>
      <planeGeometry args={[1, 1, ...config.segments]} />
      <shaderMaterial
        wireframe={false}
        fragmentShader={waveFragmentShader}
        vertexShader={waveVertexShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
