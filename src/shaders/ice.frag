#include "./lib/noise.glsl"

uniform sampler2D matcap;
uniform vec3 uColor;
uniform vec3 uRim;
uniform float uRimPower;
uniform float uRimStrength;
uniform float uTime;
uniform float uFrost;
uniform float uOpacity;

varying vec3 vNormalV;
varying vec3 vViewPos;
varying vec3 vPos;

void main() {
  vec3 N = normalize(vNormalV);
  vec3 viewDir = normalize(-vViewPos);

  // matcap lookup (three.js method — stable under any camera roll)
  vec3 vd = normalize(vViewPos);
  vec3 x = normalize(vec3(vd.z, 0.0, -vd.x));
  vec3 y = cross(vd, x);
  vec2 uv = vec2(dot(x, N), dot(y, N)) * 0.495 + 0.5;

  vec3 col = texture2D(matcap, uv).rgb * uColor;

  // internal frost cloud / veins
  float f = snoise(vPos * 0.9 + vec3(0.0, uTime * 0.05, 0.0));
  f += 0.5 * snoise(vPos * 2.4);
  col = mix(col, vec3(0.87, 0.89, 0.93), smoothstep(0.25, 0.95, f) * uFrost * 0.55);

  // fresnel rim glow — premium "lit glass edge" for ~free
  float fres = pow(1.0 - clamp(dot(N, viewDir), 0.0, 1.0), uRimPower);
  col += uRim * fres * uRimStrength;

  gl_FragColor = vec4(col, uOpacity);
}
