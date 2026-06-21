/**
 * DOM-side flourishes: custom cursor, scroll reveals, nav reveal.
 * Kept independent of the WebGL loop.
 */
export function initInteractions() {
  // ---- custom cursor ----
  const cursor = document.getElementById('cursor');
  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const target = { ...pos };

  window.addEventListener('pointermove', (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
  });

  const hoverables = 'a, .archive__row, [data-media], button';
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest(hoverables)) cursor.classList.add('is-hover');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest(hoverables)) cursor.classList.remove('is-hover');
  });

  const loop = () => {
    pos.x += (target.x - pos.x) * 0.18;
    pos.y += (target.y - pos.y) * 0.18;
    cursor.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  loop();

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
