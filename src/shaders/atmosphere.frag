#include "./lib/noise.glsl"

uniform vec3 uTop;
uniform vec3 uBottom;
uniform float uTime;

varying vec3 vWorldPos;
varying vec3 vNormal;

float fbm(vec3 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * snoise(p); p *= 2.02; a *= 0.5; }
  return v;
}

void main() {
  vec3 dir = normalize(vWorldPos);
  float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

  // deep-space vertical gradient
  vec3 col = mix(uBottom, uTop, pow(h, 1.25));

  // drifting nebula — layered fbm, cool teal bleeding into faint violet
  vec3 np = dir * 2.1 + vec3(0.0, uTime * 0.012, uTime * 0.007);
  float n = fbm(np);
  float n2 = fbm(np * 2.3 + 9.0);
  vec3 neb = mix(vec3(0.10, 0.17, 0.24), vec3(0.18, 0.14, 0.26), smoothstep(0.0, 1.0, n2));
  col += smoothstep(0.15, 0.95, n) * neb * 0.65;

  // a brighter cosmic core low on the horizon (where the black hole sits)
  float core = smoothstep(0.55, 0.0, length(dir.xz)) * smoothstep(0.0, -0.5, dir.y);
  col += core * vec3(0.16, 0.13, 0.10) * 0.5;

  // starfield with twinkle
  float s = snoise(dir * 230.0);
  float star = smoothstep(0.84, 0.999, s);
  float tw = 0.55 + 0.45 * sin(uTime * 2.5 + s * 60.0);
  col += star * tw;
  // a sparser layer of brighter stars
  float s2 = snoise(dir * 90.0 + 5.0);
  col += smoothstep(0.93, 0.999, s2) * (0.7 + 0.3 * sin(uTime * 1.7 + s2 * 30.0));

  gl_FragColor = vec4(col, 1.0);
}
