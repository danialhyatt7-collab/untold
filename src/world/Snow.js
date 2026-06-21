import * as THREE from 'three';
import vertexShader from '../shaders/snow.vert';
import fragmentShader from '../shaders/snow.frag';

/**
 * Two interleaved drifting particle fields (fine snow + slow light-scatter
 * motes) that fill the full descent column so depth always reads.
 */
export default class Snow {
  constructor(scene, { count = 2600, depth = 200, size = 26, color = '#d7dae1' } = {}) {
    this.depth = depth;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 70;
      positions[i * 3 + 1] = (Math.random() - 0.5) * depth;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
      scales[i] = Math.random() * 0.9 + 0.15;
      speeds[i] = Math.random() * 0.8 + 0.25;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    this.uniforms = {
      uTime: { value: 0 },
      uSize: { value: size },
      uDepth: { value: depth },
      uColor: { value: new THREE.Color(color) },
      uMouse: { value: new THREE.Vector2(0, 0) }
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  update(time, cameraPos, mouse) {
    this.uniforms.uTime.value = time;
    this.uniforms.uMouse.value.set(mouse.x, mouse.y);
    // follow the camera down the column
    this.points.position.y = cameraPos.y;
  }
}
