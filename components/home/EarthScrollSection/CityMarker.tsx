"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { latLonToVec3 } from "./phases";

type Props = {
  lat: number;
  lon: number;
  earthRadius?: number;
  color?: string;
};

/**
 * CityMarker
 *
 * Светящаяся точка на поверхности Земли (lat/lon) + пульс-кольцо.
 *
 * Visibility: маркер читает opacity из `parent.userData.opacity` —
 * это позволяет EarthStage за один useFrame регулировать видимость
 * сразу нескольких маркеров и не конфликтовать с локальной анимацией
 * пульсации.
 *
 * Маркер живёт ВНУТРИ группы Земли, поэтому при её вращении точка
 * едет вместе с поверхностью и автоматически прячется за лимбом.
 */
export function CityMarker({ lat, lon, earthRadius = 1, color = "#9ad8ff" }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Sprite>(null);
  const coreRef = useRef<THREE.Sprite>(null);

  const position = useMemo(
    () => latLonToVec3(lat, lon, earthRadius * 1.005),
    [lat, lon, earthRadius],
  );

  const { coreTex, ringTex } = useMemo(
    () => ({ coreTex: makeRadialTexture(color), ringTex: makeRingTexture(color) }),
    [color],
  );

  useFrame((state) => {
    /* Базовый opacity от внешнего источника (EarthStage пишет его
     * в parent.userData.opacity каждый кадр). */
    const baseOpacity = clamp01(
      (groupRef.current?.parent?.userData?.opacity as number | undefined) ?? 1,
    );

    /* Пульс: расширение + затухание по локальному циклу. */
    const t = (state.clock.elapsedTime * 0.85) % 1;

    if (pulseRef.current) {
      const scale = THREE.MathUtils.lerp(0.02, 0.16, t);
      pulseRef.current.scale.set(scale, scale, 1);
      const m = pulseRef.current.material as THREE.SpriteMaterial;
      m.opacity = (1 - t) * baseOpacity;
      pulseRef.current.visible = baseOpacity > 0.005;
    }

    if (coreRef.current) {
      const m = coreRef.current.material as THREE.SpriteMaterial;
      m.opacity = baseOpacity;
      coreRef.current.visible = baseOpacity > 0.005;
    }
  });

  if (!coreTex || !ringTex) return null;

  return (
    <group ref={groupRef} position={position}>
      <sprite ref={pulseRef} scale={[0.04, 0.04, 1]}>
        <spriteMaterial map={ringTex} transparent depthWrite={false} opacity={0} />
      </sprite>
      <sprite ref={coreRef} scale={[0.05, 0.05, 1]}>
        <spriteMaterial map={coreTex} transparent depthWrite={false} opacity={0} />
      </sprite>
    </group>
  );
}

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/* ------------------------------------------------------------------ *
 *  Текстуры (генерируются один раз в браузере)
 * ------------------------------------------------------------------ */
function makeRadialTexture(colorHex: string) {
  if (typeof document === "undefined") return null;
  const size = 128;
  const cnv = document.createElement("canvas");
  cnv.width = size;
  cnv.height = size;
  const ctx = cnv.getContext("2d");
  if (!ctx) return null;
  const c = size / 2;
  const g = ctx.createRadialGradient(c, c, 0, c, c, c);
  const rgb = hexToRgb(colorHex);
  g.addColorStop(0.0, "rgba(255,255,255,1)");
  g.addColorStop(0.18, `rgba(${rgb}, 1)`);
  g.addColorStop(0.5, `rgba(${rgb}, 0.25)`);
  g.addColorStop(1.0, `rgba(${rgb}, 0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(cnv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function makeRingTexture(colorHex: string) {
  if (typeof document === "undefined") return null;
  const size = 128;
  const cnv = document.createElement("canvas");
  cnv.width = size;
  cnv.height = size;
  const ctx = cnv.getContext("2d");
  if (!ctx) return null;
  const c = size / 2;
  const rgb = hexToRgb(colorHex);
  ctx.strokeStyle = `rgba(${rgb}, 1)`;
  ctx.lineWidth = 4;
  ctx.shadowColor = `rgba(${rgb}, 0.85)`;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(c, c, c - 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.stroke();
  const tex = new THREE.CanvasTexture(cnv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function hexToRgb(hex: string): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.substring(0, 2), 16);
  const g = parseInt(m.substring(2, 4), 16);
  const b = parseInt(m.substring(4, 6), 16);
  return `${r},${g},${b}`;
}
