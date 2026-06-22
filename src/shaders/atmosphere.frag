#include "./lib/noise.glsl"

uniform vec3 uTop;
uniform vec3 uBottom;
uniform float uTime;

varying vec3 vWorldPos;
varying vec3 vNormal;

void main() {
  vec3 dir = normalize(vWorldPos);
  float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

  // deep-space gradient
  vec3 col = mix(uBottom, uTop, pow(h, 1.25));

  // cheap nebula — 2 noise samples instead of a full fbm
  float n = snoise(dir * 2.0 + vec3(0.0, uTime * 0.01, 0.0)) * 0.6
          + snoise(dir * 4.6) * 0.4;
  col += smoothstep(0.25, 0.95, n) * vec3(0.10, 0.14, 0.21) * 0.6;

  // single twinkling star layer
  float s = snoise(dir * 200.0);
  col += smoothstep(0.86, 0.999, s) * (0.6 + 0.4 * sin(uTime * 2.0 + s * 50.0));

  gl_FragColor = vec4(col, 1.0);
}
