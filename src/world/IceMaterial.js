import * as THREE from 'three';
import vertexShader from '../shaders/ice.vert';
import fragmentShader from '../shaders/ice.frag';
import { iceMatcap } from './matcaps.js';

/**
 * Frosted ice via a matcap + fresnel-rim ShaderMaterial. No lights, no PBR,
 * no transmission pass — a baked "lit sphere" plus a glowing fresnel edge and
 * an animated internal frost field. Much cheaper than MeshPhysicalMaterial and
 * arguably richer. `material.userData.uniforms.uTime` drives the shimmer; pass
 * `opacity` < 1 for a translucent block.
 */
export function createIceMaterial(opts = {}) {
  const opacity = opts.opacity ?? 1;
  const uniforms = {
    matcap: { value: opts.matcap || iceMatcap() },
    uColor: { value: new THREE.Color(opts.color || '#cfd4de') },
    uRim: { value: new THREE.Color(opts.rim || '#dfe6f2') },
    uRimPower: { value: opts.rimPower ?? 2.6 },
    uRimStrength: { value: opts.rimStrength ?? 0.45 },
    uTime: { value: 0 },
    uFrost: { value: opts.frost ?? 0.5 },
    uOpacity: { value: opacity }
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: opacity < 1,
    side: THREE.FrontSide
  });

  // keep the existing API used by the world modules
  mat.userData.uniforms = uniforms;
  return mat;
}
