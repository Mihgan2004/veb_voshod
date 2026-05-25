"use client";

import {
  Suspense,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAspect, useTexture } from "@react-three/drei";
import { transform, type MotionValue } from "framer-motion";
import * as THREE from "three";
import { fragment, vertex } from "./Shader";
import {
  WAVE_CONFIG_BY_TIER,
  WAVE_CONFIG_REDUCED,
  getWaveTierFromWidth,
  type WaveSceneConfig,
} from "./wave-config";

const WAVE_TEXTURE = "/images/rassvet-wave.jpg";
const REDUCED_MOTION_MEDIA = "(prefers-reduced-motion: reduce)";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function computeCoverSize(
  viewportWidth: number,
  viewportHeight: number,
  aspect: number,
) {
  let coverWidth = viewportWidth;
  let coverHeight = coverWidth / aspect;
  if (coverHeight < viewportHeight) {
    coverHeight = viewportHeight;
    coverWidth = coverHeight * aspect;
  }
  return { coverWidth, coverHeight };
}

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_MEDIA);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_MEDIA).matches;
}

function getServerSnapshot() {
  return false;
}

type ModelProps = {
  scrollProgress: MotionValue<number>;
};

function ModelInner({ scrollProgress }: ModelProps) {
  const image = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | null>(
    null,
  );

  const texture = useTexture(WAVE_TEXTURE);
  const { viewport, size } = useThree();

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerSnapshot,
  );

  const tier = getWaveTierFromWidth(size.width);
  const config: WaveSceneConfig = reducedMotion
    ? WAVE_CONFIG_REDUCED
    : WAVE_CONFIG_BY_TIER[tier];

  const { width: imageWidth, height: imageHeight } = texture.image as {
    width: number;
    height: number;
  };

  const baseScale = useAspect(imageWidth, imageHeight, 1);

  const amplitude = 0.25;
  const waveLength = 5;

  const uniforms = useRef({
    uTime: { value: 0 },
    uAmplitude: { value: amplitude },
    uWaveLength: { value: waveLength },
    uTexture: { value: texture },
    vUvScale: { value: new THREE.Vector2(0, 0) },
  });

  useFrame(() => {
    if (!image.current) return;

    const rawProgress = clamp01(scrollProgress.get());
    const zoomProgress = clamp01(rawProgress * config.zoomSpeed);
    const aspect = imageWidth / imageHeight;

    const initialWidth = viewport.width * config.initialWidthFactor;
    const initialHeight = initialWidth / aspect;

    const { coverWidth, coverHeight } = computeCoverSize(
      viewport.width,
      viewport.height,
      aspect,
    );

    const scaleX = lerp(initialWidth, coverWidth, zoomProgress);
    const scaleY = lerp(initialHeight, coverHeight, zoomProgress);

    image.current.scale.x = scaleX;
    image.current.scale.y = scaleY;

    const scaleRatio = scaleX / scaleY;
    const aspectRatio = imageWidth / imageHeight;

    image.current.material.uniforms.vUvScale.value.set(
      1,
      aspectRatio / scaleRatio,
    );

    const modifiedAmplitude = transform(rawProgress, [0, 1], [amplitude, 0]);

    image.current.material.uniforms.uTime.value += 0.04;
    image.current.material.uniforms.uAmplitude.value = modifiedAmplitude;
    image.current.material.uniforms.uWaveLength.value = waveLength;
  });

  return (
    <mesh ref={image} scale={baseScale}>
      <planeGeometry args={[1, 1, 64, 64]} />
      <shaderMaterial
        // eslint-disable-next-line react-hooks/refs -- Larose demo: stable uniforms ref
        uniforms={uniforms.current}
        vertexShader={vertex}
        fragmentShader={fragment}
      />
    </mesh>
  );
}

export default function Model(props: ModelProps) {
  return (
    <Suspense fallback={null}>
      <ModelInner {...props} />
    </Suspense>
  );
}
