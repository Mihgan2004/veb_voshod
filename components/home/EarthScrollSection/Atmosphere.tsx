"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

/**
 * Atmosphere
 *
 * Холодный голубой Fresnel-ободок вокруг Земли (как на референсе).
 * Два слоя:
 *   - inner — узкая ярко-голубая «дымка» прямо у поверхности;
 *   - outer — широкое мягкое scattering halo.
 *
 * BackSide + AdditiveBlending — даёт эффект свечения «из-за» планеты.
 */
export function Atmosphere({ radius = 1 }: { radius?: number }) {
  return (
    <>
      <AtmoLayer
        radius={radius * 1.025}
        color="#7fb8ff"
        intensity={2.0}
        power={2.0}
      />
      <AtmoLayer
        radius={radius * 1.14}
        color="#3a76e6"
        intensity={1.15}
        power={3.6}
      />
    </>
  );
}

function AtmoLayer({
  radius,
  color,
  intensity,
  power,
}: {
  radius: number;
  color: string;
  intensity: number;
  power: number;
}) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uIntensity: { value: intensity },
        uPower: { value: power },
        uOpacity: { value: 1 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vView = normalize(-mvPosition.xyz);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3  uColor;
        uniform float uIntensity;
        uniform float uPower;
        uniform float uOpacity;
        varying vec3  vNormal;
        varying vec3  vView;
        void main() {
          float fresnel = pow(max(0.0, dot(-vNormal, vView)), uPower);
          gl_FragColor = vec4(uColor * uIntensity, fresnel * uOpacity);
        }
      `,
    });
  }, [color, intensity, power]);

  return (
    <mesh material={material} renderOrder={2}>
      <sphereGeometry args={[radius, 96, 96]} />
    </mesh>
  );
}
