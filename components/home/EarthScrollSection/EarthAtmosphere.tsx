"use client";

import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useLoader, useThree } from "@react-three/fiber";

type Props = {
  /** Slightly larger than planet mesh radius */
  shellRadius: number;
};

export function EarthAtmosphere({ shellRadius }: Props) {
  const r =
    Number.isFinite(shellRadius) && shellRadius > 0 ? shellRadius : 1.5;
  const invalidate = useThree((s) => s.invalidate);
  const rimLoaded = useLoader(THREE.TextureLoader, "/textures/space/atmosphere-rim-1024.png");

  const rim = useMemo(() => {
    const t = rimLoaded.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 2;
    return t;
  }, [rimLoaded]);

  useEffect(() => {
    invalidate();
  }, [invalidate, rim]);

  useEffect(() => {
    return () => {
      rim.dispose();
    };
  }, [rim]);

  const material = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({
      map: rim,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      color: new THREE.Color("#62e6ff"),
    });
    return m;
  }, [rim]);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  const seg = 64;

  return (
    <mesh scale={1}>
      <sphereGeometry args={[r, seg, seg]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
