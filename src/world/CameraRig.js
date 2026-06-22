import * as THREE from 'three';

/**
 * Simple framing camera for the particle stage. It holds the wordmark cloud in
 * frame, drifts subtly with the cursor (parallax) and eases a touch closer as
 * you scroll. The loader hands off from a slightly pulled-back pose.
 */
export default class CameraRig {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );

    this.mouse = new THREE.Vector2(0, 0);
    this.targetMouse = new THREE.Vector2(0, 0);
    this.warp = 0; // unused now, kept for API compatibility

    this._pos = new THREE.Vector3();
    this._look = new THREE.Vector3();
    this.camera.position.set(0, 0, 72);
  }

  setMouse(x, y) {
    this.targetMouse.set(x, y);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update(progress, time, intro = 1) {
    this.mouse.lerp(this.targetMouse, 0.05);

    const z = THREE.MathUtils.lerp(74, 64, progress);
    const introZ = intro < 1 ? (1 - intro * intro * (3 - 2 * intro)) * 26 : 0;

    const breathe = Math.sin(time * 0.3) * 0.5;
    this._pos.set(
      this.mouse.x * 5.0,
      this.mouse.y * 3.2 + breathe,
      z + introZ
    );
    this.camera.position.lerp(this._pos, 0.1);

    this._look.set(this.mouse.x * 2.0, this.mouse.y * 1.4, 0);
    this.camera.lookAt(this._look);
    this.camera.rotation.z = this.mouse.x * 0.015 + Math.sin(time * 0.2) * 0.006;
  }
}
