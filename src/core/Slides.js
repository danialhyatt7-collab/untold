import gsap from 'gsap';

/**
 * Full-page slide controller (fullPage.js-style). Each top-level <section> is
 * a slide; one wheel flick / arrow key / swipe / dot-click snaps to the next.
 * During a snap the camera glides to the new depth while a frost-white veil
 * dissolves over the seam — slide out → white → slide in.
 *
 * Takes over native scrolling, so it also exposes keyboard + dot navigation.
 */
export default class Slides {
  constructor({ onProgress } = {}) {
    this.slides = [...document.querySelectorAll('main > section')];
    this.index = 0;
    this.animating = false;
    this.enabled = false;
    this.progress = 0;
    this.onProgress = onProgress;
    this.cooldownUntil = 0;

    this.veil = document.querySelector('.veil-white') || this._makeVeil();
    this.fill = document.querySelector('#progress span');

    this._buildDots();
    this._bind();
  }

  _makeVeil() {
    const v = document.createElement('div');
    v.className = 'veil-white';
    document.body.appendChild(v);
    return v;
  }

  enable() {
    this.enabled = true;
    this._snapInstant();
  }

  /* ---------------- navigation ---------------- */
  go(dir) {
    this.goTo(this.index + dir);
  }

  goTo(i) {
    i = Math.max(0, Math.min(this.slides.length - 1, i));
    if (i === this.index || this.animating) return;
    this.index = i;
    this._animateTo(i);
    this._updateDots();
  }

  _maxScroll() {
    return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }
  _targetY(i) {
    return Math.min(this.slides[i].offsetTop, this._maxScroll());
  }

  _animateTo(i) {
    this.animating = true;
    const state = { y: window.scrollY };
    const endY = this._targetY(i);
    const tl = gsap.timeline({
      onComplete: () => {
        this.animating = false;
        this.cooldownUntil = performance.now() + 160;
      }
    });
    tl.to(
      state,
      {
        y: endY,
        duration: 1.15,
        ease: 'power2.inOut',
        onUpdate: () => {
          window.scrollTo(0, state.y);
          this._updateProgress();
        }
      },
      0
    );
    // veil: dissolve up over the first half, clear over the second
    tl.to(this.veil, { opacity: 1, duration: 0.5, ease: 'power2.in' }, 0);
    tl.to(this.veil, { opacity: 0, duration: 0.62, ease: 'power2.out' }, 0.53);
  }

  _snapInstant() {
    window.scrollTo(0, this._targetY(this.index));
    this._updateProgress();
  }

  _updateProgress() {
    this.progress = window.scrollY / this._maxScroll();
    if (this.fill) this.fill.style.height = `${this.progress * 100}%`;
    this.onProgress?.(this.progress);
  }

  /* ---------------- input ---------------- */
  _bind() {
    let acc = 0;
    let last = 0;
    window.addEventListener(
      'wheel',
      (e) => {
        if (!this.enabled) return;
        e.preventDefault();
        const now = performance.now();
        if (this.animating || now < this.cooldownUntil) {
          acc = 0;
          return;
        }
        if (now - last > 260) acc = 0;
        last = now;
        acc += e.deltaY;
        if (acc > 28) {
          acc = 0;
          this.go(1);
        } else if (acc < -28) {
          acc = 0;
          this.go(-1);
        }
      },
      { passive: false }
    );

    window.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        this.go(1);
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        this.go(-1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        this.goTo(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        this.goTo(this.slides.length - 1);
      }
    });

    let ty = 0;
    window.addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', (e) => { if (this.enabled) e.preventDefault(); }, { passive: false });
    window.addEventListener('touchend', (e) => {
      if (!this.enabled || this.animating) return;
      const dy = ty - e.changedTouches[0].clientY;
      if (dy > 44) this.go(1);
      else if (dy < -44) this.go(-1);
    });

    // in-page anchors (nav links, CTAs) jump to the matching slide
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      const idx = this.slides.findIndex((s) => s.id === id);
      if (idx >= 0) {
        e.preventDefault();
        this.goTo(idx);
      }
    });

    window.addEventListener('resize', () => this._snapInstant());
  }

  /* ---------------- dot nav ---------------- */
  _buildDots() {
    const nav = document.createElement('nav');
    nav.className = 'slide-dots';
    nav.setAttribute('aria-label', 'Sections');
    this.dots = this.slides.map((s, i) => {
      const b = document.createElement('button');
      b.className = 'slide-dot';
      b.type = 'button';
      b.setAttribute('aria-label', s.id || `Slide ${i + 1}`);
      b.addEventListener('click', () => this.goTo(i));
      nav.appendChild(b);
      return b;
    });
    document.getElementById('scroll').appendChild(nav);
    this._updateDots();
  }
  _updateDots() {
    this.dots?.forEach((d, i) => d.classList.toggle('is-active', i === this.index));
  }

  show() { document.querySelector('.slide-dots')?.classList.add('is-in'); }
}
