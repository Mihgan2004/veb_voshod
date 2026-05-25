"use client";

import { Suspense, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAspect, useTexture } from "@react-three/drei";
import { transform, type MotionValue } from "framer-motion";
import * as THREE from "three";
import { fragment, vertex } from "./Shader";

const WAVE_TEXTURE = "/images/rassvet-wave.jpg";

type ModelProps = {
  scrollProgress: MotionValue<number>;
};

function ModelInner({ scrollProgress }: ModelProps) {
  const image = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | null>(
    null,
  );

  const texture = useTexture(WAVE_TEXTURE);
  const { viewport } = useThree();

  const { width: imageWidth, height: imageHeight } = texture.image as {
    width: number;
    height: number;
  };

  const scale = useAspect(imageWidth, imageHeight, 0.3);

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

    const progress = scrollProgress.get();

    const scaleX = transform(progress, [0, 1], [scale[0], viewport.width]);
    const scaleY = transform(progress, [0, 1], [scale[1], viewport.height]);

    image.current.scale.x = scaleX;
    image.current.scale.y = scaleY;

    const scaleRatio = scaleX / scaleY;
    const aspectRatio = imageWidth / imageHeight;

    image.current.material.uniforms.vUvScale.value.set(
      1,
      aspectRatio / scaleRatio,
    );

    const modifiedAmplitude = transform(progress, [0, 1], [amplitude, 0]);

    image.current.material.uniforms.uTime.value += 0.04;
    image.current.material.uniforms.uAmplitude.value = modifiedAmplitude;
    image.current.material.uniforms.uWaveLength.value = waveLength;
  });

  return (
    <mesh ref={image} scale={scale}>
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
