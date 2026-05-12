"use client";

import React, { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";

import { EarthSphere } from "./EarthSphere";
import { Clouds } from "./Clouds";
import { Atmosphere } from "./Atmosphere";
import { CityMarker } from "./CityMarker";
import {
  MOSCOW_LAT,
  MOSCOW_LON,
  SOLNECHNOGORSK_LAT,
  SOLNECHNOGORSK_LON,
  clamp01,
  phaseSmooth,
  phaseVisibility,
} from "./phases";

const EARTH_RADIUS = 1;
const DEG = Math.PI / 180;

/**
 * quatToFace — кватернион, при котором точка (lat, lon) смотрит к +Z (камере).
 *
 * NASA Blue Marble/Night текстуры — антимеридиан-центрированные:
 * левый край = 180°W, центр = 0°E.
 * В EarthSphere используется phiStart=π, чтобы 90°E (Россия)
 * смотрела к камере по умолчанию.
 *
 * Формула LOCAL-координат точки (lat, lon) на сфере с phiStart=π:
 *   phi_adj = (lon + 180°) в радианах
 *   x =  cos(phi_adj) * cos(lat)
 *   y =  sin(lat)
 *   z = -sin(phi_adj) * cos(lat)
 *
 * Проверка:
 *   lon=90°E → phi_adj=270° → x=0, z=-sin(270°)=+1 → смотрит в +Z ✓
 *   lon=90°W → phi_adj= 90° → x=0, z=-sin( 90°)=-1 → смотрит в -Z ✓
 */
function quatToFace(lat: number, lon: number): THREE.Quaternion {
  const la = lat * DEG;
  const phi = (lon + 180) * DEG;
  const pt = new THREE.Vector3(
    Math.cos(phi) * Math.cos(la),
    Math.sin(la),
    -Math.sin(phi) * Math.cos(la),
  ).normalize();
  return new THREE.Quaternion().setFromUnitVectors(pt, new THREE.Vector3(0, 0, 1));
}

/**
 * EarthStage — главная 3D-сцена.
 *
 * Storyboard:
 *   PHASE 1 (0.00–0.25) hero    — Земля по центру, медленный idle-spin.
 *                                  Россия видна сразу (phiStart=π).
 *   PHASE 2 (0.25–0.50) globe   — Spin тормозит. Земля доворачивается
 *                                  Россией к камере.
 *   PHASE 3 (0.50–0.75) russia  — Камера приближается 4.6→2.8.
 *                                  Центр кадра — Москва.
 *   PHASE 4 (0.75–1.00) moscow  — Камера 2.8→2.3. Прицел Солнечногорск.
 *                                  Маркер города пульсирует.
 *
 * Ротация: quaternion slerp (нет гимбального залипания, нет ошибок знаков).
 * Камера: только zoom по Z, Earth group всегда в (0,0,0).
 */
export function EarthStage({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const earthGroupRef = useRef<THREE.Group>(null);
  const markerMoscowRef = useRef<THREE.Group>(null);
  const markerSolnRef = useRef<THREE.Group>(null);

  /* Аккумулятор time-based вращения (phase 1). */
  const spinAccumRef = useRef(0);

  /* Prealloc temp quaternions — не создаём объекты в useFrame. */
  const qSpinRef = useRef(new THREE.Quaternion());
  const qTmpRef = useRef(new THREE.Quaternion());
  const axisYRef = useRef(new THREE.Vector3(0, 1, 0));

  const { camera } = useThree();

  useMemo(() => {
    camera.position.set(0, 0, 4.6);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  /**
   * Целевые кватернионы для каждой фазы.
   * quatToFace корректно учитывает phiStart=π + NASA-текстуру.
   */
  const targets = useMemo(
    () => ({
      /* Центр России ≈ 58°N 90°E */
      russia: quatToFace(58, 90),
      /* Москва */
      moscow: quatToFace(MOSCOW_LAT, MOSCOW_LON),
      /* Солнечногорск */
      soln: quatToFace(SOLNECHNOGORSK_LAT, SOLNECHNOGORSK_LON),
    }),
    [],
  );

  useFrame((_, delta) => {
    const g = earthGroupRef.current;
    if (!g) return;

    const p = clamp01(scrollYProgress.get());

    const pGlobe = phaseSmooth(p, "globe");
    const pRussia = phaseSmooth(p, "russia");
    const pMoscow = phaseSmooth(p, "moscow");

    /* ── 1. ROTATION ─────────────────────────────────────────────── */

    /* Idle spin замедляется к концу phase 2. */
    const spinFactor = Math.max(0, 1 - pGlobe * 2.2);
    spinAccumRef.current += delta * 0.1 * spinFactor;

    qSpinRef.current.setFromAxisAngle(axisYRef.current, spinAccumRef.current);

    let qTarget: THREE.Quaternion;
    if (p < 0.5) {
      /* phase 1–2: spin → russia */
      qTarget = qSpinRef.current.clone().slerp(targets.russia, pGlobe);
    } else if (p < 0.75) {
      /* phase 3: russia → moscow */
      qTarget = qTmpRef.current.copy(targets.russia).slerp(targets.moscow, pRussia);
    } else {
      /* phase 4: moscow → soln */
      qTarget = qTmpRef.current.copy(targets.moscow).slerp(targets.soln, pMoscow);
    }

    g.quaternion.slerp(qTarget, 0.15);

    /* ── 2. GROUP POSITION — фиксирован в (0,0,0) ────────────────── */
    g.position.set(0, 0, 0);

    /* ── 3. CAMERA ZOOM ──────────────────────────────────────────── */
    const camZ =
      4.6 -
      (4.6 - 2.8) * pRussia -   /* phase 3: 4.6 → 2.8 */
      (2.8 - 2.3) * pMoscow;    /* phase 4: 2.8 → 2.3 */

    camera.position.z += (camZ - camera.position.z) * 0.14;
    camera.position.x += (0 - camera.position.x) * 0.12;
    camera.position.y += (0 - camera.position.y) * 0.12;
    camera.lookAt(0, 0, 0);

    /* ── 4. MARKERS ──────────────────────────────────────────────── */
    const moscowVis = clamp01(phaseVisibility(p, "russia", 0.04) + pRussia * 0.3);
    const solnVis = clamp01(phaseVisibility(p, "moscow", 0.04) + pMoscow * 0.35);

    if (markerMoscowRef.current) {
      markerMoscowRef.current.userData.opacity = moscowVis;
    }
    if (markerSolnRef.current) {
      markerSolnRef.current.userData.opacity = solnVis;
    }
  });

  return (
    <group ref={earthGroupRef} dispose={null}>
      <Suspense fallback={null}>
        <EarthSphere radius={EARTH_RADIUS} />
      </Suspense>

      <Suspense fallback={null}>
        <Clouds radius={EARTH_RADIUS} />
      </Suspense>

      <Atmosphere radius={EARTH_RADIUS} />

      <group ref={markerMoscowRef}>
        <CityMarker
          lat={MOSCOW_LAT}
          lon={MOSCOW_LON}
          earthRadius={EARTH_RADIUS}
          color="#9ad8ff"
        />
      </group>

      <group ref={markerSolnRef}>
        <CityMarker
          lat={SOLNECHNOGORSK_LAT}
          lon={SOLNECHNOGORSK_LON}
          earthRadius={EARTH_RADIUS}
          color="#ffffff"
        />
      </group>
    </group>
  );
}
