/**
 * Wires Higgsfield-generated media into every [data-media] panel.
 * Each panel declares data-key; /media/manifest.json maps keys -> assets.
 * A panel uses video if present (muted/looped autoplay), else a still image,
 * else the CSS gradient placeholder is left untouched.
 */
export async function mountMedia() {
  const panels = [...document.querySelectorAll('[data-media]')];
  if (!panels.length) return;

  let manifest;
  try {
    const res = await fetch('./media/manifest.json', { cache: 'no-cache' });
    if (!res.ok) return;
    manifest = await res.json();
  } catch {
    return;
  }

  panels.forEach((panel) => {
    const key = panel.getAttribute('data-key');
    const entry = manifest[key];
    if (!entry) return;
    const label = panel.querySelector('.media__label');

    if (entry.video) {
      const v = document.createElement('video');
      v.src = `./media/${entry.video}`;
      if (entry.poster) v.poster = `./media/${entry.poster}`;
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.autoplay = true;
      v.preload = 'metadata';
      panel.insertBefore(v, label || null);
      v.play().catch(() => {});
    } else if (entry.poster) {
      const img = document.createElement('img');
      img.src = `./media/${entry.poster}`;
      img.alt = entry.caption || 'untold';
      panel.insertBefore(img, label || null);
    }

    if (label && entry.caption) label.textContent = entry.caption;
  });
}
