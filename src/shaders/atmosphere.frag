uniform vec3 uTop;
uniform vec3 uBottom;
uniform float uTime;

varying vec3 vWorldPos;
varying vec3 vNormal;

void main() {
  vec3 dir = normalize(vWorldPos);
  float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(uBottom, uTop, pow(h, 1.3));

  // a faint, slow-breathing centre glow so the dark never feels flat
  float c = smoothstep(0.7, 0.0, length(dir.xy));
  col += c * vec3(0.05, 0.06, 0.08) * (0.7 + 0.3 * sin(uTime * 0.4));

  gl_FragColor = vec4(col, 1.0);
}
