import * as THREE from 'three';

/**
 * Glowing ring "chambers" suspended in the descent — echoes the reference's
 * "Within the Structure" portal. Bright, toneMapped-off rings that bloom hard,
 * with faint constellation lines strung between drifting nodes around them.
 */
export default class Portal {
  constructor(scene) {
    this.group = new THREE.Group();
    this.rings = [];

    const depths = [-30, -78, -126];
    depths.forEach((y, i) => {
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#eaf0fb'),
        toneMapped: false,
        transparent: true,
        opacity: 0.9
      });
      const radius = 9 + (i % 2) * 2;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.06, 16, 160), ringMat);
      ring.position.set(0, y, 0);
      ring.rotation.x = Math.PI / 2; // lie flat so the flight passes through it
      ring.userData = { mat: ringMat, baseY: y, phase: i };
      this.group.add(ring);
      this.rings.push(ring);

      // a fainter inner halo ring
      const halo = ring.clone();
      halo.scale.setScalar(0.72);
      halo.material = ringMat.clone();
      halo.material.opacity = 0.4;
      ring.userData.halo = halo;
      this.group.add(halo);
    });

    // drifting constellation node field around the column
    const N = 90;
    const pts = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 11 + Math.random() * 6;
      pts[i * 3] = Math.cos(a) * r;
      pts[i * 3 + 1] = -Math.random() * 150;
      pts[i * 3 + 2] = Math.sin(a) * r;
    }
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const nodeMat = new THREE.PointsMaterial({
      color: new THREE.Color('#cdd2dc'),
      size: 0.16,
      transparent: true,
      opacity: 0.7,
      toneMapped: false,
      depthWrite: false
    });
    this.nodes = new THREE.Points(nodeGeo, nodeMat);
    this.group.add(this.nodes);

    scene.add(this.group);
  }

  update(time) {
    this.rings.forEach((ring, i) => {
      const pulse = 0.6 + Math.sin(time * 1.1 + ring.userData.phase * 2) * 0.4;
      ring.material.opacity = 0.5 + pulse * 0.4;
      ring.rotation.z = time * (0.08 + i * 0.02);
      if (ring.userData.halo) {
        ring.userData.halo.rotation.z = -time * 0.05;
        ring.userData.halo.material.opacity = 0.2 + pulse * 0.25;
      }
    });
    this.nodes.rotation.y = time * 0.02;
  }
}
