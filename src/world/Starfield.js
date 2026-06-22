import * as THREE from 'three';
import vertexShader from '../shaders/star.vert';
import fragmentShader from '../shaders/star.frag';

/**
 * Warp starfield. Each star is a 2-vertex segment whose tail is pushed back
 * along view-Z by `uStreak`, so the stars sit as faint dots at rest and stretch
 * into radial hyperspace streaks the faster you scroll. The field follows the
 * camera so it never runs out. One LineSegments draw call — basically free.
 */
export default class Starfield {
  constructor(scene, { count = 1000, radius = 150, color = '#b9c2d8' } = {}) {
    const positions = new Float32Array(count * 2 * 3);
    const sides = new Float32Array(count * 2);
    const twinkle = new Float32Array(count * 2);

    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      // uniform-ish point in a sphere shell
      v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
      if (v.lengthSq() < 0.02) v.x += 0.2;
      v.normalize().multiplyScalar(radius * (0.35 + Math.random() * 0.65));
      const tw = 0.4 + Math.random() * 0.6;
      for (let s = 0; s < 2; s++) {
        const k = (i * 2 + s) * 3;
        positions[k] = v.x;
        positions[k + 1] = v.y;
        positions[k + 2] = v.z;
        sides[i * 2 + s] = s; // 0 = head, 1 = tail
        twinkle[i * 2 + s] = tw;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSide', new THREE.BufferAttribute(sides, 1));
    geo.setAttribute('aTwinkle', new THREE.BufferAttribute(twinkle, 1));

    this.uniforms = {
      uStreak: { value: 0.25 },
      uColor: { value: new THREE.Color(color) }
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false
    });

    this.lines = new THREE.LineSegments(geo, mat);
    this.lines.frustumCulled = false;
    scene.add(this.lines);
  }

  /** @param {number} warp 0..1 travel speed; @param {THREE.Vector3} camPos */
  update(warp, camPos) {
    this.lines.position.copy(camPos);
    this.lines.rotation.y += 0.0006; // slow drift so the field feels alive
    // dots at rest -> long streaks at speed
    this.uniforms.uStreak.value = 0.22 + warp * 34.0;
  }
}
