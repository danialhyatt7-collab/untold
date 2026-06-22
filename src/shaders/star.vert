uniform float uStreak;
attribute float aSide;
attribute float aTwinkle;
varying float vAlpha;

void main() {
  vec4 view = modelViewMatrix * vec4(position, 1.0);
  // push the tail vertex deeper along view-Z so the segment streaks toward the
  // vanishing point — radial hyperspace lines that grow with scroll velocity
  view.z -= aSide * uStreak;
  gl_Position = projectionMatrix * view;

  // head bright, tail faded; plus a per-star twinkle
  float head = 1.0 - aSide * 0.75;
  vAlpha = head * aTwinkle;
}
