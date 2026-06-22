varying vec3 vNormalV;
varying vec3 vViewPos;
varying vec3 vPos;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewPos = mv.xyz;
  vNormalV = normalize(normalMatrix * normal);
  vPos = position;
  gl_Position = projectionMatrix * mv;
}
