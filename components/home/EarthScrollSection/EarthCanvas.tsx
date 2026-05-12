"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

import { EarthMotion } from "./EarthMotion";
import { lerp, smoothstep } from "./earthScrollConfig";

type Props = {
  scrollYProgress: MotionValue<number>;
};

export function EarthCanvas({ scrollYProgress }: Props) {
  return (
    <Canvas
      className="earth-scroll-canvas"
      flat
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5.0], fov: 35, near: 0.01, far: 400 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
      }}
      style={{ background: "#02050d" }}
    >
      <color attach="background" args={["#02050d"]} />

      <StarfieldScroll scrollYProgress={scrollYProgress} count={2400} radius={160} size={1.25} base="#cfd8e8" opacityBase={0.78} />
      <StarfieldScroll scrollYProgress={scrollYProgress} count={420} radius={120} size={2.2} base="#ffffff" opacityBase={0.9} />

      <ambientLight intensity={0.05} color="#7c8db3" />
      <directionalLight intensity={1.12} position={[-6.5, 2.5, 7]} color="#dde6ff" />

      <EarthMotion scrollYProgress={scrollYProgress} />
    </Canvas>
  );
}

function rnd01(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
  return x - Math.floor(x);
}

function buildStarPositions(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius * (0.85 + rnd01(i * 17 + count) * 0.35);
    const theta = rnd01(i * 31 + 3) * Math.PI * 2;
    const phi = Math.acos(2 * rnd01(i * 97 + count) - 1);
    positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

function StarfieldScroll({
  scrollYProgress,
  count,
  radius,
  size,
  base,
  opacityBase,
}: {
  scrollYProgress: MotionValue<number>;
  count: number;
  radius: number;
  size: number;
  base: string;
  opacityBase: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = buildStarPositions(count, radius);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count, radius]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size,
        color: base,
        sizeAttenuation: false,
        transparent: true,
        opacity: opacityBase,
        depthWrite: false,
      }),
    [size, base, opacityBase],
  );

  useFrame((_, delta) => {
    const p = scrollYProgress.get();
    const dim = smoothstep(0.38, 0.72, p);
    const starOpBase = lerp(0.78, 0.32, dim);
    const m = pointsRef.current?.material as THREE.PointsMaterial | undefined;
    if (m) {
      m.opacity = starOpBase * opacityBase;
      m.needsUpdate = true;
    }
    const rot = pointsRef.current;
    if (rot) rot.rotation.y += delta * 0.0045;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
