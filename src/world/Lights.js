import * as THREE from 'three';

export default class Lights {
  constructor(scene) {
    this.group = new THREE.Group();

    const ambient = new THREE.AmbientLight('#b6bac5', 0.35);

    // cold key from above — the descending shaft of light
    this.key = new THREE.DirectionalLight('#e6e9f0', 2.4);
    this.key.position.set(6, 40, 12);

    // slate rim from below for the interstellar underglow
    this.rim = new THREE.PointLight('#6f7689', 40, 120, 2);
    this.rim.position.set(-10, -40, -10);

    // travelling fill that follows the camera depth (set each frame)
    this.travel = new THREE.PointLight('#c7cbd6', 26, 60, 2);
    this.travel.position.set(0, 20, 14);

    this.group.add(ambient, this.key, this.rim, this.travel);
    scene.add(this.group);
  }

  update(cameraY) {
    // keep a soft pool of light around the current descent height
    this.travel.position.y = cameraY + 6;
    this.key.position.y = cameraY + 40;
  }
}
