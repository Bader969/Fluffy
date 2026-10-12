import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
export function setupMotion() {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const lenis = reduce.matches
    ? null
    : new Lenis({
        duration: 1.15,
        smoothWheel: true,
        anchors: true,
        autoRaf: false,
      });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.body.classList.toggle(
    "reduced",
    reduce.matches || !!navigator.connection?.saveData,
  );
  if (!reduce.matches) {
    document.fonts.ready.then(() => {
      const heading = document.querySelector(".reveal-title");
      const split = new SplitType(heading, { types: "words" });
      heading.setAttribute(
        "aria-label",
        "Wie eine Wolke. Handgefertigt in Perfektion.",
      );
      split.words.forEach((w) => w.setAttribute("aria-hidden", "true"));
      gsap.from(split.words, {
        y: 38,
        rotate: 2,
        stagger: 0.07,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: heading, start: "top 88%", once: true },
      });
      ScrollTrigger.refresh();
    });
    if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
      const cursor = document.querySelector("#cursor"),
        text = cursor.querySelector("span");
      let x = 0,
        y = 0,
        tx = 0,
        ty = 0;
      document.addEventListener(
        "pointermove",
        (e) => {
          tx = e.clientX;
          ty = e.clientY;
        },
        { passive: true },
      );
      gsap.ticker.add(() => {
        x += (tx - x) * 0.2;
        y += (ty - y) * 0.2;
        cursor.style.left = x + "px";
        cursor.style.top = y + "px";
      });
      document.addEventListener("pointerover", (e) => {
        const el = e.target.closest("[data-cursor]");
        cursor.classList.toggle("active", !!el);
        text.textContent = el?.dataset.cursor || "";
      });
      document.querySelectorAll(".magnetic").forEach((el) => {
        el.addEventListener("pointermove", (e) => {
          const b = el.getBoundingClientRect();
          gsap.to(el, {
            x: (e.clientX - b.left - b.width / 2) * 0.13,
            y: (e.clientY - b.top - b.height / 2) * 0.2,
            duration: 0.3,
          });
        });
        el.addEventListener("pointerleave", () =>
          gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,.5)" }),
        );
      });
    }
  }
  reduce.addEventListener("change", () => location.reload());
  return { stop: () => lenis?.stop(), start: () => lenis?.start() };
}
export function setupSound() {
  let context,
    gain,
    noise,
    oscillator,
    enabled = false;
  const button = document.querySelector("#sound-toggle");
  button.addEventListener("click", async () => {
    try {
      if (!context) {
        context = new AudioContext();
        gain = context.createGain();
        gain.gain.value = 0;
        gain.connect(context.destination);
        const buffer = context.createBuffer(
          1,
          context.sampleRate * 4,
          context.sampleRate,
        );
        const data = buffer.getChannelData(0);
        let previous = 0;
        for (let i = 0; i < data.length; i++) {
          previous = (previous + Math.random() * 0.04 - 0.02) / 1.02;
          data[i] = previous;
        }
        noise = context.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        const filter = context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 380;
        noise.connect(filter);
        filter.connect(gain);
        noise.start();
        oscillator = context.createOscillator();
        oscillator.frequency.value = 110;
        const tone = context.createGain();
        tone.gain.value = 0.008;
        oscillator.connect(tone);
        tone.connect(gain);
        oscillator.start();
      }
      await context.resume();
      enabled = !enabled;
      gain.gain.setTargetAtTime(enabled ? 0.25 : 0, context.currentTime, 0.4);
      button.setAttribute("aria-pressed", String(enabled));
      button.textContent = enabled
        ? "♫ Klangkulisse: Sanftes Café-Ambiente"
        : "♫ Klangkulisse: Aus";
    } catch {
      button.textContent = "Klangkulisse nicht verfügbar";
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (context && document.hidden) {
      gain.gain.setTargetAtTime(0, context.currentTime, 0.1);
      enabled = false;
      button.setAttribute("aria-pressed", "false");
      button.textContent = "♫ Klangkulisse: Aus";
    }
  });
}
