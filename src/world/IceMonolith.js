import * as THREE from 'three';
import { createIceMaterial } from './IceMaterial.js';

/**
 * The centrepiece — modelled on the reference: a colossal column of rough-hewn
 * frosted ice blocks stacked in tiers, split straight down the middle by a
 * narrow seam that glows with pale light (bloom does the rest). The camera
 * descends alongside it, falling past tier after tier.
 */
export default class IceMonolith {
  constructor(scene) {
    this.group = new THREE.Group();

    this.material = createIceMaterial({
      color: '#b6bac5', // uniform soft silver-grey, matching the palette
      roughness: 0.72, // frosted weathered stone-ice (opaque, cheap)
      clearcoat: 0.22,
      envMapIntensity: 0.9,
      frost: 0.5 // less white snow-caking -> even matte grey
    });

    // ---- stacked tiers: chunky rounded pillow-blocks, 2 columns wide ----
    const top = 12;
    const tierH = 11; // squat / chunky, roughly cube proportioned
    const tiers = 11; // reaches well below the descent
    const gap = 0.55; // central glowing seam gap
    const halfW = 5.2;

    for (let i = 0; i < tiers; i++) {
      const y = top - i * (tierH + 0.6);
      const jitter = Math.sin(i * 12.9) * 0.5 + 0.5;
      const h = tierH * (0.92 + jitter * 0.1);
      const depth = 9.5 + Math.sin(i * 2.3) * 0.6;

      [-1, 1].forEach((side) => {
        const w = halfW * (0.95 + Math.cos(i * 3.1 + side) * 0.05);
        const block = new THREE.Mesh(this._pillowBlock(w, h, depth, i * 7 + side), this.material);
        block.position.set(side * (gap / 2 + w / 2), y, Math.sin(i + side) * 0.3);
        block.rotation.set(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.015
        );
        this.group.add(block);
      });
    }

    // ---- glowing central seam ----
    const seamMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#eef0f4'),
      toneMapped: false // stays bright -> blooms hard
    });
    this.seamMat = seamMat;
    const seamH = (tiers - 1) * (tierH + 0.6) + tierH;
    const seam = new THREE.Mesh(new THREE.PlaneGeometry(0.3, seamH), seamMat);
    seam.position.set(0, top - seamH / 2 + tierH / 2, 4.9);
    this.seam = seam;
    this.group.add(seam);

    // a back-facing copy so the seam reads from behind too as the camera spirals
    const seamBack = seam.clone();
    seamBack.position.z = -4.9;
    seamBack.rotation.y = Math.PI;
    this.group.add(seamBack);

    // soft light pools leaking from the seam
    this.seamLight = new THREE.PointLight('#dfe3ec', 30, 50, 2);
    this.group.add(this.seamLight);

    scene.add(this.group);
  }

  /** smooth, tumbled pillow-block: rounded cube with gentle frost undulation. */
  _pillowBlock(w, h, d, seed) {
    const geo = new THREE.BoxGeometry(w, h, d, 4, 5, 4);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      // round the cube toward its bounding sphere -> soft pillow edges
      const sphere = v.clone().normalize().multiplyScalar(Math.min(w, h, d) * 0.62);
      v.lerp(sphere, 0.34);
      // very subtle surface undulation so it reads as tumbled ice, not CG-smooth
      const n =
        Math.sin(v.x * 1.1 + seed) * 0.06 +
        Math.cos(v.y * 0.9 + seed * 1.7) * 0.05 +
        Math.sin(v.z * 1.3 + seed * 0.5) * 0.05;
      v.addScaledVector(v.clone().normalize(), n);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }

  update(time, cameraY = 0) {
    this.material.userData.uniforms.uTime.value = time;
    // breathing glow on the seam
    const pulse = 0.85 + Math.sin(time * 0.8) * 0.15;
    this.seamMat.color.setScalar(0.93 * pulse + 0.07);
    this.seamLight.intensity = 26 * pulse;
    this.seamLight.position.y = cameraY; // pool follows the descent
    this.group.rotation.y = Math.sin(time * 0.04) * 0.04;
  }
}
