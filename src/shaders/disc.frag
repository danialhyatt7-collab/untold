uniform float uTime;
uniform float uInner;
uniform float uOuter;
uniform vec3 uHot;
uniform vec3 uCold;

varying vec2 vLocal;

// cheap value noise for swirling banding
float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}

void main() {
  float r = length(vLocal);
  if (r < uInner || r > uOuter) discard;

  float t = (r - uInner) / (uOuter - uInner); // 0 inner -> 1 outer
  float ang = atan(vLocal.y, vLocal.x);

  // matter swirling inward (rotation faster near the centre)
  float spin = uTime * (1.6 + (1.0 - t) * 2.2);
  float bands = vnoise(vec2(ang * 3.0 + spin, r * 0.25 - uTime * 0.4));
  bands *= vnoise(vec2(ang * 9.0 - spin * 0.5, r * 0.6));

  // hot inner edge falling off outward, modulated by the swirling matter
  float bright = pow(1.0 - t, 1.7) * (0.45 + 0.85 * bands);

  // relativistic Doppler — the side rotating toward us is much brighter
  bright *= 0.35 + 1.1 * smoothstep(-1.0, 1.0, sin(ang + 0.6));

  // crisp soft edges
  float edge = smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.78, t);

  vec3 col = mix(uHot, uCold, pow(t, 0.7));
  gl_FragColor = vec4(col * bright, clamp(bright, 0.0, 1.0) * edge);
}
