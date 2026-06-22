import * as THREE from 'three';
import vertexShader from '../shaders/atmosphere.vert';
import fragmentShader from '../shaders/atmosphere.frag';

/**
 * Large inward-facing sphere that paints the mystical interstellar-winter
 * gradient, drifting nebula haze and a faint starfield. Pure shader, cheap.
 */
export default class Atmosphere {
  constructor(scene) {
    this.uniforms = {
      uTime: { value: 0 },
      uTop: { value: new THREE.Color('#14161d') },
      uBottom: { value: new THREE.Color('#2a2f3b') }
    };

    const geo = new THREE.SphereGeometry(260, 32, 24);
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
  }

  update(time, cameraPos) {
    this.uniforms.uTime.value = time;
    // keep the dome centred on the camera so we never reach its edge
    this.mesh.position.copy(cameraPos);
  }
}
