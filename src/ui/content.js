/**
 * untold — Islamabad rave festival.
 *   GALLERY (Higgsfield · slide-snap): cinematic festival teaser panels.
 *   WORLD   (particles · smooth scroll): the wordmark cloud morphs
 *     untold → AIRBEAT → DIMENSIONS → AWAKENING → untold, one per section,
 *     with the event details overlaid.
 */
export function injectContent(root) {
  root.innerHTML = `
    <!-- ============================ GALLERY (teaser) ============================ -->

    <section class="panel panel--center" id="intro">
      <div class="panel__bg" data-media data-key="crowd"></div>
      <div class="panel__veil"></div>
      <div class="panel__content">
        <p class="eyebrow eyebrow--light reveal">Islamabad · est. 2026</p>
        <h2 class="statement reveal">untold</h2>
        <p class="lede lede--center reveal">A rave is a story you can't tell afterwards. We throw the ones worth not remembering.</p>
        <div class="coords coords--center reveal"><span>ISLAMABAD · PK</span><span>33.6°N / 73.0°E</span><span>SUMMER 2026</span></div>
      </div>
    </section>

    <section class="panel panel--center" id="teaser">
      <div class="panel__bg" data-media data-key="lights"></div>
      <div class="panel__veil panel__veil--soft"></div>
      <div class="panel__content">
        <p class="eyebrow eyebrow--light reveal">/////// Three nights</p>
        <h2 class="statement reveal">Lights down.<br/>Bass up.</h2>
        <p class="lede lede--center reveal">Three festivals. One August. The loudest the capital has ever been.</p>
      </div>
    </section>

    <section class="panel panel--bottom" id="film">
      <div class="panel__bg" data-media data-key="venue"></div>
      <div class="panel__veil"></div>
      <div class="panel__content panel__content--bottom">
        <p class="eyebrow eyebrow--light reveal">Under the Margallas</p>
        <h2 class="display reveal">Where the city<br/>comes to <em>disappear.</em></h2>
        <span class="media__label media__label--inline reveal">untold — Islamabad / 2026</span>
      </div>
    </section>

    <!-- ============================ WORLD (particles) ============================ -->

    <section class="section section--hero" id="top">
      <p class="eyebrow reveal">No.00 — The festival</p>
      <p class="lede reveal">untold is a rave collective from Islamabad, Pakistan — three nights of electronic music under the Margalla hills this August.</p>
      <div class="coords reveal"><span>Scroll to enter the lineup</span></div>
    </section>

    <section class="section section--right" id="airbeat">
      <p class="eyebrow reveal">01 / Festival</p>
      <div class="event reveal">
        <div class="event__date">Fri 7 — Sat 8 Aug 2026</div>
        <div class="event__meta"><span>Shakarparian Hills</span><span>Islamabad</span></div>
        <p class="event__lede">Open-air mainstage. Big-room, trance and melodic techno until the call to dawn.</p>
        <a class="link-cta" href="#enter">Get tickets <span>↘</span></a>
      </div>
    </section>

    <section class="section section--right" id="dimensions">
      <p class="eyebrow reveal">02 / Festival</p>
      <div class="event reveal">
        <div class="event__date">Fri 14 — Sun 16 Aug 2026</div>
        <div class="event__meta"><span>Rawal Lake Amphitheatre</span><span>Islamabad</span></div>
        <p class="event__lede">Three stages by the water. Deep house, minimal and dub for the heads who stay late.</p>
        <a class="link-cta" href="#enter">Get tickets <span>↘</span></a>
      </div>
    </section>

    <section class="section section--right" id="awakening">
      <p class="eyebrow reveal">03 / Festival</p>
      <div class="event reveal">
        <div class="event__date">Sat 22 — Sun 23 Aug 2026</div>
        <div class="event__meta"><span>Margalla Greens</span><span>Islamabad</span></div>
        <p class="event__lede">Sunrise set. Progressive and organic house to carry you into the morning light.</p>
        <a class="link-cta" href="#enter">Get tickets <span>↘</span></a>
      </div>
    </section>

    <section class="outro" id="enter">
      <div class="outro__main">
        <p class="outro__sub reveal">Three nights · Islamabad · August 2026</p>
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
