export const clamp = value => Math.max(0, Math.min(1, value));
export function storyTime(progress, duration) {
  return clamp(progress / 0.93) * Math.max(0, duration - 1 / 24);
}
export function approachTime(current, target, elapsed) {
  const next = current + (target - current) * (1 - Math.exp(-Math.min(elapsed, 64) / 80));
  return Math.abs(target - next) < 1 / 48 ? target : next;
}
