uniform sampler2D tDiffuse;
uniform vec2 uCenter;     // black-hole screen position (uv)
uniform float uAspect;
uniform float uLensR;     // lens radius
uniform float uLensS;     // lens strength
uniform float uAberr;     // chromatic aberration
uniform float uVignette;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // gravitational lensing — bend the frame toward the black hole
  vec2 toC = uv - uCenter;
  toC.x *= uAspect;
  float d = length(toC);
  vec2 dir = toC / (d + 1e-4);
  float pull = uLensS * (uLensR * uLensR) / (d * d + uLensR * uLensR);
  vec2 luv = uv;
  luv.x -= dir.x / uAspect * pull;
  luv.y -= dir.y * pull;

  // chromatic aberration, growing toward the edges
  float dc = length((vUv - 0.5) * vec2(uAspect, 1.0));
  vec2 off = dir * uAberr * (0.25 + dc);
  off.x /= uAspect;
  float r = texture2D(tDiffuse, luv + off).r;
  float g = texture2D(tDiffuse, luv).g;
  float b = texture2D(tDiffuse, luv - off).b;
  vec3 col = vec3(r, g, b);

  // filmic-ish grade: lift contrast, crush blacks slightly, light desaturate
  col = (col - 0.5) * 1.1 + 0.5;
  col = max(col - 0.012, 0.0);
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(l), col, 0.9);

  // vignette
  float vig = smoothstep(0.95, 0.28, dc);
  col *= mix(1.0 - uVignette, 1.0, vig);

  gl_FragColor = vec4(col, 1.0);
}
