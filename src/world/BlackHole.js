import * as THREE from 'three';
import discVert from '../shaders/disc.vert';
import discFrag from '../shaders/disc.frag';

/**
 * High-end black hole centrepiece: a pure-black event horizon, a tilted
 * swirling accretion disc (shader: inward spin, Doppler asymmetry, hot inner
 * edge) and a bright photon ring hugging the horizon. Gravitational lensing of
 * the background is done in the post pass. No simulation — all shader + bloom.
 */
export default class BlackHole {
  constructor(scene, { y = -200, inner = 12, outer = 40 } = {}) {
    this.group = new THREE.Group();
    this.group.position.set(0, y, 0);
    this.radius = inner * 0.78;

    // event horizon — pure black sphere that occludes everything behind it
    this.horizon = new THREE.Mesh(
      new THREE.SphereGeometry(inner * 0.78, 48, 48),
      new THREE.MeshBasicMaterial({ color: '#000000', toneMapped: false })
    );
    this.group.add(this.horizon);

    // accretion disc — tilted, swirling shader
    this.discUniforms = {
      uTime: { value: 0 },
      uInner: { value: inner },
      uOuter: { value: outer },
      uHot: { value: new THREE.Color('#ffe2b0') }, // hot inner (warm white-amber)
      uCold: { value: new THREE.Color('#5a6ea0') } // cooler outer (blue)
    };
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(outer, 160),
      new THREE.ShaderMaterial({
        uniforms: this.discUniforms,
        vertexShader: discVert,
        fragmentShader: discFrag,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        toneMapped: false
      })
    );
    disc.rotation.x = -1.32; // ~75° tilt for the cinematic ellipse
    this.disc = disc;
    this.group.add(disc);

    // photon ring — thin intensely bright ring on the horizon edge
    this.photon = new THREE.Mesh(
      new THREE.TorusGeometry(inner * 0.92, 0.32, 16, 160),
      new THREE.MeshBasicMaterial({ color: '#fff4e2', toneMapped: false })
    );
    this.group.add(this.photon);

    scene.add(this.group);
  }

  /** world-space position (for the lensing post pass to find the centre) */
  get worldPosition() {
    return this.group.position;
  }

  update(time, camera) {
    this.discUniforms.uTime.value = time;
    // keep the horizon + photon ring facing the camera so the ring reads round
    if (camera) {
      this.horizon.quaternion.copy(camera.quaternion);
      this.photon.quaternion.copy(camera.quaternion);
    }
    const pulse = 0.9 + Math.sin(time * 0.8) * 0.1;
    this.photon.material.color.setScalar(pulse);
  }
}
