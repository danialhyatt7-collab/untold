import * as THREE from 'three';
import gsap from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import CameraRig from '../world/CameraRig.js';
import Lights from '../world/Lights.js';
import Atmosphere from '../world/Atmosphere.js';
import Snow from '../world/Snow.js';
import IceMonolith from '../world/IceMonolith.js';
import FrozenObjects from '../world/FrozenObjects.js';
import Portal from '../world/Portal.js';
import Floor from '../world/Floor.js';
import { buildEnvironment } from '../world/Environment.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import Slides from './Slides.js';
import Loader from './Loader.js';
import { injectContent } from '../ui/content.js';
import { initInteractions, showChrome } from '../ui/interactions.js';
import { mountMedia } from '../ui/media.js';
import { initHud } from '../ui/hud.js';

export default class App {
  constructor() {
    this.canvas = document.getElementById('webgl');
    this.clock = new THREE.Clock();
    this.intro = { v: 0 }; // 0 = loader framing, 1 = live flight
    this.sceneReady = false;

    this._initRenderer();
    this._initScene();
    this._initPost();
    this._initContent();
    this._bind();
    this._boot();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2('#828892', 0.011);

    this.rig = new CameraRig();
    this.scene.environment = buildEnvironment(this.renderer);

    this.lights = new Lights(this.scene);
    this.atmosphere = new Atmosphere(this.scene);
    this.snow = new Snow(this.scene);
    this.monolith = new IceMonolith(this.scene);
    this.frozen = new FrozenObjects(this.scene);
    this.portal = new Portal(this.scene);
    this.floor = new Floor(this.scene);
  }

  _initPost() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.rig.camera));

    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5, // strength
      0.8, // radius
      0.95 // threshold — only the seam + portal rings bloom, not the bright fog
    );
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    // ---- film grain + vignette (one cheap fullscreen pass, very filmic) ----
    this.grain = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uGrain: { value: 0.05 },
        uVignette: { value: 0.5 }
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform sampler2D tDiffuse; uniform float uTime; uniform float uGrain; uniform float uVignette;
        varying vec2 vUv;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
        void main(){
          vec4 c = texture2D(tDiffuse, vUv);
          float g = hash(vUv * vec2(1280.0, 720.0) + fract(uTime)) * 2.0 - 1.0;
          c.rgb += g * uGrain;
          vec2 q = vUv - 0.5;
          float v = smoothstep(0.95, 0.32, length(q));
          c.rgb *= mix(1.0 - uVignette, 1.0, v);
          gl_FragColor = c;
        }
      `
    });
    this.composer.addPass(this.grain);

    // ---- adaptive quality: steps down resolution (then bloom) if FPS dips ----
    this.qLevels = [
      { pr: 1.0, bloom: true },
      { pr: 0.8, bloom: true },
      { pr: 0.66, bloom: true },
      { pr: 0.6, bloom: false }
    ];
    this.quality = 0;
    this._frames = 0;
    this._fpsT = performance.now();
    this._applyQuality();
  }

  _applyQuality() {
    const q = this.qLevels[this.quality];
    this.composer.setPixelRatio(Math.min(window.devicePixelRatio, q.pr));
    this.bloom.enabled = q.bloom;
  }

  _sampleFps() {
    this._frames++;
    const now = performance.now();
    const dt = now - this._fpsT;
    if (dt < 1000) return;
    const fps = (this._frames * 1000) / dt;
    this._frames = 0;
    this._fpsT = now;
    // only step down, with headroom, to avoid flapping
    if (fps < 48 && this.quality < this.qLevels.length - 1) {
      this.quality++;
      this._applyQuality();
    }
  }

  _initContent() {
    injectContent(document.getElementById('content'));
    this.slides = new Slides();
    this.loader = new Loader();
  }

  _bind() {
    window.addEventListener('resize', () => this._resize());

    // pointer -> normalised -1..1 for parallax + frozen-object reactivity
    window.addEventListener('pointermove', (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      this.rig.setMouse(x, y);
      this.frozen.setMouse(x, y);
    });

    // pause heavy work when tab hidden
    document.addEventListener('visibilitychange', () => {
      this.hidden = document.hidden;
    });
  }

  async _boot() {
    // progress while the GPU warms up / first frames render
    this.loader.to(0.35);

    // render a few hidden frames so shaders compile before the reveal
    await this._warmup();
    this.loader.to(0.8);

    // give fonts a beat, then hand off
    await document.fonts?.ready?.catch(() => {});
    this.loader.to(1);

    await this.loader.finish();
    this.sceneReady = true;

    // seamless camera morph from loader framing into the flight
    gsap.to(this.intro, { v: 1, duration: 2.6, ease: 'power2.inOut' });

    this.slides.enable();
    this.slides.show();
    initInteractions();
    initHud();
    showChrome();
    mountMedia(); // wire any Higgsfield-generated media into the full-bleed panels
  }

  _warmup() {
    return new Promise((resolve) => {
      let n = 0;
      const tick = () => {
        const t = this.clock.getElapsedTime();
        this.rig.update(0, t, 0);
        this._renderWorld(t);
        if (++n > 6) resolve();
        else requestAnimationFrame(tick);
      };
      tick();
    });
  }

  _renderWorld(t) {
    const camPos = this.rig.camera.position;
    this.atmosphere.update(t, camPos);
    this.snow.update(t, camPos, this.rig.mouse);
    this.monolith.update(t, camPos.y, this.rig.camera);
    this.frozen.update(t, camPos.y);
    this.portal.update(t);
    this.floor.update(t);
    this.lights.update(camPos.y);
    if (this.grain) this.grain.uniforms.uTime.value = t;
    this.composer.render();
  }

  _resize() {
    this.rig.resize();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this._applyQuality();
  }

  start() {
    const loop = (timeMs) => {
      requestAnimationFrame(loop);
      if (this.hidden) return;
      const t = this.clock.getElapsedTime();

      this.rig.update(this.slides.progress, t, this.intro.v);
      this._renderWorld(t);
      this._sampleFps();
    };
    requestAnimationFrame(loop);
  }
}
