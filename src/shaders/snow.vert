uniform float uTime;
uniform float uSize;
uniform float uDepth;
uniform vec2 uMouse;

attribute float aScale;
attribute float aSpeed;
attribute float aPhase;

varying float vAlpha;

void main() {
  vec3 p = position;

  // continuous downward drift, wrapped within the depth column
  float fall = mod(p.y - uTime * aSpeed * 1.4, uDepth);
  p.y = fall - uDepth * 0.5;

  // lateral sway
  p.x += sin(uTime * 0.4 * aSpeed + aPhase) * 0.6;
  p.z += cos(uTime * 0.32 * aSpeed + aPhase) * 0.6;

  // subtle parallax push from cursor
  p.x += uMouse.x * (aScale * 2.0);
  p.y += uMouse.y * (aScale * 1.2);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float dist = -mv.z;
  gl_PointSize = uSize * aScale * (300.0 / max(dist, 0.001));

  // fade with distance for depth
  vAlpha = smoothstep(140.0, 8.0, dist) * 0.9;
}
