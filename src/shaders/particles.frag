uniform vec3 uColor;
uniform vec3 uHot;
varying float vGlow;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float mask = smoothstep(0.5, 0.0, d);
  if (mask < 0.01) discard;
  vec3 col = mix(uColor, uHot, clamp(vGlow, 0.0, 1.0));
  gl_FragColor = vec4(col, mask * (0.45 + vGlow * 0.55));
}
