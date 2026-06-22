import * as THREE from 'three';

/**
 * Distant black hole — an Interstellar-style accretion disc far below the
 * monolith that the descent travels toward. A dark event-horizon core, a bright
 * warm photon ring and a soft outer glow, all on additive billboarded planes
 * that bloom hard. No simulation — pure texture + bloom, very cheap.
 */
export default class BlackHole {
  constructor(scene, { y = -200 } = {}) {
    this.group = new THREE.Group();
    this.group.position.set(0, y, 0);

    // event horizon — a flat black disc that occludes stars behind it
    const core = new THREE.Mesh(
      new THREE.CircleGeometry(14, 64),
      new THREE.MeshBasicMaterial({ color: '#05060a', toneMapped: false })
    );
    this.core = core;
    this.group.add(core);

    // glowing accretion disc (photon ring + glow)
    const discMat = new THREE.MeshBasicMaterial({
      map: this._discTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      opacity: 1
    });
    this.discMat = discMat;
    const disc = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), discMat);
    this.disc = disc;
    this.group.add(disc);

    // a fainter, larger halo
    const halo = disc.clone();
    halo.material = discMat.clone();
    halo.material.opacity = 0.4;
    halo.scale.setScalar(1.8);
    this.halo = halo;
    this.group.add(halo);

    scene.add(this.group);
  }

  _discTexture() {
    const s = 512;
    const c = document.createElement('canvas');
    c.width = c.height = s;
    const ctx = c.getContext('2d');
    const cx = s / 2;
    const g = ctx.createRadialGradient(cx, cx, s * 0.16, cx, cx, s * 0.5);
    g.addColorStop(0.0, 'rgba(0,0,0,0)');
    g.addColorStop(0.34, 'rgba(0,0,0,0)');
    g.addColorStop(0.42, 'rgba(255,150,70,0.05)'); // inner warm haze
    g.addColorStop(0.5, 'rgba(255,224,178,1)'); // bright photon ring
    g.addColorStop(0.54, 'rgba(255,176,110,0.85)');
    g.addColorStop(0.72, 'rgba(150,120,150,0.16)'); // cools to violet outward
    g.addColorStop(1.0, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cx, cx, 0, Math.PI * 2);
    ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  update(time, camera) {
    // billboard toward the camera (radial disc, so no spin needed)
    if (camera) {
      this.disc.quaternion.copy(camera.quaternion);
      this.halo.quaternion.copy(camera.quaternion);
      this.core.quaternion.copy(camera.quaternion);
    }
    const pulse = 0.85 + Math.sin(time * 0.6) * 0.15;
    this.discMat.opacity = pulse;
    this.halo.material.opacity = 0.32 * pulse;
  }
}
