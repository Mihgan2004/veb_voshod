"use client";

import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import { earthScrollBridge } from "../earthScrollBridge";
import { earthLightingProgress } from "../earthScrollProgress";
import { getEarthSceneProfile, type EarthSceneProfile } from "../earthSceneProfile";
import { rimFragmentShader, rimVertexShader } from "../earthRimShaders";

const TEXTURE_URLS = [
  "/olivier-earth/assets/color.jpg",
  "/olivier-earth/assets/normal.png",
  "/olivier-earth/assets/occlusion.jpg",
] as const;

const SUN_RIGHT = new THREE.Vector3(3.2, 0.28, 0.55);
const sunDir = new THREE.Vector3();

function EarthScene({ profile }: { profile: EarthSceneProfile }) {
  const groupRef = useRef<THREE.Group>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const warmRef = useRef<THREE.DirectionalLight>(null);
  const invalidate = useThree((s) => s.invalidate);

  const [color, normal, aoMap] = useLoader(TextureLoader, [...TEXTURE_URLS]);

  const rimMaterial = useMemo(() => {
    if (!profile.enableRim) return null;
    return new THREE.ShaderMaterial({
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
    });
  }, [profile.enableRim]);

  const earthMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const segments = profile.segments;

  useEffect(() => {
    return () => {
      rimMaterial?.dispose();
    };
  }, [rimMaterial]);

  const applyProgress = (p: number) => {
    const t = earthLightingProgress(p);

    if (groupRef.current) {
      groupRef.current.rotation.y = p * Math.PI * (profile.isMobile ? 0.28 : 0.35);
    }

    if (sunRef.current) {
      sunRef.current.position.copy(SUN_RIGHT);
      sunRef.current.intensity = THREE.MathUtils.lerp(0.1, profile.isMobile ? 5.2 : 6.8, t);
    }
    if (warmRef.current) {
      warmRef.current.intensity = THREE.MathUtils.lerp(0, profile.isMobile ? 0.55 : 0.9, t);
    }
    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(0.006, 0.035, t);
    }

    if (rimMaterial) {
      sunDir.copy(SUN_RIGHT).normalize();
      rimMaterial.uniforms.uSunDir.value.copy(sunDir);
      rimMaterial.uniforms.uIntensity.value = THREE.MathUtils.lerp(0.03, 0.34, t);
    }

    const earthMat = earthMatRef.current;
    if (earthMat) {
      earthMat.emissiveIntensity = THREE.MathUtils.lerp(0.003, 0.045, t);
    }
  };

  useEffect(() => {
    const sync = () => {
      applyProgress(earthScrollBridge.get());
      invalidate();
    };
    sync();
    return earthScrollBridge.subscribe(sync);
  }, [profile, invalidate]);

  const rimScale = profile.earthScale * (2.506 / 2.5);

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.006} color="#000000" />
      <directionalLight ref={sunRef} intensity={0.1} position={SUN_RIGHT.toArray()} color="#fff0d8" />
      <directionalLight ref={warmRef} color="#ffd080" intensity={0} position={[2.6, 0.45, 0.75]} />

      <group ref={groupRef} position={[0, profile.earthY, 0]}>
        <mesh scale={profile.earthScale}>
          <sphereGeometry args={[1, segments, segments]} />
          <meshStandardMaterial
            ref={earthMatRef}
            map={color}
            normalMap={normal}
            aoMap={aoMap}
            emissive="#0a0804"
            emissiveIntensity={0.003}
            roughness={0.96}
            metalness={0}
          />
        </mesh>
        {rimMaterial ? (
          <mesh scale={rimScale} material={rimMaterial} renderOrder={1}>
            <sphereGeometry args={[1, segments, segments]} />
          </mesh>
        ) : null}
      </group>
    </>
  );
}

export default function EarthCanvas() {
  const [profile, setProfile] = useState(() => getEarthSceneProfile());

  useEffect(() => {
    const onResize = () => setProfile(getEarthSceneProfile());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <Canvas
      dpr={profile.dpr}
      frameloop="demand"
      camera={{ position: [0, 0, profile.cameraZ], fov: profile.fov, near: 0.1, far: 100 }}
      gl={{
        alpha: true,
        antialias: profile.antialias,
        powerPreference: "high-performance",
        stencil: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        if (profile.toneMapping) {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        } else {
          gl.toneMapping = THREE.NoToneMapping;
        }
      }}
    >
      <EarthScene profile={profile} />
    </Canvas>
  );
}
