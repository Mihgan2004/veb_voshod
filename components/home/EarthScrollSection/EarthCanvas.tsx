"use client";

import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { EarthModel } from "./EarthModel";

type Props = {
  scrollYProgress: MotionValue<number>;
};

/**
 * EarthCanvas
 *
 * @react-three/fiber Canvas + камера + свет + звёзды + солнечный блик + Земля.
 *
 * - Canvas `flat` = NoToneMapping — иначе ACESFilmic «съедает»
 *   слабые additive-блики (солнечный halo на чёрном фоне исчезает).
 * - <Starfield/> — геометрия собирается заранее через
 *   `new THREE.BufferGeometry()` и подключается через <primitive>:
 *   JSX-вариант `<bufferAttribute attach="attributes-position">`
 *   на @react-three/fiber 9 не всегда корректно «прибивает» атрибут
 *   к Points, точки могут схлопываться в (0,0,0).
 * - <SunFlare/> — спрайт с радиально-градиентной CanvasTexture.
 */
export function EarthCanvas({ scrollYProgress }: Props) {
  return (
    <Canvas
      className="earth-scroll-canvas"
      flat
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.8], fov: 38, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
      }}
      style={{ background: "#000000" }}
    >
      <color attach="background" args={["#000000"]} />

      <Starfield count={2200} radius={55} size={1.6} color="#dfe6f2" />
      <Starfield count={350} radius={42} size={2.6} color="#ffffff" />

      <SunFlare />

      <ambientLight intensity={0.55} />
      <directionalLight
        intensity={2.6}
        position={[-3.5, 2.5, 3.5]}
        color="#ffffff"
      />
      <Suspense fallback={null}>
        <EarthModel scrollYProgress={scrollYProgress} />
      </Suspense>
    </Canvas>
  );
}

/* ------------------------------------------------------------------ *
 *  Starfield — геометрия через готовый BufferGeometry + <primitive>
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

  /* Готовая геометрия — НЕ через JSX <bufferAttribute>, чтобы не
   * зависеть от того, как fiber разруливает attach=attributes-position. */
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

  /* Материал — отдельный экземпляр на каждый слой, чтобы можно было
   * крутить хоть весь PointsMaterial-state без коллизий. */
  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size,
        color,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      }),
    [size, color],
  );

  useFrame((_, delta) => {
    const p = pointsRef.current;
    if (p) p.rotation.y += delta * 0.01;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

/* ------------------------------------------------------------------ *
 *  SunFlare — далёкое «солнце» с тёплым хало
 *
 *  Спрайт всегда повёрнут к камере, поэтому остаётся идеальным
 *  кругом при любом вращении сцены. NormalBlending + транспарентный
 *  градиент → стабильное отображение даже без tonemapping.
 * ------------------------------------------------------------------ */
function SunFlare() {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const c = size / 2;
    const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
    grad.addColorStop(0.0, "rgba(255, 248, 220, 1.00)");
    grad.addColorStop(0.06, "rgba(255, 232, 175, 0.92)");
    grad.addColorStop(0.16, "rgba(255, 200, 120, 0.55)");
    grad.addColorStop(0.34, "rgba(255, 160, 70, 0.22)");
    grad.addColorStop(0.62, "rgba(255, 120, 40, 0.07)");
    grad.addColorStop(1.0, "rgba(255, 100, 0, 0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);

  if (!texture) return null;

  return (
    <group position={[8, 4.5, -38]}>
      {/* Большой тёплый ореол */}
      <sprite scale={[24, 24, 1]}>
        <spriteMaterial
          map={texture}
          transparent
          depthWrite={false}
          opacity={1}
        />
      </sprite>
      {/* Яркое плотное ядро поверх */}
      <sprite scale={[7, 7, 1]} position={[0, 0, 0.1]}>
        <spriteMaterial
          map={texture}
          transparent
          depthWrite={false}
          opacity={1}
        />
      </sprite>
    </group>
  );
}
