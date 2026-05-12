"use client";

import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { EarthMesh } from "./EarthMesh";
import { EarthAtmosphere } from "./EarthAtmosphere";

type Props = {
  progress: number;
  isMobile: boolean;
};

export default function EarthScene({ progress, isMobile }: Props) {
  const dpr = useMemo(() => {
    if (isMobile) return 1;
    return [1, 1.5] as [number, number];
  }, [isMobile]);

  const planetRadius = isMobile ? 1.35 : 1.45;
  const frameGroupY = isMobile ? 0.1 : -0.2;

  const camZ = isMobile ? 5.45 : 4.62;
  const camY = isMobile ? 0.1 : -0.14;

  return (
    <div className="earth-scroll-canvas" aria-hidden>
      <Canvas
        dpr={dpr}
        frameloop="always"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        camera={{ fov: 42, near: 0.1, far: 120, position: [0, camY, camZ] }}
      >
        <color attach="background" args={["#020713"]} />

        <ambientLight intensity={0.22} />
        <directionalLight
          intensity={2.65}
          position={[-4.8, 2.2, 3.6]}
          color={new THREE.Color("#dff8ff")}
        />

        <Suspense fallback={null}>
          <group position={[0, frameGroupY, 0]}>
            <EarthMesh progress={progress} isMobile={isMobile} planetRadius={planetRadius} />
            <EarthAtmosphere shellRadius={planetRadius * 1.038} />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}
