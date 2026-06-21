uniform vec3 uColor;
varying float vAlpha;

void main() {
  // soft round particle
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float mask = smoothstep(0.5, 0.0, d);
  if (mask < 0.01) discard;
  gl_FragColor = vec4(uColor, mask * vAlpha);
}
