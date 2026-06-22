import * as THREE from 'three';

/**
 * Fake reflective floor — a single horizontal plane at the bottom of the
 * descent. It uses the scene environment for a wet-ice sheen (no render-target
 * reflection pass) and fades to transparent at its edges so it dissolves into
 * the fog. A thin additive streak under the seam fakes the monolith's
 * reflection. One draw call, grounds the final slides like the frozen-lake ref.
 */
export default class Floor {
  constructor(scene, { y = -128 } = {}) {
    this.group = new THREE.Group();
    this.group.position.y = y;

    const mat = new THREE.MeshStandardMaterial({
      color: '#6c7280',
      metalness: 1.0,
      roughness: 0.14, // glossy frozen lake
      envMapIntensity: 1.6,
      transparent: true,
      alphaMap: this._fadeTexture(),
      depthWrite: false
    });
    this.mat = mat;
    const plane = new THREE.Mesh(new THREE.CircleGeometry(220, 64), mat);
    plane.rotation.x = -Math.PI / 2;
    this.group.add(plane);

    // faked seam reflection — a glowing blade lying on the ice under x=0
    const streakMat = new THREE.MeshBasicMaterial({
      map: this._reflectTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      opacity: 0.7
    });
    this.streakMat = streakMat;
    const streak = new THREE.Mesh(new THREE.PlaneGeometry(6, 150), streakMat);
    streak.rotation.x = -Math.PI / 2;
    streak.position.set(0, 0.05, -40);
    this.group.add(streak);

    scene.add(this.group);
  }

  _fadeTexture() {
    const s = 256;
    const c = document.createElement('canvas');
    c.width = c.height = s;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.4)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    const t = new THREE.CanvasTexture(c);
    return t;
  }

  _reflectTexture() {
    const w = 64;
    const h = 512;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    const gx = ctx.createLinearGradient(0, 0, w, 0);
    gx.addColorStop(0, 'rgba(0,0,0,0)');
    gx.addColorStop(0.5, 'rgba(255,255,255,0.9)');
    gx.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gx;
    ctx.fillRect(0, 0, w, h);
    // fade along length (reflection breaks up with distance)
    const gy = ctx.createLinearGradient(0, 0, 0, h);
    gy.addColorStop(0, 'rgba(0,0,0,1)');
    gy.addColorStop(0.5, 'rgba(0,0,0,0)');
    gy.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = gy;
    ctx.fillRect(0, 0, w, h);
    return new THREE.CanvasTexture(c);
  }

  update(time) {
    this.streakMat.opacity = 0.45 + (Math.sin(time * 0.8) * 0.5 + 0.5) * 0.35;
  }
}
