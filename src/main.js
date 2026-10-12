const stage = document.querySelector(".stage"),
  story = document.querySelector(".story"),
  canvas = document.querySelector("canvas"),
  ctx = canvas.getContext("2d");
const chapters = [...document.querySelectorAll(".chapter")],
  bar = document.querySelector(".progress i"),
  label = document.querySelector(".chapter-label");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
let reduced = motion.matches || navigator.connection?.saveData,
  manifest,
  requested = 0,
  drawn = -1,
  cache = new Map(),
  pending = new Set(),
  failed = new Map(),
  raf = 0,
  disposed = false,
  paused = false;
const toggle = document.querySelector("#motion-toggle");
toggle.addEventListener("click", () => {
  paused = !paused;
  toggle.setAttribute("aria-pressed", String(paused));
  toggle.textContent = paused ? "Resume motion" : "Pause motion";
  if (!paused) schedule();
});
document.body.classList.toggle("reduced", !!reduced);
document.querySelector("#year").textContent = new Date().getFullYear();
document
  .querySelector("#replay")
  .addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" }),
  );
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
function frameAt(p) {
  const beats = [
    [0, 0],
    [0.1, 0.07],
    [0.42, 0.4],
    [0.59, 0.53],
    [0.92, 1],
    [1, 1],
  ];
  let i = 1;
  while (p > beats[i][0] && i < beats.length - 1) i++;
  const [a, x] = beats[i - 1],
    [b, y] = beats[i];
  return Math.round((x + ((y - x) * (p - a)) / (b - a)) * (manifest.count - 1));
}
function render() {
  raf = 0;
  const p = clamp(
    -story.getBoundingClientRect().top /
      (story.offsetHeight - innerHeight || 1),
  );
  bar.style.transform = `scaleX(${p})`;
  const chapter = p < 0.19 ? 0 : p < 0.43 ? 1 : p > 0.76 ? 2 : -1;
  chapters.forEach((el, i) => (el.hidden = i !== chapter));
  label.textContent =
    p < 0.19
      ? "THE FIRST HELLO"
      : p < 0.43
        ? "CLOSER TO CLOUD"
        : p < 0.76
          ? "INSIDE THE WARMTH"
          : "A MOMENT TO STAY";
  if (!manifest || reduced) return;
  requested = frameAt(p);
  draw();
  pump();
}
function draw() {
  const bitmap = cache.get(requested);
  if (!bitmap || paused) return;
  const dpr = Math.min(devicePixelRatio || 1, 1.5),
    w = Math.round(stage.clientWidth * dpr),
    h = Math.round(stage.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    drawn = -1;
  }
  if (drawn === requested) return;
  // Deepen the source film's macro move and conceal its soft environment dissolve.
  const t = requested / manifest.fps;
  const ease = (x) => { const n = clamp(x); return n * n * (3 - 2 * n); };
  const macro = ease((t - 4.7) / 2.5) * (1 - ease((t - 8.2) / 2.2));
  const mist = ease((t - 6.9) / 1.1) * (1 - ease((t - 8.4) / 1.4));
  const scale = Math.max(w / bitmap.width, h / bitmap.height) * (1 + macro * 2.2);
  ctx.filter = mist > .01 ? `blur(${mist * 24 * dpr}px)` : 'none';
  ctx.drawImage(
    bitmap,
    (w - bitmap.width * scale) * (w < h ? 0.63 : 0.5),
    (h - bitmap.height * scale) / 2,
    bitmap.width * scale,
    bitmap.height * scale,
  );
  ctx.filter = 'none';
  canvas.style.opacity = "1";
  drawn = requested;
}
function pump() {
  if (disposed) return;
  const candidates = [requested];
  for (let d = 1; d <= 8; d++) candidates.push(requested + d, requested - d);
  for (const n of candidates) {
    if (pending.size >= 4) break;
    if (
      n < 0 ||
      n >= manifest.count ||
      cache.has(n) ||
      pending.has(n) ||
      (failed.get(n) || 0) >= 2
    )
      continue;
    pending.add(n);
    fetch(`/frames/frame-${String(n).padStart(4, "0")}.webp`)
      .then((r) => {
        if (!r.ok) throw Error("frame");
        return r.blob();
      })
      .then(createImageBitmap)
      .then((b) => {
        if (disposed) {
          b.close();
          return;
        }
        cache.set(n, b);
        if (n === requested) draw();
        for (const [k, v] of cache) {
          if (cache.size > 28 && Math.abs(k - requested) > 10) {
            v.close();
            cache.delete(k);
          }
        }
      })
      .catch(() => failed.set(n, (failed.get(n) || 0) + 1))
      .finally(() => {
        pending.delete(n);
        pump();
      });
  }
}
function schedule() {
  if (!raf) raf = requestAnimationFrame(render);
}
addEventListener("scroll", schedule, { passive: true });
addEventListener("resize", () => {
  drawn = -1;
  schedule();
});
motion.addEventListener("change", (e) => {
  reduced = e.matches;
  document.body.classList.toggle("reduced", reduced);
  schedule();
});
addEventListener("pagehide", () => {
  disposed = true;
  cache.forEach((b) => b.close());
  cache.clear();
});
addEventListener("pageshow", () => {
  disposed = false;
  drawn = -1;
  schedule();
});
let idleTick = 0;
setInterval(() => {
  if (!manifest || reduced || disposed || document.hidden || scrollY > 3)
    return;
  idleTick = (idleTick + 1) % 36;
  requested = Math.round((idleTick <= 18 ? idleTick : 36 - idleTick) * 0.7);
  draw();
  pump();
}, 1000 / 18);
fetch("/frames/manifest.json")
  .then((r) => (r.ok ? r.json() : Promise.reject()))
  .then((m) => {
    manifest = m;
    schedule();
  })
  .catch(() => {});
render();
