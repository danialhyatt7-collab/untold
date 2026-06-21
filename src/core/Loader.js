import gsap from 'gsap';

/**
 * Drives the loading screen counter and resolves once the WebGL world has
 * actually rendered its first frames. The visual hand-off (camera morph) is
 * orchestrated by App — here we only own the DOM overlay.
 */
export default class Loader {
  constructor() {
    this.el = document.getElementById('loader');
    this.count = document.getElementById('loaderCount');
    this.bar = document.getElementById('loaderBar');
    this.tag = document.getElementById('loaderTag');
    this._value = { p: 0 };
    this._done = false;
  }

  /** Animate toward a target progress (0..1). */
  to(p) {
    gsap.to(this._value, {
      p,
      duration: 1.0,
      ease: 'power2.out',
      onUpdate: () => {
        const pct = Math.round(this._value.p * 100);
        this.count.textContent = pct;
        this.bar.style.transform = `scaleX(${this._value.p})`;
      }
    });
  }

  /** Fade the overlay out and resolve when fully gone. */
  finish() {
    if (this._done) return Promise.resolve();
    this._done = true;
    this.tag.textContent = 'the world is thawing';
    return new Promise((resolve) => {
      const tl = gsap.timeline({ onComplete: resolve });
      tl.to(this._value, {
        p: 1,
        duration: 0.6,
        ease: 'power2.out',
        onUpdate: () => {
          this.count.textContent = Math.round(this._value.p * 100);
          this.bar.style.transform = `scaleX(${this._value.p})`;
        }
      })
        .to('.loader__meta, .loader__bar', { opacity: 0, duration: 0.4 }, '+=0.1')
        .to('.loader__word', { yPercent: -110, duration: 0.9, ease: 'power3.inOut' }, '-=0.1')
        .add(() => this.el.classList.add('is-done'), '-=0.4');
    });
  }
}
