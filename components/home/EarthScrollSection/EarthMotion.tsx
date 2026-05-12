"use client";

/* camera.position mutates каждый кадр в R3F — см. три.js паттерны */
/* eslint-disable react-hooks/immutability */

import React, { Suspense, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";

import { EarthSphere } from "./EarthSphere";
import { Clouds } from "./Clouds";
import { Atmosphere } from "./Atmosphere";
import {
  earthCombinedOpacity,
  earthPrepZoomT,
  getEarthTargetRotationEuler,
  lerp,
} from "./earthScrollConfig";

const EARTH_RADIUS = 1;

/**
 * Связный motion глобуса:Euler-вращение как в ТЗ + лёгкий prep-zoom камеры/
 * масштаба + плавное затухание яркости под HUD.
 */
export function EarthMotion({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const pivotRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const cloudsMeshRef = useRef<THREE.Mesh>(null);
  const atmGroupRef = useRef<THREE.Group>(null);

  const { camera } = useThree();

  useFrame((_, delta) => {
    const p = scrollYProgress.get();

    const { x: tgtX, y: tgtY } = getEarthTargetRotationEuler(p);
    const grp = pivotRef.current;
    if (grp) {
      grp.rotation.x += (tgtX - grp.rotation.x) * 0.08;
      grp.rotation.y += (tgtY - grp.rotation.y) * 0.08;
      const prepZoom = earthPrepZoomT(p);
      grp.scale.setScalar(1 + prepZoom * 0.14);
    }

    const prepCam = earthPrepZoomT(p);
    const targetCamZ = lerp(5.0, 4.28, prepCam);
    camera.position.z += (targetCamZ - camera.position.z) * 0.12;
    camera.position.x *= 0.96;
    camera.position.y *= 0.96;
    camera.lookAt(0, 0, 0);

    const op = earthCombinedOpacity(p);

    const sm = sphereRef.current?.material as THREE.ShaderMaterial | undefined;
    if (sm?.uniforms?.uOpacity != null) {
      sm.uniforms.uOpacity.value = op;
      sm.needsUpdate = true;
    }

    const cm = cloudsMeshRef.current?.material as THREE.MeshLambertMaterial | undefined;
    if (cm) {
      cm.transparent = true;
      cm.opacity = op * 0.35;
    }
    const mCloud = cloudsMeshRef.current;
    if (mCloud) mCloud.rotation.y += delta * 0.012;

    atmGroupRef.current?.traverse((obj) => {
      const mat = (obj as THREE.Mesh).material as THREE.ShaderMaterial | undefined;
      if (mat?.uniforms?.uOpacity != null) {
        mat.uniforms.uOpacity.value = op * 1.06;
        mat.needsUpdate = true;
      }
    });
  });

  return (
    <group ref={pivotRef} dispose={null}>
      <Suspense fallback={null}>
        <EarthSphere ref={sphereRef} radius={EARTH_RADIUS} />
      </Suspense>

      <Suspense fallback={null}>
        <Clouds ref={cloudsMeshRef} radius={EARTH_RADIUS} />
      </Suspense>

      <group ref={atmGroupRef}>
        <Atmosphere radius={EARTH_RADIUS} />
      </group>
    </group>
  );
}
