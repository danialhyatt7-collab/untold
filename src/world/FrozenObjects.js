import * as THREE from 'three';
import { createIceMaterial } from './IceMaterial.js';
import { metalMatcap } from './matcaps.js';

/**
 * The "events" — real 3D objects suspended inside blocks of ice, spaced down
 * the descent column. Each block is mouse-reactive (it tips toward the cursor)
 * and the one nearest the camera becomes orbitable via drag.
 */
const ENTRIES = [
  { y: -14, x: -8, name: 'Origin', maker: () => new THREE.IcosahedronGeometry(2.1, 0) },
  { y: -40, x: 9, name: 'Drift', maker: () => new THREE.TorusKnotGeometry(1.4, 0.5, 120, 16) },
  { y: -66, x: -7, name: 'Fracture', maker: () => new THREE.OctahedronGeometry(2.3, 0) },
  { y: -92, x: 8, name: 'Bloom', maker: () => new THREE.DodecahedronGeometry(2.1, 0) },
  { y: -118, x: -6, name: 'Vanish', maker: () => new THREE.TorusGeometry(1.7, 0.55, 24, 80) }
];

export default class FrozenObjects {
  constructor(scene) {
    this.group = new THREE.Group();
    this.blocks = [];
    this.targetMouse = new THREE.Vector2();
    this.mouse = new THREE.Vector2();

    // the inner objects use a matcap metal so they read against the ice (cheap)
    const coreMat = new THREE.MeshMatcapMaterial({
      color: '#aab0bd',
      matcap: metalMatcap()
    });
    this.coreMat = coreMat;

    ENTRIES.forEach((e, i) => {
      const block = new THREE.Group();

      const iceMat = createIceMaterial({
        color: '#cdd2dc',
        opacity: 0.5, // translucent so the frozen object reads through the ice
        rim: '#e6ecf6',
        rimStrength: 0.7, // glassy lit edge
        rimPower: 2.2,
        frost: 0.3 + Math.random() * 0.25
      });

      const shell = new THREE.Mesh(this._roundBox(5.5, 5.5, 5.5), iceMat);

      const core = new THREE.Mesh(e.maker(), coreMat);
      core.scale.setScalar(0.9);

      block.add(shell, core);
      block.position.set(e.x, e.y, (i % 2 ? -1 : 1) * 2.5);
      block.rotation.set(Math.random(), Math.random(), 0);

      block.userData = { iceMat, core, base: block.position.clone(), index: i, name: e.name };
      this.group.add(block);
      this.blocks.push(block);
    });

    scene.add(this.group);
  }

  _roundBox(w, h, d) {
    const geo = new THREE.BoxGeometry(w, h, d, 4, 4, 4);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    const r = 0.85;
    // spherify corners slightly for a tumbled-ice look
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const s = v.clone().normalize().multiplyScalar(Math.max(w, h, d) * 0.5);
      v.lerp(s, 0.12 * r);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }

  setMouse(x, y) {
    this.targetMouse.set(x, y);
  }

  update(time, cameraY) {
    this.mouse.lerp(this.targetMouse, 0.06);

    this.blocks.forEach((b, i) => {
      const { iceMat, core, base } = b.userData;
      iceMat.userData.uniforms.uTime.value = time;

      // floating bob
      b.position.y = base.y + Math.sin(time * 0.5 + i) * 0.5;
      b.position.x = base.x + Math.cos(time * 0.35 + i) * 0.4;

      // the object inside slowly rotates — frozen but alive
      core.rotation.x = time * 0.12 + i;
      core.rotation.y = time * 0.16 + i;

      // distance to current camera depth -> nearest block leans toward cursor
      const near = THREE.MathUtils.clamp(1 - Math.abs(b.position.y - cameraY) / 22, 0, 1);
      b.rotation.x += ((this.mouse.y * 0.5 * near) - b.rotation.x) * 0.05;
      b.rotation.y += ((time * 0.05 + this.mouse.x * 0.6 * near) - b.rotation.y) * 0.05;

      // emphasise the focused block
      const targetScale = 1 + near * 0.12;
      b.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.06);
    });
  }
}
