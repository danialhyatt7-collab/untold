import * as THREE from 'three';
import vertexShader from '../shaders/particles.vert';
import fragmentShader from '../shaders/particles.frag';

/**
 * The centrepiece: a cloud of GPU points that morphs between wordmarks as you
 * scroll — untold → AIRBEAT → DIMENSIONS → AWAKENING → untold. Each word is
 * sampled from an offscreen canvas into a target buffer; the shader lerps
 * between two targets (uFrom/uTo/uMix), adds beat-driven energy drift and
 * cursor repulsion. One Points draw call.
 */
const WORDS = ['untold', 'AIRBEAT', 'DIMENSIONS', 'AWAKENING'];
// scroll path through the words (untold bookends it)
const PATH = [0, 1, 2, 3, 0];
const BPM = 124;

export default class ParticleField {
  constructor(scene, { count = 65000, font = 'Syne' } = {}) {
    this.count = count;
    this.font = font;

    const geo = new THREE.BufferGeometry();
    // a base position attribute is required; reuse target 0
    const t0 = this._sample(WORDS[0], count);
    geo.setAttribute('position', new THREE.BufferAttribute(t0.slice(), 3));
    geo.setAttribute('aT0', new THREE.BufferAttribute(t0, 3));
    geo.setAttribute('aT1', new THREE.BufferAttribute(this._sample(WORDS[1], count), 3));
    geo.setAttribute('aT2', new THREE.BufferAttribute(this._sample(WORDS[2], count), 3));
    geo.setAttribute('aT3', new THREE.BufferAttribute(this._sample(WORDS[3], count), 3));

    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) rand[i] = Math.random();
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));

    this.uniforms = {
      uFrom: { value: 0 },
      uTo: { value: 1 },
      uMix: { value: 0 },
      uTime: { value: 0 },
      uBeat: { value: 0 },
      uSize: { value: 1.5 },
      uMouse: { value: new THREE.Vector2(999, 999) },
      uColor: { value: new THREE.Color('#aeb3c0') }, // moody frost
      uHot: { value: new THREE.Color('#eef1f7') } // bright core on energy/beat
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending
    });

    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    scene.add(this.points);

    this.mouse = new THREE.Vector2(999, 999);
    this.targetMouse = new THREE.Vector2(999, 999);
  }

  /** sample a word rendered to canvas into `count` world-space points */
  _sample(text, count) {
    const W = 1200;
    const H = 320;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let size = 260;
    const setFont = () => (ctx.font = `800 ${size}px ${this.font}, "Arial Black", sans-serif`);
    setFont();
    while (ctx.measureText(text).width > W * 0.9 && size > 24) {
      size -= 8;
      setFont();
    }
    ctx.fillText(text, W / 2, H / 2 + 4);

    const data = ctx.getImageData(0, 0, W, H).data;
    const pts = [];
    for (let y = 0; y < H; y += 2) {
      for (let x = 0; x < W; x += 2) {
        if (data[(y * W + x) * 4] > 130) pts.push(x, y);
      }
    }

    const arr = new Float32Array(count * 3);
    const worldW = 52;
    const worldH = (worldW * H) / W;
    const n = pts.length / 2;
    for (let i = 0; i < count; i++) {
      let px, py;
      if (n > 0) {
        const j = (Math.random() * n) | 0;
        px = pts[j * 2] + (Math.random() - 0.5) * 2.2;
        py = pts[j * 2 + 1] + (Math.random() - 0.5) * 2.2;
      } else {
        px = Math.random() * W;
        py = Math.random() * H;
      }
      arr[i * 3] = (px / W - 0.5) * worldW;
      arr[i * 3 + 1] = -(py / H - 0.5) * worldH;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }

  /** regenerate targets once the real font has loaded (sharper letterforms) */
  refit() {
    const g = this.points.geometry;
    ['aT0', 'aT1', 'aT2', 'aT3'].forEach((name, i) => {
      g.attributes[name].array.set(this._sample(WORDS[i], this.count));
      g.attributes[name].needsUpdate = true;
    });
  }

  setMouse(worldX, worldY) {
    this.targetMouse.set(worldX, worldY);
  }

  update(progress, time) {
    // morph path
    const stops = PATH.length;
    const f = Math.max(0, Math.min(1, progress)) * (stops - 1);
    const seg = Math.min(Math.floor(f), stops - 2);
    this.uniforms.uFrom.value = PATH[seg];
    this.uniforms.uTo.value = PATH[seg + 1];
    this.uniforms.uMix.value = f - seg;

    // implied beat
    const phase = time * (BPM / 60);
    this.uniforms.uBeat.value = Math.pow(Math.max(Math.sin(phase * Math.PI * 2), 0), 8);

    this.uniforms.uTime.value = time;
    this.mouse.lerp(this.targetMouse, 0.12);
    this.uniforms.uMouse.value.copy(this.mouse);
  }
}
