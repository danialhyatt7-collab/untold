import * as THREE from 'three';

/**
 * Physically-based transmissive ice. Real refraction (transmission + ior +
 * thickness) plus a noise field injected through onBeforeCompile that breaks
 * up the surface into frost, internal cloud and micro-cracks so every block
 * refracts a little differently. `material.userData.uniforms.uTime` drives
 * a slow shimmer.
 */
export function createIceMaterial(opts = {}) {
  const transmission = opts.transmission ?? 1;
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(opts.color || '#cfd4de'),
    metalness: 0,
    roughness: opts.roughness ?? 0.08,
    transmission,
    thickness: opts.thickness ?? 2.4,
    ior: 1.31, // ice
    attenuationColor: new THREE.Color(opts.attenuation || '#7d8596'),
    attenuationDistance: opts.attenuationDistance ?? 6,
    clearcoat: opts.clearcoat ?? 0.6,
    clearcoatRoughness: 0.25,
    envMapIntensity: 1.1,
    transparent: transmission > 0,
    side: transmission > 0 ? THREE.DoubleSide : THREE.FrontSide
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
