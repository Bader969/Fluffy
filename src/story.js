export function setupStory() {
  const story = document.querySelector(".story"),
    stage = document.querySelector(".stage"),
    canvas = document.querySelector("#story-canvas"),
    ctx = canvas.getContext("2d"),
    opening = document.querySelector(".hero-copy"),
    caption = document.querySelector(".hero-caption"),
    label = document.querySelector(".story-step"),
    bar = document.querySelector(".progress i"),
    toggle = document.querySelector("#motion-toggle");
  const reduced =
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    navigator.connection?.saveData;
  let staticMode = !!reduced;
  let manifest,
    requested = 0,
    drawn = -1,
    paused = false,
    disposed = false,
    raf = 0;
  const cache = new Map(),
    pending = new Map(),
    failed = new Map();
  const clamp = (n) => Math.max(0, Math.min(1, n));
  function draw() {
    const image = cache.get(requested);
    if (!image || paused) return;
    const dpr = Math.min(devicePixelRatio || 1, 2),
      w = Math.round(stage.clientWidth * dpr),
      h = Math.round(stage.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      drawn = -1;
    }
    if (drawn === requested) return;
    const scale = Math.max(w / image.width, h / image.height);
    ctx.drawImage(
      image,
      (w - image.width * scale) * (w < h ? 0.62 : 0.5),
      (h - image.height * scale) / 2,
      image.width * scale,
      image.height * scale,
    );
    drawn = requested;
    canvas.style.opacity = "1";
  }
  function pump() {
    if (disposed || reduced || paused) return;
    const limit = Math.max(
      4,
      Math.min(
        16,
        Math.floor((90 * 1024 * 1024) / (manifest.width * manifest.height * 4)),
      ),
    );
    const candidates = [requested];
    for (let d = 1; d <= 5; d++) candidates.push(requested + d, requested - d);
    candidates.splice(limit);
    for (const n of candidates) {
      if (pending.size >= 3) break;
      if (
        n < 0 ||
        n >= manifest.count ||
        cache.has(n) ||
        pending.has(n) ||
        (failed.get(n) || 0) >= 2
      )
        continue;
      const controller = new AbortController();
      pending.set(n, controller);
      const file = manifest.pattern.replace("%04d", String(n).padStart(4, "0"));
      fetch(file, { signal: controller.signal })
        .then((r) => {
          if (!r.ok) throw Error();
          return r.blob();
        })
        .then(createImageBitmap)
        .then((image) => {
          if (disposed) {
            image.close();
            return;
          }
          cache.set(n, image);
          draw();
          const max = Math.max(
            4,
            Math.min(
              16,
              Math.floor((90 * 1024 * 1024) / (image.width * image.height * 4)),
            ),
          );
          const far = [...cache.keys()].sort(
            (a, b) => Math.abs(b - requested) - Math.abs(a - requested),
          );
          while (cache.size > max) {
            const key = far.shift();
            cache.get(key).close();
            cache.delete(key);
          }
        })
        .catch((error) => {
          if (error.name !== "AbortError")
            failed.set(n, (failed.get(n) || 0) + 1);
        })
        .finally(() => {
          pending.delete(n);
          pump();
        });
    }
  }
  function render() {
    raf = 0;
    if (staticMode) {
      opening.hidden = false;
      caption.hidden = true;
      return;
    }
    const p = clamp(
      -story.getBoundingClientRect().top /
        (story.offsetHeight - innerHeight || 1),
    );
    opening.hidden = p > 0.2;
    document.querySelector(".hero-wash").style.opacity = String(1 - clamp(p / 0.2));
    caption.hidden = p < 0.69 || p > 0.93;
    label.textContent =
      p < 0.28
        ? "01 / DIE LEICHTIGKEIT"
        : p < 0.66
          ? "02 / IM HERZEN DER WOLKE"
          : "03 / EIN MOMENT DER RUHE";
    bar.style.transform = `scaleX(${p})`;
    if (!manifest || reduced) return;
    const start = manifest.startFrame || 0;
    requested = start + Math.round(clamp(p / 0.93) * (manifest.count - 1 - start));
    for (const [n, c] of pending) if (Math.abs(n - requested) > 20) c.abort();
    draw();
    pump();
  }
  function schedule() {
    if (!raf) raf = requestAnimationFrame(render);
  }
  toggle.addEventListener("click", () => {
    paused = !paused;
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.textContent = paused ? "Bewegung fortsetzen" : "Bewegung pausieren";
    if (!paused) schedule();
  });
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", () => {
    drawn = -1;
    schedule();
  });
  addEventListener("pagehide", () => {
    disposed = true;
    pending.forEach((c) => c.abort());
    cache.forEach((i) => i.close());
    cache.clear();
  });
  addEventListener("pageshow", () => {
    disposed = false;
    drawn = -1;
    schedule();
  });
  if (!reduced)
    fetch("/frames/stacking/manifest.json")
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((data) => {
        manifest =
          innerWidth < 700 && data.mobile ? { ...data, ...data.mobile } : data;
        schedule();
      })
      .catch(() => {
        staticMode = true;
        document.body.classList.add("reduced");
        opening.hidden = false;
        caption.hidden = true;
      });
  render();
}
