/**
 * Floating telemetry HUD — the signature igloo-style crosshair markers with
 * live-ish readouts that drift over the 3D world and react faintly to the
 * cursor. Purely decorative, pointer-events: none.
 */
const MARKERS = [
  { id: 'S2', key: 'DRIFT', x: 18, y: 32, base: 0.44, amp: 0.06 },
  { id: 'S7', key: 'RES', x: 78, y: 22, base: 7.89, amp: 0.4 },
  { id: 'S4', key: 'TEMP', x: 70, y: 68, base: -41.2, amp: 0.8, unit: '°' },
  { id: 'S9', key: 'DEPTH', x: 24, y: 74, base: 312, amp: 6, unit: 'm' }
];

export function initHud() {
  const layer = document.createElement('div');
  layer.className = 'hud';
  layer.innerHTML = MARKERS.map(
    (m) => `
    <div class="hud__marker" data-x="${m.x}" data-y="${m.y}" style="left:${m.x}%;top:${m.y}%">
      <svg viewBox="0 0 40 40" class="hud__ring"><circle cx="20" cy="20" r="13"/><line x1="20" y1="2" x2="20" y2="9"/><line x1="20" y1="31" x2="20" y2="38"/><line x1="2" y1="20" x2="9" y2="20"/><line x1="31" y1="20" x2="38" y2="20"/></svg>
      <span class="hud__label">${m.id} · ${m.key}<br/><i data-val>${m.base.toFixed(2)}${m.unit || ''}</i></span>
    </div>`
  ).join('');
  document.getElementById('scroll').appendChild(layer);

  const els = [...layer.querySelectorAll('.hud__marker')];
  const vals = els.map((el) => el.querySelector('[data-val]'));
  const mouse = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  const t0 = performance.now();
  const tick = () => {
    const t = (performance.now() - t0) / 1000;
    MARKERS.forEach((m, i) => {
      const v = m.base + Math.sin(t * 0.6 + i * 1.7) * m.amp;
      vals[i].textContent = (m.key === 'DEPTH' ? Math.round(v) : v.toFixed(2)) + (m.unit || '');
      const px = (m.x - 50) * 0.04 * mouse.x;
      const py = (m.y - 50) * 0.04 * mouse.y;
      els[i].style.transform = `translate(${px + Math.sin(t * 0.4 + i) * 4}px, ${py + Math.cos(t * 0.3 + i) * 4}px)`;
    });
    requestAnimationFrame(tick);
  };
  tick();
}
