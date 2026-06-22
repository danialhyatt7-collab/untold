uniform float uFrom;
uniform float uTo;
uniform float uMix;
uniform float uTime;
uniform float uBeat;
uniform float uSize;
uniform vec2 uMouse;

attribute vec3 aT0;
attribute vec3 aT1;
attribute vec3 aT2;
attribute vec3 aT3;
attribute float aRand;

varying float vGlow;

vec3 pick(float idx) {
  vec3 p = aT0;
  p = mix(p, aT1, step(0.5, idx));
  p = mix(p, aT2, step(1.5, idx));
  p = mix(p, aT3, step(2.5, idx));
  return p;
}

void main() {
  vec3 a = pick(uFrom);
  vec3 b = pick(uTo);
  float m = smoothstep(0.0, 1.0, uMix);
  vec3 pos = mix(a, b, m);

  // energy drift — never still; peaks mid-morph and kicks on the beat
  float morphEnergy = sin(m * 3.14159);
  float drift = 0.22 + morphEnergy * 1.4 + uBeat * 0.7;
  vec3 n = vec3(
    sin(uTime * 1.3 + aRand * 6.28 + pos.y * 0.25),
    cos(uTime * 1.1 + aRand * 5.0 + pos.x * 0.25),
    sin(uTime * 0.9 + aRand * 4.0)
  );
  pos += n * drift * (0.4 + aRand * 0.7);

  // cursor parts the cloud and it flows back
  vec2 d = pos.xy - uMouse;
  float dist = length(d);
  float rad = 10.0;
  if (dist < rad) {
    pos.xy += normalize(d + 0.001) * (rad - dist) * 0.55;
  }

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float sizePulse = 1.0 + uBeat * 0.9;
  gl_PointSize = uSize * sizePulse * (0.55 + aRand * 0.85) * (260.0 / -mv.z);

  vGlow = 0.45 + morphEnergy * 0.55 + uBeat * 0.5;
}
