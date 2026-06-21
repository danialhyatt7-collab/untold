import * as THREE from 'three';

/**
 * Frosted ice — a cheap MeshStandardMaterial (no transmission pass, no
 * clearcoat) plus a noise field injected through onBeforeCompile that breaks
 * the surface into frost, internal cloud and micro-cracks. Pass `opacity` < 1
 * for a translucent block you can see through faintly.
 * `material.userData.uniforms.uTime` drives a slow shimmer.
 */
export function createIceMaterial(opts = {}) {
  const opacity = opts.opacity ?? 1;
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(opts.color || '#cfd4de'),
    metalness: 0,
    roughness: opts.roughness ?? 0.55,
    envMapIntensity: opts.envMapIntensity ?? 1.0,
    opacity,
    transparent: opacity < 1,
    side: THREE.FrontSide
  });

  const uniforms = { uTime: { value: 0 }, uFrost: { value: opts.frost ?? 0.5 } };
  mat.userData.uniforms = uniforms;

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uFrost = uniforms.uFrost;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vIcePos;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         vIcePos = position;`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform float uTime;
         uniform float uFrost;
         varying vec3 vIcePos;

         float hash(vec3 p){ return fract(sin(dot(p, vec3(27.1,61.7,12.4)))*43758.5453); }
         float vnoise(vec3 p){
           vec3 i=floor(p); vec3 f=fract(p); f=f*f*(3.0-2.0*f);
           float n=mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),
                           mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                       mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
                           mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
           return n;
         }
         float fbm(vec3 p){
           float v=0.0, a=0.5;
           for(int i=0;i<5;i++){ v+=a*vnoise(p); p*=2.03; a*=0.5; }
           return v;
         }`
      )
      // perturb roughness with frost noise -> cloudy internal veins
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
         float frostN = fbm(vIcePos * 0.9 + vec3(0.0, uTime*0.05, 0.0));
         float cracks = pow(abs(fbm(vIcePos*2.7) - 0.5) * 2.0, 6.0);
         roughnessFactor = clamp(roughnessFactor + frostN * uFrost * 0.5 + cracks*0.15, 0.02, 1.0);`
      )
      // lift the diffuse toward frost-white where it's cloudy / cracked
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
         float cloud = smoothstep(0.45, 0.85, fbm(vIcePos*1.3 + 11.0));
         diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.84,0.86,0.90), cloud * uFrost * 0.6);`
      );
  };

  return mat;
}
