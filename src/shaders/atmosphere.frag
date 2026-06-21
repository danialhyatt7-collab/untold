#include "./lib/noise.glsl"

uniform vec3 uTop;
uniform vec3 uBottom;
uniform float uTime;

varying vec3 vWorldPos;
varying vec3 vNormal;

void main() {
  // vertical gradient mapped onto the inside of a large sphere
  float h = clamp((normalize(vWorldPos).y * 0.5 + 0.5), 0.0, 1.0);
  vec3 col = mix(uBottom, uTop, pow(h, 1.3));

  // slow drifting nebula haze — interstellar dust
  float n = snoise(normalize(vWorldPos) * 2.2 + vec3(0.0, uTime * 0.015, uTime * 0.01));
  n += 0.5 * snoise(normalize(vWorldPos) * 5.0 - vec3(uTime * 0.02));
  col += (n * 0.06) * vec3(0.72, 0.74, 0.82);

  // faint starfield high up
  float star = smoothstep(0.86, 0.999, snoise(normalize(vWorldPos) * 220.0));
  col += star * h * 0.5;

  gl_FragColor = vec4(col, 1.0);
}
