/**
 * The scroll narrative. Pure-3D sections (hero, world, archive, manifest) are
 * transparent text overlaid on the live WebGL world. Image/video sections are
 * full-bleed, edge-to-edge panels — no boxes — with copy and HUD overlaid,
 * styled after the reference frames.
 */
export function injectContent(root) {
  root.innerHTML = `
    <section class="section section--hero" id="top">
      <p class="eyebrow reveal">No.01 — Frozen archive</p>
      <h1 class="display reveal">Some stories are<br/>never told.<br/><em>We keep them in ice.</em></h1>
      <p class="lede reveal">untold is a studio preserving the moments that slipped past language — sealed in a slow winter, suspended in light, waiting to thaw.</p>
      <div class="coords reveal"><span>MONOLITH EXP</span><span>71.2°N / 156.8°W</span><span>EST. 2026</span></div>
    </section>

    <!-- FULL-BLEED · aurora · THE ICE REMEMBERS -->
    <section class="panel panel--center" id="remembers">
      <div class="panel__bg" data-media data-key="aurora"></div>
      <div class="panel__veil"></div>
      <div class="panel__content">
        <p class="eyebrow eyebrow--light reveal">/////// Transmission</p>
        <h2 class="statement reveal">The ice<br/>remembers.</h2>
        <p class="lede lede--center reveal">Long after we forget, the cold keeps the record — every face, every winter, every word we never said. We only learned to read it.</p>
        <div class="panel__nav reveal"><span>X</span><a href="mailto:hello@untold.studio">CONTACT</a></div>
        <div class="coords coords--center reveal"><span>MONOLITH EXP</span><span>71.2°N / 156.8°W</span><span>EST. 2026</span></div>
      </div>
    </section>

    <section class="section" id="world">
      <p class="eyebrow reveal">The world</p>
      <h2 class="display reveal">A single descent<br/>through frozen <em>time.</em></h2>
      <p class="lede reveal">One continuous flight. No cuts, no doors. You fall — weightless — past monoliths of glass while the cold light bends around every memory we've kept.</p>
    </section>

    <!-- FULL-BLEED · ice tunnel portal · WITHIN THE STRUCTURE -->
    <section class="panel panel--center" id="structure">
      <div class="panel__bg" data-media data-key="tunnel"></div>
      <div class="panel__veil panel__veil--soft"></div>
      <div class="panel__content">
        <p class="eyebrow eyebrow--light reveal">/////// Chamber — descent</p>
        <h2 class="statement reveal">Within the<br/>structure.</h2>
        <p class="lede lede--center reveal">Pass through the rings. Each is a threshold deeper into the monolith, where the temperature drops and the records grow older, clearer, colder.</p>
        <p class="lede lede--center lede--mute reveal">Three documents, kept cold enough to stay honest.</p>
      </div>
    </section>

    <section class="section" id="archive">
      <p class="eyebrow reveal">The archive</p>
      <h2 class="display reveal">Five things we<br/>refused to lose.</h2>
      <div class="archive reveal">
        <div class="archive__row"><span class="archive__no">001</span><span class="archive__name">Origin</span><span class="archive__year">'19</span></div>
        <div class="archive__row"><span class="archive__no">002</span><span class="archive__name">Drift</span><span class="archive__year">'21</span></div>
        <div class="archive__row"><span class="archive__no">003</span><span class="archive__name">Fracture</span><span class="archive__year">'23</span></div>
        <div class="archive__row"><span class="archive__no">004</span><span class="archive__name">Bloom</span><span class="archive__year">'24</span></div>
        <div class="archive__row"><span class="archive__no">005</span><span class="archive__name">Vanish</span><span class="archive__year">'26</span></div>
      </div>
    </section>

    <!-- FULL-BLEED · crystal macro · SPECIMEN -->
    <section class="panel panel--right" id="specimen">
      <div class="panel__bg" data-media data-key="crystal"></div>
      <div class="panel__veil panel__veil--right"></div>
      <div class="panel__content panel__content--right">
        <p class="eyebrow reveal">Specimen 003 / Fracture</p>
        <h2 class="display reveal">Frozen at the<br/>exact <em>moment.</em></h2>
        <p class="lede reveal">Captured the instant before it was lost and suspended whole — every facet, every fracture, held at the temperature of memory.</p>
        <dl class="spec reveal">
          <div><dt>Core temp</dt><dd>−41.2°</dd></div>
          <div><dt>Clarity</dt><dd>0.98</dd></div>
          <div><dt>State</dt><dd>Preserved</dd></div>
        </dl>
      </div>
    </section>

    <!-- FULL-BLEED · monolith video · MOTION -->
    <section class="panel panel--bottom" id="motion">
      <div class="panel__bg" data-media data-key="monolith"></div>
      <div class="panel__veil"></div>
      <div class="panel__content panel__content--bottom">
        <p class="eyebrow eyebrow--light reveal">Captured in motion</p>
        <h2 class="display reveal">Light, refracted<br/>through <em>memory.</em></h2>
        <span class="media__label media__label--inline reveal">untold — monolith / the seam</span>
      </div>
    </section>

    <section class="section section--right" id="manifest">
      <p class="eyebrow reveal">Manifest</p>
      <h2 class="display reveal">We don't record.<br/>We <em>preserve.</em></h2>
      <p class="lede reveal">Every artefact you passed is real, modelled and frozen in real time. Move your cursor — the ice answers. Nothing here is a video of a place. It is the place.</p>
    </section>

    <section class="outro" id="enter">
      <div class="outro__main">
        <p class="outro__sub reveal">The thaw begins with you</p>
        <h2 class="outro__word reveal">untold</h2>
        <a class="nav__cta reveal" href="mailto:hello@untold.studio">Enter the archive <span>↘</span></a>
        <svg class="constellation reveal" viewBox="0 0 240 120" aria-hidden="true">
          <polyline points="20,90 60,40 110,70 150,30 200,80 220,50" />
          <circle cx="20" cy="90" r="2"/><circle cx="60" cy="40" r="2"/><circle cx="110" cy="70" r="2"/>
          <circle cx="150" cy="30" r="2"/><circle cx="200" cy="80" r="2"/><circle cx="220" cy="50" r="2"/>
        </svg>
      </div>
      <footer class="footer">
        <span>untold® — Monolith Exp. 2026</span>
        <span>// Frozen in real-time · Three.js</span>
        <span>71.2°N / Perpetual winter</span>
      </footer>
    </section>
  `;
}
