"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import { earthScrollBridge } from "../earthScrollBridge";
import { earthLightingProgress } from "../earthScrollProgress";
import { rimFragmentShader, rimVertexShader } from "../earthRimShaders";

const TEXTURE_URLS = [
  "/olivier-earth/assets/color.jpg",
  "/olivier-earth/assets/normal.png",
  "/olivier-earth/assets/occlusion.jpg",
] as const;

const RIM_SCALE = 2.506;
const EARTH_SCALE = 1.65;
const EARTH_Y = -0.08;

const SUN_RIGHT = new THREE.Vector3(3.2, 0.28, 0.55);
const sunDir = new THREE.Vector3();

function EarthScene() {
  const groupRef = useRef<THREE.Group>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const warmRef = useRef<THREE.DirectionalLight>(null);

  const [color, normal, aoMap] = useLoader(TextureLoader, [...TEXTURE_URLS]);

  const rimMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color("#ffcc66") },
          uSunDir: { value: new THREE.Vector3(1, 0.1, 0.2).normalize() },
          uPower: { value: 3.15 },
          uIntensity: { value: 0.04 },
          uLow: { value: 0.34 },
          uHigh: { value: 0.88 },
        },
        vertexShader: rimVertexShader,
        fragmentShader: rimFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
      }),
    []
  );

  const earthMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useEffect(() => {
    return () => {
      rimMaterial.dispose();
    };
  }, [rimMaterial]);

  useFrame(() => {
    const p = earthScrollBridge.get();
    const t = earthLightingProgress(p);

    if (groupRef.current) {
      groupRef.current.rotation.y = p * Math.PI * 0.35;
    }

    sunDir.copy(SUN_RIGHT).normalize();
    rimMaterial.uniforms.uSunDir.value.copy(sunDir);

    if (sunRef.current) {
      sunRef.current.position.copy(SUN_RIGHT);
      sunRef.current.intensity = THREE.MathUtils.lerp(0.12, 7.5, t);
    }
    if (warmRef.current) {
      warmRef.current.position.set(2.6, 0.45, 0.75);
      warmRef.current.intensity = THREE.MathUtils.lerp(0, 0.95, t);
    }
    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(0.008, 0.045, t);
    }

    rimMaterial.uniforms.uIntensity.value = THREE.MathUtils.lerp(0.03, 0.38, t);

    const earthMat = earthMatRef.current;
    if (earthMat) {
      earthMat.emissiveIntensity = THREE.MathUtils.lerp(0.004, 0.06, t);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.008} color="#06080e" />
      <directionalLight ref={sunRef} intensity={0.12} position={SUN_RIGHT.toArray()} color="#fff4e0" />
      <directionalLight ref={warmRef} color="#ffd080" intensity={0} position={[2.6, 0.45, 0.75]} />

      <group ref={groupRef} position={[0, EARTH_Y, 0]}>
        <mesh scale={EARTH_SCALE}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial
            ref={earthMatRef}
            map={color}
            normalMap={normal}
            aoMap={aoMap}
            emissive="#120e08"
            emissiveIntensity={0.004}
            roughness={0.94}
            metalness={0.02}
          />
        </mesh>
        <mesh scale={EARTH_SCALE * (RIM_SCALE / 2.5)} material={rimMaterial} renderOrder={1}>
          <sphereGeometry args={[1, 64, 64]} />
        </mesh>
      </group>
    </>
  );
}

export default function EarthCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.85], fov: 48, near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
      }}
    >
      <EarthScene />
    </Canvas>
  );
}
