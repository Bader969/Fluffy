import { clamp, storyTime, approachTime } from './story-timing.js';

export function setupStory() {
  const story = document.querySelector('.story');
  const video = document.querySelector('#story-video');
  const opening = document.querySelector('.hero-copy');
  const caption = document.querySelector('.hero-caption');
  const wash = document.querySelector('.hero-wash');
  const label = document.querySelector('.story-step');
  const bar = document.querySelector('.progress i');
  const toggle = document.querySelector('#motion-toggle');
  const status = document.querySelector('.story-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData;
  let ready = false, paused = false, visible = true, stopped = false;
  let target = 0, position = 0, raf = 0, lastTick = 0, blobURL, seekTimer;
  const controller = new AbortController();
  video.muted = true;

  function fallback() {
    stopped = true; ready = false;
    cancelAnimationFrame(raf); clearTimeout(seekTimer);
    controller.abort(); video.style.opacity = '0';
    document.body.classList.add('reduced');
    opening.hidden = false; caption.hidden = true; wash.style.opacity = '1';
    status.hidden = true; toggle.hidden = true;
    story.dataset.mediaState = 'static';
  }
  function schedule() {
    if (!raf && !stopped && !document.hidden) raf = requestAnimationFrame(tick);
  }
  function tick(now) {
    raf = 0;
    const p = clamp(-story.getBoundingClientRect().top / Math.max(1, story.offsetHeight - innerHeight));
    opening.hidden = p > .2;
    wash.style.opacity = String(1 - clamp(p / .2));
    caption.hidden = p < .69 || p > .93;
    label.textContent = p < .28 ? '01 / DIE LEICHTIGKEIT' : p < .66 ? '02 / IM HERZEN DER WOLKE' : '03 / EIN MOMENT DER RUHE';
    bar.style.transform = `scaleX(${p})`;
    if (!ready || paused || !visible) { lastTick = now; return; }
    target = storyTime(p, video.duration);
    if (video.seeking) return; // One seek at a time; intermediate scroll targets are coalesced.
    const elapsed = lastTick ? now - lastTick : 16;
    lastTick = now;
    position = approachTime(position, target, elapsed);
    if (Math.abs(video.currentTime - position) >= 1 / 48) {
      video.currentTime = position;
      clearTimeout(seekTimer);
      seekTimer = setTimeout(fallback, 5000);
    } else if (Math.abs(position - target) >= 1 / 48) schedule();
  }
  video.addEventListener('seeked', () => {
    clearTimeout(seekTimer);
    if (!stopped) { video.style.opacity = '1'; schedule(); }
  });
  video.addEventListener('loadeddata', () => {
    if (stopped) return;
    ready = true; status.hidden = true; toggle.disabled = false;
    story.dataset.mediaState = 'ready';
    video.style.opacity = '1'; schedule();
  });
  video.addEventListener('error', fallback);
  toggle.addEventListener('click', () => {
    paused = !paused;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Bewegung fortsetzen' : 'Bewegung pausieren';
    if (!paused) { lastTick = 0; schedule(); }
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else { lastTick = 0; schedule(); }
  });
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) { lastTick = 0; schedule(); }
  });
  observer.observe(story);
  addEventListener('pagehide', event => {
    cancelAnimationFrame(raf); raf = 0;
    if (!event.persisted) {
      stopped = true; controller.abort(); observer.disconnect(); clearTimeout(seekTimer);
      if (blobURL) URL.revokeObjectURL(blobURL);
    }
  });
  addEventListener('pageshow', () => { lastTick = 0; schedule(); });
  if (reduced) { fallback(); return; }
  story.dataset.mediaState = 'loading';
  status.hidden = false; toggle.disabled = true;
  const url = innerWidth < 700 ? '/media/fluffy-story-mobile-v2.mp4' : '/media/fluffy-story-desktop-v2.mp4';
  const timeout = setTimeout(fallback, 25000);
  // A single complete compressed download replaces hundreds of network-dependent image requests.
  fetch(url, { signal: controller.signal })
    .then(response => { if (!response.ok) throw Error('Film nicht verfügbar'); return response.blob(); })
    .then(blob => {
      if (stopped) return;
      blobURL = URL.createObjectURL(blob); video.src = blobURL; video.load();
    })
    .catch(() => { if (!stopped) fallback(); });
  video.addEventListener('loadeddata', () => clearTimeout(timeout), { once: true });
  schedule();
}
