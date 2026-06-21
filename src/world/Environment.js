import * as THREE from 'three';

/**
 * Builds a PMREM environment map from a tiny studio scene so the
 * transmissive ice has believable reflections / refractions without an HDRI.
 */
export function buildEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color('#2c313c');

  const make = (color, intensity, w, h, x, y, z) => {
    const mat = new THREE.MeshBasicMaterial({ color });
    mat.color.multiplyScalar(intensity);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    envScene.add(m);
    return m;
  };

  // cold key light (top)
  make('#dfe3ec', 6, 40, 40, 0, 30, 6);
  // slate fill (sides)
  make('#5b6276', 2.2, 30, 60, -28, 0, 10);
  make('#454c5e', 1.8, 30, 60, 28, 4, -10);
  // faint warmish underglow to read as depth (kept cool)
  make('#8d92a1', 1.2, 40, 20, 0, -26, -8);

  const rt = pmrem.fromScene(envScene, 0.04);
  pmrem.dispose();
  return rt.texture;
}
