import gsap from 'gsap';

/**
 * Hybrid navigation: the page splits into two zones.
 *  • Gallery zone (the Higgsfield image/video panels, first): full-page
 *    slide-snap — one wheel flick / key / swipe / dot = one panel, with a
 *    white dissolve over each seam.
 *  • World zone (the live Three.js sections, after): smooth, continuous,
 *    weightless scroll that drives the camera descent — no snapping.
 *
 * One eased scroll position powers both; the zone is chosen by where you are.
 */
const EASE = 0.11;
const SNAP_COOLDOWN = 620; // ms — guarantees one flick = one gallery panel
const VEIL_MAX = 1.0;

export default class Nav {
  constructor() {
    this.sections = [...document.querySelectorAll('main > section')];
    this.firstWorld = this.sections.find((s) => !s.classList.contains('panel'));

    this.targetY = 0;
    this.currentY = 0;
    this.progress = 0; // 0..1 within the WORLD (3D) block — drives the camera
    this.enabled = false;
    this.cooldown = 0;

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
    this.targetY = this.currentY = 0;
    window.scrollTo(0, 0);
  }

  get vh() { return window.innerHeight; }
  get galleryEnd() { return this.firstWorld ? this.firstWorld.offsetTop : 0; }
  get maxScroll() { return Math.max(1, document.documentElement.scrollHeight - this.vh); }
  inGallery(y) { return y < this.galleryEnd - 2; }

  /* ---------------- per-frame easing (called from the render loop) -------- */
  tick() {
    if (!this.enabled) return;
    this.currentY += (this.targetY - this.currentY) * EASE;
    if (Math.abs(this.targetY - this.currentY) < 0.4) this.currentY = this.targetY;
    window.scrollTo(0, this.currentY);

    const denom = Math.max(1, this.maxScroll - this.galleryEnd);
    this.progress = Math.min(1, Math.max(0, (this.currentY - this.galleryEnd) / denom));

    this._updateVeil();
    if (this.fill) this.fill.style.height = `${(this.currentY / this.maxScroll) * 100}%`;
    this._updateDots();
  }

  // white dissolve only inside the gallery zone, peaking mid-transition
  _updateVeil() {
    let op = 0;
    if (this.currentY < this.galleryEnd + 2) {
      const frac = (this.currentY / this.vh) % 1;
      op = VEIL_MAX * Math.sin(Math.PI * frac);
      if (op < 0.01) op = 0;
    }
    this.veil.style.opacity = op.toFixed(3);
  }

  /* ---------------- navigation ---------------- */
  galleryIndex(y = this.targetY) {
    return Math.round(y / this.vh);
  }

  snapGallery(dir) {
    const now = performance.now();
    if (now < this.cooldown) return;
    this.cooldown = now + SNAP_COOLDOWN;
    const idx = this.galleryIndex();
    const next = idx + dir;
    // clamp into [first panel, start of world block]
    const maxIdx = Math.round(this.galleryEnd / this.vh);
    this.targetY = Math.max(0, Math.min(maxIdx, next)) * this.vh;
  }

  smooth(delta) {
    let n = this.targetY + delta;
    if (n < this.galleryEnd) {
      // crossing up out of the world block -> hand back to the gallery
      this.targetY = Math.max(0, this.galleryEnd - this.vh);
      this.cooldown = performance.now() + SNAP_COOLDOWN;
    } else {
      this.targetY = Math.min(n, this.maxScroll);
    }
  }

  goToSection(i) {
    const s = this.sections[i];
    if (!s) return;
    this.targetY = Math.min(s.offsetTop, this.maxScroll);
    if (this.inGallery(this.targetY)) this.cooldown = performance.now() + SNAP_COOLDOWN;
  }

  /* ---------------- input ---------------- */
  _bind() {
    let acc = 0;
    let lastT = 0;
    window.addEventListener(
      'wheel',
      (e) => {
        if (!this.enabled) return;
        e.preventDefault();
        if (this.inGallery(this.targetY)) {
          const now = performance.now();
          if (now - lastT > 240) acc = 0;
          lastT = now;
          acc += e.deltaY;
          if (acc > 26) { acc = 0; this.snapGallery(1); }
          else if (acc < -26) { acc = 0; this.snapGallery(-1); }
        } else {
          this.smooth(e.deltaY);
        }
      },
      { passive: false }
    );

    window.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      const down = ['ArrowDown', 'PageDown', ' '].includes(e.key);
      const up = ['ArrowUp', 'PageUp'].includes(e.key);
      if (!down && !up && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();
      if (e.key === 'Home') return this.goToSection(0);
      if (e.key === 'End') return this.goToSection(this.sections.length - 1);
      if (this.inGallery(this.targetY)) this.snapGallery(down ? 1 : -1);
      else this.smooth((down ? 1 : -1) * this.vh * 0.55);
    });

    let ty = 0;
    let movedFromGallery = false;
    window.addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; movedFromGallery = this.inGallery(this.targetY); }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (!this.enabled) return;
      e.preventDefault();
      if (!movedFromGallery) {
        const y = e.touches[0].clientY;
        this.smooth((ty - y) * 1.4);
        ty = y;
      }
    }, { passive: false });
    window.addEventListener('touchend', (e) => {
      if (!this.enabled || !movedFromGallery) return;
      const dy = ty - e.changedTouches[0].clientY;
      if (dy > 40) this.snapGallery(1);
      else if (dy < -40) this.snapGallery(-1);
    });

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const idx = this.sections.findIndex((s) => s.id === a.getAttribute('href').slice(1));
      if (idx >= 0) { e.preventDefault(); this.goToSection(idx); }
    });

    window.addEventListener('resize', () => { this.targetY = this.currentY = Math.min(this.targetY, this.maxScroll); });
  }

  /* ---------------- dot nav ---------------- */
  _buildDots() {
    const nav = document.createElement('nav');
    nav.className = 'slide-dots';
    let prevPanel = true;
    this.dots = this.sections.map((s, i) => {
      const b = document.createElement('button');
      b.className = 'slide-dot';
      b.type = 'button';
      b.setAttribute('aria-label', s.id || `Section ${i + 1}`);
      const isPanel = s.classList.contains('panel');
      if (!isPanel) {
        b.classList.add('slide-dot--world');
        if (prevPanel) b.classList.add('slide-dot--divide'); // first world dot
      }
      prevPanel = isPanel;
      b.addEventListener('click', () => this.goToSection(i));
      nav.appendChild(b);
      return b;
    });
    document.getElementById('scroll').appendChild(nav);
  }
  _updateDots() {
    let active = 0;
    for (let i = 0; i < this.sections.length; i++) {
      if (this.sections[i].offsetTop <= this.currentY + this.vh * 0.5) active = i;
    }
    this.dots.forEach((d, i) => d.classList.toggle('is-active', i === active));
  }

  show() { document.querySelector('.slide-dots')?.classList.add('is-in'); }
}
