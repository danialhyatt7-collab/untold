/**
 * untold — Islamabad rave festival.
 *   GALLERY (Higgsfield · slide-snap): cinematic teaser panels.
 *   WORLD   (Three.js · smooth scroll): copy over the black-hole descent —
 *     the brand, the three festivals, the contact.
 */
export function injectContent(root) {
  root.innerHTML = `
    <!-- ============================ GALLERY (teaser) ============================ -->

    <section class="panel panel--center" id="intro">
      <div class="panel__bg" data-media data-key="hero"></div>
      <div class="panel__veil"></div>
      <div class="panel__content">
        <p class="eyebrow eyebrow--light reveal">Islamabad · Pakistan</p>
        <h2 class="statement reveal">untold</h2>
        <p class="lede lede--center reveal">An electronic music collective throwing the kind of nights you can't quite explain the morning after.</p>
        <div class="coords coords--center reveal"><span>ISLAMABAD · PK</span><span>33.6°N / 73.0°E</span><span>AUGUST 2026</span></div>
      </div>
    </section>

    <section class="panel panel--center" id="teaser">
      <div class="panel__bg" data-media data-key="tunnel"></div>
      <div class="panel__veil panel__veil--soft"></div>
      <div class="panel__content">
        <p class="eyebrow eyebrow--light reveal">/////// Summer 2026</p>
        <h2 class="statement reveal">Three nights.<br/>One August.</h2>
        <p class="lede lede--center reveal">Three festivals under the Margalla hills — the loudest the capital has ever been.</p>
      </div>
    </section>

    <section class="panel panel--bottom" id="film">
      <div class="panel__bg" data-media data-key="monolith"></div>
      <div class="panel__veil"></div>
      <div class="panel__content panel__content--bottom">
        <p class="eyebrow eyebrow--light reveal">Lights down. Bass up.</p>
        <h2 class="display reveal">Where the city<br/>comes to <em>let go.</em></h2>
        <span class="media__label media__label--inline reveal">untold — Islamabad / 2026</span>
      </div>
    </section>

    <!-- ============================ WORLD (Three.js · black hole) ============================ -->

    <section class="section section--hero" id="top">
      <p class="eyebrow reveal">The collective</p>
      <h1 class="display reveal">Music that<br/>pulls you <em>in.</em></h1>
      <p class="lede reveal">untold is a rave collective from Islamabad, Pakistan — three nights of electronic music this August, built around one idea: lose yourself completely.</p>
      <div class="coords reveal"><span>UNTOLD</span><span>ISLAMABAD · PK</span><span>EST. 2026</span></div>
    </section>

    <section class="section section--right" id="airbeat">
      <p class="eyebrow reveal">01 / Festival</p>
      <div class="event reveal">
        <div class="event__name">Airbeat</div>
        <div class="event__date">Fri 7 — Sat 8 Aug 2026</div>
        <div class="event__meta"><span>Shakarparian Hills</span><span>Islamabad</span></div>
        <p class="event__lede">Open-air mainstage. Big-room, trance and melodic techno until the call to dawn.</p>
        <a class="link-cta" href="#enter">Get tickets <span>↘</span></a>
      </div>
    </section>

    <section class="section section--right" id="dimensions">
      <p class="eyebrow reveal">02 / Festival</p>
      <div class="event reveal">
        <div class="event__name">Dimensions</div>
        <div class="event__date">Fri 14 — Sun 16 Aug 2026</div>
        <div class="event__meta"><span>Rawal Lake Amphitheatre</span><span>Islamabad</span></div>
        <p class="event__lede">Three stages by the water. Deep house, minimal and dub for the heads who stay late.</p>
        <a class="link-cta" href="#enter">Get tickets <span>↘</span></a>
      </div>
    </section>

    <section class="section section--right" id="awakening">
      <p class="eyebrow reveal">03 / Festival</p>
      <div class="event reveal">
        <div class="event__name">Awakening</div>
        <div class="event__date">Sat 22 — Sun 23 Aug 2026</div>
        <div class="event__meta"><span>Margalla Greens</span><span>Islamabad</span></div>
        <p class="event__lede">The sunrise set. Progressive and organic house to carry you into the morning light.</p>
        <a class="link-cta" href="#enter">Get tickets <span>↘</span></a>
      </div>
    </section>

    <section class="outro" id="enter">
      <div class="outro__main">
        <p class="outro__sub reveal">Three nights · Islamabad · August 2026</p>
        <h2 class="outro__word reveal">untold</h2>
        <a class="link-cta link-cta--big reveal" href="tel:+923374841818">+92 33 7484 1818</a>
        <div class="outro__links reveal">
          <a href="mailto:hello@untold.pk">hello@untold.pk</a>
          <a href="#top">Instagram</a>
          <a href="#top">Tickets</a>
        </div>
      </div>
      <footer class="footer">
        <span>untold® — Islamabad, Pakistan</span>
        <span>// Rave responsibly</span>
        <span>+92 33 7484 1818</span>
      </footer>
    </section>
  `;
}
