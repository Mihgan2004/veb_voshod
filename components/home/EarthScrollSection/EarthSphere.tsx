"use client";

import React, { forwardRef, useMemo } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";

const DAY_URL = "/earth-scroll/assets/textures/day.jpg";
const NIGHT_URL = "/earth-scroll/assets/textures/night.jpg";

/**
 * EarthSphere
 *
 * Тёмная атмосферная Земля «из космоса» — стилистика, как в референсе:
 *   - day-карта сильно затемнена и охлаждена синим тинтом
 *     (мы не хотим яркий «Blue Marble на полуденном солнце»);
 *   - night-карта со включёнными огнями городов даёт характерный
 *     ночной вид Евразии (Россия покрыта точками);
 *   - terminator холодный, без оранжевого «sunrise»;
 *   - на воде остаётся очень мягкий бликовый specular.
 *
 * Шейдер использует встроенные uniforms `cameraPosition`,
 * `modelMatrix`, `viewMatrix`, `projectionMatrix` (их three.js
 * автоматически инжектит в ShaderMaterial).
 */
export const EarthSphere = forwardRef<
  THREE.Mesh,
  {
    radius?: number;
    lightDir?: [number, number, number];
  }
>(function EarthSphere({ radius = 1, lightDir = [-0.65, 0.25, 0.7] }, ref) {
  const [dayTex, nightTex] = useLoader(THREE.TextureLoader, [DAY_URL, NIGHT_URL]);

  const material = useMemo(() => {
    const day = dayTex.clone();
    day.colorSpace = THREE.SRGBColorSpace;
    day.anisotropy = 8;

    const night = nightTex.clone();
    night.colorSpace = THREE.SRGBColorSpace;
    night.anisotropy = 8;

    return new THREE.ShaderMaterial({
      uniforms: {
        uDay: { value: day },
        uNight: { value: night },
        uLightDir: { value: new THREE.Vector3(...lightDir).normalize() },
        uMoonColor: { value: new THREE.Color("#c8d8f2") },
        uDayTint: { value: new THREE.Color("#6080aa") },
        uAmbient: { value: 0.03 },
        uDayDarkness: { value: 0.32 },
        uNightBoost: { value: 2.1 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vViewDir;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vViewDir = normalize(cameraPosition - worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uDay;
        uniform sampler2D uNight;
        uniform vec3      uLightDir;
        uniform vec3      uMoonColor;
        uniform vec3      uDayTint;
        uniform float     uAmbient;
        uniform float     uDayDarkness;
        uniform float     uNightBoost;

        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vViewDir;

        void main() {
          vec3 N = normalize(vWorldNormal);
          vec3 L = normalize(uLightDir);

          vec3 day   = texture2D(uDay,   vUv).rgb;
          vec3 night = texture2D(uNight, vUv).rgb;

          /* Затемняем «полуденный» day и охлаждаем синим тинтом. */
          vec3 dayCool = day * uDayDarkness * uDayTint;

          /* Свет (cool moonlight) + ambient. */
          float ndotl = dot(N, L);
          vec3 dayLit = dayCool * (uMoonColor * max(ndotl, 0.0) + uAmbient);

          /* Ночные огни: тёплые янтарные точки городов. */
          vec3 nightLit = night * vec3(1.5, 0.95, 0.45) * uNightBoost
                        + vec3(0.003, 0.006, 0.018);

          /* Плавный микс day↔night. Зона termin - без тёплых оттенков. */
          float dayMix = smoothstep(-0.14, 0.22, ndotl);
          vec3 color = mix(nightLit, dayLit, dayMix);

          /* Очень слабый холодный glint на terminator. */
          float term = pow(1.0 - abs(ndotl), 7.0);
          color += vec3(0.4, 0.6, 1.0) * term * 0.03;

          /* Микро-specular на воде. */
          float maxC = max(day.r, max(day.g, day.b));
          float minC = min(day.r, min(day.g, day.b));
          float water = smoothstep(0.20, 0.04, maxC - minC);
          vec3 H = normalize(L + vViewDir);
          float spec = pow(max(dot(N, H), 0.0), 64.0) * water * 0.35 * dayMix;
          color += uMoonColor * spec;

          gl_FragColor = vec4(color, 1.0);

          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    });
  }, [dayTex, nightTex, lightDir]);

  return (
    <mesh ref={ref} material={material}>
      {/*
       * phiStart = Math.PI сдвигает UV-маппинг сферы на 180°.
       * NASA Blue Marble (day.jpg, night.jpg) — антимеридиан-центрированная
       * проекция: левый край текстуры = 180°W, центр = 0°E.
       * Без сдвига к камере (+Z) смотрит Америка (90°W = U=0.25).
       * С phiStart=π к камере смотрит Россия (90°E = U=0.75). ✓
       */}
      <sphereGeometry args={[radius, 128, 128, Math.PI]} />
    </mesh>
  );
});
