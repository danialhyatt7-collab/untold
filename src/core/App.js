import * as THREE from 'three';
import gsap from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import CameraRig from '../world/CameraRig.js';
import Atmosphere from '../world/Atmosphere.js';
import ParticleField from '../world/ParticleField.js';

import Nav from './Nav.js';
import Loader from './Loader.js';
import { injectContent } from '../ui/content.js';
import { initInteractions, showChrome } from '../ui/interactions.js';
import { mountMedia } from '../ui/media.js';
import { initHud } from '../ui/hud.js';

export default class App {
  constructor() {
    this.canvas = document.getElementById('webgl');
    this.clock = new THREE.Clock();
    this.intro = { v: 0 }; // 0 = loader framing, 1 = live stage

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
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.rig = new CameraRig();
    this.atmosphere = new Atmosphere(this.scene);
    this.particles = new ParticleField(this.scene);
  }

  _initPost() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.rig.camera));

    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.85, // strength — the wordmarks glow
      0.7, // radius
      0.18 // threshold
    );
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

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
    this.composer.setPixelRatio(1);
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
    if (fps < 48 && this.quality < this.qLevels.length - 1) {
      this.quality++;
      this._applyQuality();
    }
  }

  _initContent() {
    injectContent(document.getElementById('content'));
    this.nav = new Nav();
    this.loader = new Loader();
  }

  _bind() {
    window.addEventListener('resize', () => this._resize());

    window.addEventListener('pointermove', (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      this.rig.setMouse(x, y);
      // project the cursor onto the particle plane (z=0)
      const halfH = Math.tan((42 * Math.PI) / 180 / 2) * 70;
      const halfW = halfH * (window.innerWidth / window.innerHeight);
      this.particles.setMouse(x * halfW, y * halfH);
    });

    document.addEventListener('visibilitychange', () => {
      this.hidden = document.hidden;
    });
  }

  async _boot() {
    this.loader.to(0.35);
    await this._warmup();
    this.loader.to(0.8);

    await document.fonts?.ready?.catch(() => {});
    this.particles.refit(); // re-sample the wordmarks now Syne has loaded
    this.loader.to(1);

    await this.loader.finish();

    gsap.to(this.intro, { v: 1, duration: 2.4, ease: 'power2.inOut' });

    this.nav.enable();
    this.nav.show();
    initInteractions();
    initHud();
    showChrome();
    mountMedia();
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
    this.atmosphere.update(t, this.rig.camera.position);
    this.particles.update(this.nav ? this.nav.progress : 0, t);
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
    const loop = () => {
      requestAnimationFrame(loop);
      if (this.hidden) return;
      const t = this.clock.getElapsedTime();

      this.nav.tick();

      // the particle stage lives behind the opaque Higgsfield gallery panels;
      // only render it once it's actually being revealed
      const reveal = this.nav.galleryEnd - window.innerHeight + 4;
      if (this.nav.currentY > reveal) {
        this.rig.update(this.nav.progress, t, this.intro.v);
        this._renderWorld(t);
        this._sampleFps();
      } else {
        this._fpsT = performance.now();
        this._frames = 0;
      }
    };
    requestAnimationFrame(loop);
  }
}
