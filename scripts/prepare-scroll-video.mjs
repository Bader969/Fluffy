import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const source = '.local-assets/stacking-master.mp4';
mkdirSync('public/media', { recursive: true });
const outputs = [];
for (const [device, width, crf] of [['desktop', 1280, 25], ['mobile', 960, 24]]) {
  const path = `public/media/fluffy-story-${device}-v2.mp4`;
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-ss', '2', '-i', source,
    '-an', '-vf', `scale=${width}:-2`, '-c:v', 'libx264', '-preset', 'fast', '-crf', String(crf),
    '-g', '1', '-keyint_min', '1', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error('Videoexport fehlgeschlagen.');
  outputs.push({ path, width, bytes: statSync(path).size, allKeyframes: true, audio: false });
}
console.log(outputs);
