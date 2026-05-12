"use client";

import React, { forwardRef, useMemo } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";

const CLOUDS_URL = "/earth-scroll/assets/textures/clouds.png";

/**
 * Облачная полусфера; вращение движком EarthMotion через ref.
 */
export const Clouds = forwardRef<THREE.Mesh, { radius?: number }>(function Clouds(
  { radius = 1 },
  ref,
) {
  const map = useLoader(THREE.TextureLoader, CLOUDS_URL);

  const material = useMemo(() => {
    const t = map.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return new THREE.MeshLambertMaterial({
      map: t,
      transparent: true,
      depthWrite: false,
      opacity: 0.35,
      color: new THREE.Color("#cad4e8"),
      blending: THREE.NormalBlending,
    });
  }, [map]);

  return (
    <mesh ref={ref} material={material}>
      <sphereGeometry args={[radius * 1.012, 96, 96, Math.PI]} />
    </mesh>
  );
});
