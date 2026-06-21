import Lenis from 'lenis';

/**
 * Smooth, weightless scrolling. Exposes a normalised 0..1 progress that the
 * camera flight reads, plus a progress rail + bottom bar update.
 */
export default class Scroll {
  constructor() {
    this.lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4
    });

    this.progress = 0;
    this.fill = document.querySelector('#progress span');

    this.lenis.on('scroll', ({ scroll, limit }) => {
      this.progress = limit > 0 ? scroll / limit : 0;
      if (this.fill) this.fill.style.height = `${this.progress * 100}%`;
    });
  }

  // disable until the loader hands off so the intro reads cleanly
  stop() { this.lenis.stop(); }
  start() { this.lenis.start(); }

  raf(timeMs) {
    this.lenis.raf(timeMs);
  }
}
