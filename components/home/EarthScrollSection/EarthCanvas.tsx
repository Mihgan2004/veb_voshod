"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

import { EarthStage } from "./EarthStage";

type Props = {
  scrollYProgress: MotionValue<number>;
};

/**
 * EarthCanvas
 *
 * Хост @react-three/fiber Canvas. Сцена:
 *   - Starfield: 2 слоя — фоновые звёзды + ближние яркие
 *     (дальняя сфера = 140u — звёзды на любом zoom видны);
 *   - directionalLight: холодный лунный свет (#dde6ff),
 *     синхронизирован с lightDir в EarthSphere shader;
 *   - EarthStage: Земля + атмосфера + облака + анимация камеры.
 *
 * Никакого «жёлтого солнца» на сцене — это противоречит
 * запрашиваемой холодной cinematic-эстетике.
 *
 * `flat` (NoToneMapping) — иначе тонкие atmospheric Fresnel-блики
 * приглушаются ACESFilmic.
 */
export function EarthCanvas({ scrollYProgress }: Props) {
  return (
    <Canvas
      className="earth-scroll-canvas"
      flat
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.6], fov: 36, near: 0.01, far: 400 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
      }}
      style={{ background: "#02050d" }}
    >
      <color attach="background" args={["#02050d"]} />

      <Starfield count={2400} radius={160} size={1.3} color="#cfd8e8" />
      <Starfield count={420} radius={120} size={2.4} color="#ffffff" />

      <ambientLight intensity={0.05} color="#7c8db3" />
      <directionalLight
        intensity={1.15}
        position={[-6.5, 2.5, 7]}
        color="#dde6ff"
      />

      <EarthStage scrollYProgress={scrollYProgress} />
    </Canvas>
  );
}

/* ------------------------------------------------------------------ *
 *  Starfield — два слоя простых point-звёзд
 * ------------------------------------------------------------------ */
function Starfield({
  count,
  radius,
  size,
  color,
}: {
  count: number;
  radius: number;
  size: number;
  color: string;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * (0.85 + Math.random() * 0.3);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count, radius]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size,
        color,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.78,
        depthWrite: false,
      }),
    [size, color],
  );

  useFrame((_, delta) => {
    const p = pointsRef.current;
    if (p) p.rotation.y += delta * 0.005;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
