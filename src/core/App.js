import * as THREE from 'three';
import gsap from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import CameraRig from '../world/CameraRig.js';
import Atmosphere from '../world/Atmosphere.js';
import Starfield from '../world/Starfield.js';
import BlackHole from '../world/BlackHole.js';
import postFrag from '../shaders/post.frag';

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
    this.intro = { v: 0 };

    this.warp = 0;
    this.warpBoost = 0;
    this.lastProgress = 0;
    this.prevWorldVisible = false;
    this._bh = new THREE.Vector3();

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
    this.starfield = new Starfield(this.scene);
    this.blackhole = new BlackHole(this.scene);
  }

  _initPost() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.rig.camera));

    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.9, // strength
      0.75, // radius
      0.2 // threshold
    );
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    // cinematic post: gravitational lensing + chromatic aberration + grade
    this.post = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uCenter: { value: new THREE.Vector2(0.5, 0.5) },
        uAspect: { value: window.innerWidth / window.innerHeight },
        uLensR: { value: 0.14 },
        uLensS: { value: 0.0 },
        uAberr: { value: 0.0035 },
        uVignette: { value: 0.5 }
      },
      vertexShader:
        'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: postFrag
    });
    this.composer.addPass(this.post);

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
    this.loader.to(1);
    await this.loader.finish();

    gsap.to(this.intro, { v: 1, duration: 2.6, ease: 'power2.inOut' });

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
    const cam = this.rig.camera;
    this.atmosphere.update(t, cam.position);
    this.starfield.update(this.warp + this.warpBoost, cam.position);
    this.blackhole.update(t, cam);

    // feed the black hole's screen position to the lensing post pass
    this._bh.copy(this.blackhole.worldPosition).project(cam);
    const onScreen = this._bh.z < 1;
    this.post.uniforms.uCenter.value.set(this._bh.x * 0.5 + 0.5, this._bh.y * 0.5 + 0.5);
    const dist = cam.position.distanceTo(this.blackhole.worldPosition);
    const near = THREE.MathUtils.clamp((230 - dist) / 170, 0, 1);
    this.post.uniforms.uLensS.value = onScreen ? 0.02 + near * 0.16 : 0.0;

    this.composer.render();
  }

  _resize() {
    this.rig.resize();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.post.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
    this._applyQuality();
  }

  start() {
    const loop = () => {
      requestAnimationFrame(loop);
      if (this.hidden) return;
      const t = this.clock.getElapsedTime();
      this.nav.tick();

      const reveal = this.nav.galleryEnd - window.innerHeight + 4;
      const worldVisible = this.nav.currentY > reveal;

      if (worldVisible && !this.prevWorldVisible && this.nav.progress < 0.04) {
        this.warpBoost = 1;
        gsap.to(this, { warpBoost: 0, duration: 1.3, ease: 'power3.out', overwrite: true });
      }
      this.prevWorldVisible = worldVisible;

      if (worldVisible) {
        const dp = Math.abs(this.nav.progress - this.lastProgress);
        this.lastProgress = this.nav.progress;
        // baseline infall + scroll-velocity warp
        this.warp += (Math.min(0.06 + dp * 17, 1) - this.warp) * 0.1;
        this.rig.warp = Math.min(1, this.warp + this.warpBoost);

        this.rig.update(this.nav.progress, t, this.intro.v);
        this._renderWorld(t);
        this._sampleFps();
      } else {
        this.lastProgress = this.nav.progress;
        this.warp = 0;
        this._fpsT = performance.now();
        this._frames = 0;
      }
    };
    requestAnimationFrame(loop);
  }
}
