import {
  mkdirSync,
  readdirSync,
  writeFileSync,
  statSync,
  copyFileSync,
  existsSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
const dir = "public/frames";
if (existsSync(`${dir}/manifest.json`))
  throw Error(
    "Sequence already prepared. Use a fresh staging directory for a new film.",
  );
mkdirSync(dir, { recursive: true });
const run = (args) => {
  const p = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-loglevel", "error", "-y", ...args],
    { stdio: "inherit" },
  );
  if (p.status !== 0) throw Error("FFmpeg failed");
};
run([
  "-i",
  "public/assets/story-original.mp4",
  "-an",
  "-vf",
  "fps=18,scale=1280:-2",
  "-c:v",
  "libwebp",
  "-quality",
  "78",
  "-start_number",
  "0",
  `${dir}/frame-%04d.webp`,
]);
const frames = readdirSync(dir)
  .filter((n) => /^frame-\d{4}\.webp$/.test(n))
  .sort();
if (!frames.length) throw Error("No frames extracted");
frames.forEach((n, i) => {
  if (
    n !== `frame-${String(i).padStart(4, "0")}.webp` ||
    statSync(`${dir}/${n}`).size === 0
  )
    throw Error("Missing/empty frame");
});
copyFileSync(`${dir}/${frames.at(-1)}`, "public/assets/cafe.webp");
const probe = spawnSync(
  "ffprobe",
  [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height,duration",
    "-of",
    "json",
    "public/assets/story-original.mp4",
  ],
  { encoding: "utf8" },
);
if (probe.status !== 0) throw Error("ffprobe failed");
const source = JSON.parse(probe.stdout).streams[0];
const manifest = {
  count: frames.length,
  fps: 18,
  width: 1280,
  height: Math.round((1280 * source.height) / source.width / 2) * 2,
  pattern: "/frames/frame-%04d.webp",
  poster: "/assets/poster.webp",
  duration: Number(source.duration),
  totalBytes: frames.reduce((n, f) => n + statSync(`${dir}/${f}`).size, 0),
  source,
};
writeFileSync(`${dir}/manifest.json`, JSON.stringify(manifest, null, 2));
console.log(manifest);
