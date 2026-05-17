/** Fresnel по лимбу только на стороне, обращённой к солнцу (справа). */

export const rimVertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
  vec3 n = normalize(normalMatrix * normal);
  vNormal = n;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const rimFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uSunDir;
uniform float uPower;
uniform float uIntensity;
uniform float uLow;
uniform float uHigh;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  float ndv = clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0);
  float rim = pow(1.0 - ndv, uPower);
  rim = smoothstep(uLow, uHigh, rim);

  float sunSide = dot(normalize(vNormal), normalize(uSunDir));
  float sunMask = smoothstep(0.02, 0.38, sunSide);

  gl_FragColor = vec4(uColor, rim * uIntensity * sunMask);
}
`;
