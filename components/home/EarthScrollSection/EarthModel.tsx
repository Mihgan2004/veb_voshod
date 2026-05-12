"use client";

import React, {
  Component,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { MotionValue } from "framer-motion";

const TERRA_URL = "/earth-scroll/assets/TERRA.glb";
const COLOR_URL = "/earth-scroll/assets/color.jpg";
const NORMAL_URL = "/earth-scroll/assets/normal.png";
const OCCLUSION_URL = "/earth-scroll/assets/occlusion.jpg";

/* Target world-size: модель скейлится так, чтобы её bounding sphere
 * имела диаметр ~1.8 ед. При camera z=4.8 и fov=38 это даёт Земле
 * ~50% высоты viewport — соответствует поведению Olivier Larose. */
const TARGET_DIAMETER = 1.8;

/* Стартовый наклон модели — даёт сразу видимую «полусферу» вместо
 * плоского экватора и фиксирует, что Земля наклонена ~как глобус. */
const BASE_ROTATION_Y = -0.7;
const BASE_ROTATION_X = 0.15;

/* Сколько полных оборотов за полную секцию (progress 0..1). */
const FULL_TURNS = 1;

type Props = {
  /** Scroll progress 0..1 (motion value from framer-motion useScroll). */
  scrollYProgress: MotionValue<number>;
};

/**
 * EarthModel
 *
 * Архитектура — Olivier Larose `3d-earth-scroll`:
 *   - модель Земли — `useGLTF` из @react-three/drei (TERRA.glb);
 *   - rotation.y управляется scroll-прогрессом 0..1 с лёгким
 *     smoothstep-стартом (rotation начинается сразу, а не в конце);
 *   - rotation.x задаётся базовым наклоном + микро-«дыхание»;
 *   - lerp в useFrame даёт мягкое поведение даже на резком скролле.
 *
 * ErrorBoundary: если TERRA.glb битый/отсутствует — рендерим
 * sphereGeometry с color/normal/occlusion-картами (визуально похоже).
 */
export function EarthModel({ scrollYProgress }: Props) {
  return (
    <EarthBoundary fallback={<EarthFallbackSphere scrollYProgress={scrollYProgress} />}>
      <EarthGLBMesh scrollYProgress={scrollYProgress} />
    </EarthBoundary>
  );
}

/* ------------------------------------------------------------------ *
 *  Primary: GLB-based Earth
 * ------------------------------------------------------------------ */
function EarthGLBMesh({ scrollYProgress }: Props) {
  const { scene } = useGLTF(TERRA_URL);

  /* Клонируем сцену + нормализуем масштаб по bounding-box, чтобы
   * не зависеть от того, как был экспортирован TERRA.glb. */
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0 && Number.isFinite(maxDim)) {
      c.scale.setScalar(TARGET_DIAMETER / maxDim);
    }
    /* центрируем геометрию на (0,0,0) — иначе Земля может «уезжать» */
    const center = box.getCenter(new THREE.Vector3()).multiplyScalar(TARGET_DIAMETER / Math.max(maxDim, 1));
    c.position.sub(center);
    return c;
  }, [scene]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    applyEarthRotation(g, scrollYProgress.get());
  });

  /* Стартовая поза, чтобы первый кадр НЕ был с rotation 0/0
   * (иначе можно увидеть «плоский экватор», пока lerp ещё догоняет). */
  return (
    <group ref={groupRef} rotation={[BASE_ROTATION_X, BASE_ROTATION_Y, 0]} dispose={null}>
      <primitive object={cloned} />
    </group>
  );
}

/* Pre-trigger asset prefetch в браузере. */
useGLTF.preload?.(TERRA_URL);

/* ------------------------------------------------------------------ *
 *  Fallback: textured sphere (используется если TERRA.glb битый)
 * ------------------------------------------------------------------ */
function EarthFallbackSphere({ scrollYProgress }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const [colorRaw, normalRaw, aoRaw] = useLoader(THREE.TextureLoader, [
    COLOR_URL,
    NORMAL_URL,
    OCCLUSION_URL,
  ]);

  const { colorMap, normalMap, aoMap } = useMemo(() => {
    const c = colorRaw.clone();
    c.colorSpace = THREE.SRGBColorSpace;
    return { colorMap: c, normalMap: normalRaw.clone(), aoMap: aoRaw.clone() };
  }, [colorRaw, normalRaw, aoRaw]);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    applyEarthRotation(g, scrollYProgress.get());
  });

  return (
    <group ref={groupRef} rotation={[BASE_ROTATION_X, BASE_ROTATION_Y, 0]}>
      <mesh>
        <sphereGeometry args={[TARGET_DIAMETER / 2, 96, 96]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          aoMap={aoMap}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 *  Rotation logic — общая для GLB и fallback
 * ------------------------------------------------------------------ */
function applyEarthRotation(g: THREE.Group, rawProgress: number) {
  const p = clamp01(rawProgress);
  /* smoothstep даёт лёгкий ease-in на старте (0..0.02), но дальше
   * rotation идёт ровно на ВСЁМ диапазоне progress.
   * НЕ привязываем rotation к [0.8, 1] — иначе вращение начинается
   * только в самом конце секции. */
  const rotateProgress = smoothstep(0.02, 1.0, p);

  const targetY = BASE_ROTATION_Y + rotateProgress * Math.PI * 2 * FULL_TURNS;
  const targetX = BASE_ROTATION_X + Math.sin(p * Math.PI) * 0.08;

  /* lerp для мягкости + работает с Lenis-инерцией */
  g.rotation.y += (targetY - g.rotation.y) * 0.12;
  g.rotation.x += (targetX - g.rotation.x) * 0.12;
}

/* ------------------------------------------------------------------ *
 *  ErrorBoundary
 * ------------------------------------------------------------------ */
type BoundaryState = { hasError: boolean };
class EarthBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { hasError: false };
  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[EarthModel] GLB failed, using sphere fallback:", error);
    }
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/* ------------------------------------------------------------------ *
 *  utils
 * ------------------------------------------------------------------ */
function clamp01(v: number) {
  if (!Number.isFinite(v)) return 0;
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}
