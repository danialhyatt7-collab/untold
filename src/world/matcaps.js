import * as THREE from 'three';

/**
 * Procedural matcap textures — a "lit sphere" baked into a canvas so
 * MeshMatcap-style shading needs no lights and no PBR math (very cheap, very
 * premium-looking). Memoised so each variant is built once.
 */
const cache = {};

function build({ base, top, bottom, spec, rim, specAt = [0.38, 0.34], specR = 0.42 }) {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');

  // vertical body gradient (top-lit sphere)
  const g = ctx.createLinearGradient(0, 0, 0, s);
  g.addColorStop(0, top);
  g.addColorStop(0.5, base);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);

  // cool rim light around the silhouette
  const rg = ctx.createRadialGradient(s / 2, s / 2, s * 0.32, s / 2, s / 2, s * 0.5);
  rg.addColorStop(0, 'rgba(0,0,0,0)');
  rg.addColorStop(1, rim);
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, s, s);

  // specular highlight
  const sg = ctx.createRadialGradient(
    s * specAt[0], s * specAt[1], 0,
    s * specAt[0], s * specAt[1], s * specR
  );
  sg.addColorStop(0, spec);
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, s, s);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function iceMatcap() {
  return (cache.ice ||= build({
    top: '#cfd4dd',
    base: '#9aa0ad',
    bottom: '#3f4452',
    spec: 'rgba(244,247,251,0.9)',
    rim: 'rgba(150,160,180,0.35)'
  }));
}

export function metalMatcap() {
  return (cache.metal ||= build({
    top: '#e7eaf1',
    base: '#8a909e',
    bottom: '#262a33',
    spec: 'rgba(255,255,255,0.95)',
    rim: 'rgba(120,132,156,0.5)',
    specAt: [0.34, 0.3],
    specR: 0.3
  }));
}
