/**
 * Seamless white-fade transitions. A fixed frost-white veil that blooms to
 * near-opaque exactly as one section boundary crosses the viewport, then
 * clears — so every section dissolves into white and resolves out of it.
 */
export function initTransitions() {
  const veil = document.createElement('div');
  veil.className = 'veil-white';
  document.body.appendChild(veil);

  // boundaries = the top edge of every section except the very first
  const sections = [...document.querySelectorAll('main > section')].slice(1);
  const smooth = (e0, e1, x) => {
    const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
    return t * t * (3 - 2 * t);
  };

  const MAX = 1.0; // full white dissolve at the seam — sections merge, no visible scroll
  const ZONE = 0.3; // fraction of viewport over which a transition happens

  let current = 0;
  const update = () => {
    const vh = window.innerHeight;
    let op = 0;
    for (const s of sections) {
      const top = s.getBoundingClientRect().top;
      // normalised distance of this boundary from the viewport top
      const d = Math.abs(top) / vh;
      if (d < ZONE) op = Math.max(op, (1 - smooth(0, ZONE, d)) * MAX);
    }
    // ease toward target to avoid any micro-jitter
    current += (op - current) * 0.35;
    veil.style.opacity = current.toFixed(3);
    requestAnimationFrame(update);
  };
  update();
}
