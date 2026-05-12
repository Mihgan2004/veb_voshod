"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";

const CLOUDS_URL = "/earth-scroll/assets/textures/clouds.png";

/**
 * Clouds
 *
 * Полупрозрачная сфера чуть больше Земли с облачной картой.
 * Использует MeshPhongMaterial (не Standard, чтобы дешевле и без PBR
 * артефактов на полу-прозрачности), light уже задан сценой.
 *
 * Облака медленно вращаются вокруг оси Y относительно родительского
 * Earth-группы — это даёт «жизнь» сцене, даже когда сама Земля
 * стоит неподвижно на pause-фазах.
 */
export function Clouds({ radius = 1 }: { radius?: number }) {
  const map = useLoader(THREE.TextureLoader, CLOUDS_URL);
  const ref = useRef<THREE.Mesh>(null);

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

  useFrame((_, delta) => {
    const m = ref.current;
    if (m) m.rotation.y += delta * 0.012;
  });

  return (
    <mesh ref={ref} material={material}>
      {/*
       * Совпадает с EarthSphere: phiStart=π под NASA-текстуру.
       */}
      <sphereGeometry args={[radius * 1.012, 96, 96, Math.PI]} />
    </mesh>
  );
}
