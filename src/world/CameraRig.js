import * as THREE from 'three';

/**
 * A scroll-driven descending camera flight.
 * scroll 0 -> 1 maps to a continuous downward glide through the ice column,
 * with cursor-reactive parallax layered on top (no seams, one flight).
 */
export default class CameraRig {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );

    // descent column (world units)
    this.topY = 26;
    this.bottomY = -150;

    this.scroll = 0; // eased 0..1
    this.mouse = new THREE.Vector2(0, 0); // eased -1..1
    this.targetMouse = new THREE.Vector2(0, 0);
    this.baseFov = 42;
    this.warp = 0; // 0..1 travel speed -> widens FOV for an acceleration feel

    this._pos = new THREE.Vector3();
    this._look = new THREE.Vector3();

    this.camera.position.set(0, this.topY, 30);
  }

  setMouse(x, y) {
    this.targetMouse.set(x, y);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  /**
   * @param {number} scroll eased scroll progress 0..1
   * @param {number} time   seconds
   * @param {number} intro  0 = loader framing (tight on the cap), 1 = full flight
   */
  update(scroll, time, intro = 1) {
    this.scroll = scroll;
    this.mouse.lerp(this.targetMouse, 0.06);

    const y = THREE.MathUtils.lerp(this.topY, this.bottomY, scroll);

    // gentle spiral so the descent reveals the monolith's faces
    const spiral = scroll * Math.PI * 1.4;
    const radius = THREE.MathUtils.lerp(30, 16, Math.min(scroll * 1.5, 1));
    const baseX = Math.sin(spiral) * radius;
    const baseZ = Math.cos(spiral) * radius;

    // cursor parallax + idle breathing
    const breathe = Math.sin(time * 0.3) * 0.4;
    this._pos.set(
      baseX + this.mouse.x * 4.0,
      y + this.mouse.y * 2.2 + breathe,
      baseZ
    );

    // intro framing: tight, head-on on the glowing cap near the top
    if (intro < 1) {
      const eased = intro * intro * (3 - 2 * intro); // smoothstep
      const introPos = this._tmpIntro || (this._tmpIntro = new THREE.Vector3());
      introPos.set(0, 16, 11); // close on the cap (cap sits at y=16)
      this._pos.lerpVectors(introPos, this._pos, eased);
    }

    this.camera.position.lerp(this._pos, intro < 1 ? 1 : 0.12);

    // always look toward the column centre, slightly ahead/down the flight
    this._look.set(
      this.mouse.x * 1.4,
      y - 6 - this.mouse.y * 1.0,
      0
    );
    if (intro < 1) {
      const eased = intro * intro * (3 - 2 * intro);
      this._look.y = THREE.MathUtils.lerp(16, this._look.y, eased);
    }
    this.camera.lookAt(this._look);

    // subtle dolly-roll for the weightless feel
    this.camera.rotation.z = this.mouse.x * 0.03 + Math.sin(time * 0.2) * 0.01;

    // speed-reactive FOV — widening lens reads as acceleration into space
    const targetFov = this.baseFov + this.warp * 14;
    if (Math.abs(targetFov - this.camera.fov) > 0.01) {
      this.camera.fov += (targetFov - this.camera.fov) * 0.1;
      this.camera.updateProjectionMatrix();
    }
  }
}
