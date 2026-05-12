"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useLoader, useThree } from "@react-three/fiber";
import {
  EARTH_PHASE_CAMERA_DOLLY,
  EARTH_PHASE_EARTH_FULL_ROTATE,
  EARTH_PHASE_EARTH_SETTLE,
  EARTH_ROTATE_RANGE,
  clamp,
  smoothstep,
} from "./earthScrollConfig";

type Props = {
  progress: number;
  isMobile: boolean;
  planetRadius: number;
};

export function EarthMesh({ progress, isMobile, planetRadius }: Props) {
  const safeProgress = clamp(Number.isFinite(progress) ? progress : 0, 0, 1);
  const safeRadius =
    Number.isFinite(planetRadius) && planetRadius > 0 ? planetRadius : isMobile ? 1.35 : 1.45;
  const invalidate = useThree((s) => s.invalidate);
  const group = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const cloudMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const seg = Math.min(128, Math.max(8, isMobile ? 64 : 96));

  const urls = useMemo(() => {
    return {
      day: isMobile ? "/textures/earth/earth-day-1024x512.webp" : "/textures/earth/earth-day-2048x1024.webp",
      clouds: isMobile
        ? "/textures/earth/earth-clouds-alpha-1024x512.webp"
        : "/textures/earth/earth-clouds-alpha-2048x1024.webp",
    };
  }, [isMobile]);

  const [dayLoaded, cloudsLoaded] = useLoader(THREE.TextureLoader, [urls.day, urls.clouds]);

  const { day, clouds } = useMemo(() => {
    const dayTex = dayLoaded.clone();
    const cloudTex = cloudsLoaded.clone();
    for (const t of [dayTex, cloudTex]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = isMobile ? 2 : 4;
    }
    return { day: dayTex, clouds: cloudTex };
  }, [cloudsLoaded, dayLoaded, isMobile]);

  useEffect(() => {
    invalidate();
    return () => {
      day.dispose();
      clouds.dispose();
    };
  }, [clouds, day, invalidate]);

  const initialRotationY = -0.65;

  const meshZ = useMemo(() => {
    const p = safeProgress;
    const pull = smoothstep(EARTH_PHASE_CAMERA_DOLLY[0], EARTH_PHASE_CAMERA_DOLLY[1], p);
    const amp = isMobile ? 0.36 : 0.42;
    const settle = smoothstep(EARTH_PHASE_EARTH_SETTLE[0], EARTH_PHASE_EARTH_SETTLE[1], p);
    const z = pull * amp - settle * 0.07;
    return Number.isFinite(z) ? z : 0;
  }, [isMobile, safeProgress]);

  const { rotX, rotY } = useMemo(() => {
    const p = safeProgress;
    const spin =
      smoothstep(EARTH_ROTATE_RANGE[0], EARTH_ROTATE_RANGE[1], p) * Math.PI * 1.15;
    const settle = smoothstep(EARTH_PHASE_EARTH_SETTLE[0], EARTH_PHASE_EARTH_SETTLE[1], p);
    const rotYBase = initialRotationY + spin * (1 - settle * 0.88) + settle * 0.08;
    const rotXVal =
      0.17 +
      smoothstep(EARTH_PHASE_CAMERA_DOLLY[0], EARTH_PHASE_CAMERA_DOLLY[1], p) * 0.05 +
      smoothstep(EARTH_PHASE_EARTH_SETTLE[0], EARTH_PHASE_EARTH_SETTLE[1], p) * 0.02;
    const rx = Number.isFinite(rotXVal) ? rotXVal : 0.17;
    const ry = Number.isFinite(rotYBase) ? rotYBase : initialRotationY;
    return { rotX: rx, rotY: ry };
  }, [initialRotationY, safeProgress]);

  useLayoutEffect(() => {
    if (!group.current) return;
    group.current.rotation.set(rotX, rotY, 0);
    group.current.position.set(0, 0, meshZ);
    group.current.scale.setScalar(isMobile ? 0.95 : 1);

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = rotY * 1.015;
    }

    const cloudMat = cloudMatRef.current;
    if (cloudMat) {
      const base = isMobile ? 0.1 : 0.14;
      const op =
        base +
        smoothstep(
          EARTH_PHASE_EARTH_FULL_ROTATE[0],
          EARTH_PHASE_EARTH_FULL_ROTATE[1],
          safeProgress,
        ) * 0.06;
      cloudMat.opacity = Number.isFinite(op) ? op : base;
    }

    invalidate();
  }, [invalidate, isMobile, meshZ, rotX, rotY, safeProgress]);

  const cloudShell = safeRadius * 1.012;

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[safeRadius, seg, seg]} />
        <meshStandardMaterial map={day} roughness={1} metalness={0} />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[cloudShell, seg, seg]} />
        <meshStandardMaterial
          ref={cloudMatRef}
          map={clouds}
          transparent
          opacity={0}
          roughness={1}
          metalness={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
