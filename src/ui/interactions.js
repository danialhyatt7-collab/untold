/**
 * DOM-side flourishes: custom cursor, scroll reveals, nav reveal.
 * Kept independent of the WebGL loop.
 */
export function initInteractions() {
  // ---- custom cursor (1:1 follow, GPU-composited, no rAF / no trailing) ----
  const cursor = document.getElementById('cursor');
  let queued = false;
  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;
  const place = () => {
    queued = false;
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
  };
  window.addEventListener(
    'pointermove',
    (e) => {
      cx = e.clientX;
      cy = e.clientY;
      if (!queued) {
        queued = true;
        requestAnimationFrame(place);
      }
    },
    { passive: true }
  );

  const hoverables = 'a, .archive__row, [data-media], button';
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest(hoverables)) cursor.classList.add('is-hover');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest(hoverables)) cursor.classList.remove('is-hover');
  });

  // ---- scroll reveals ----
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 90}ms`;
    io.observe(el);
  });
}

export function showChrome() {
  document.getElementById('nav')?.classList.add('is-in');
  document.getElementById('progress')?.classList.add('is-in');
}
