import test from 'node:test';
import assert from 'node:assert/strict';
import { storyTime, approachTime } from '../src/story-timing.js';
import { productMarkup, menuMarkup } from '../src/render-catalog.js';
test('scroll time clamps both ends and holds the final frame', () => {
  assert.equal(storyTime(-1, 13), 0);
  assert.equal(storyTime(1, 13), 13 - 1 / 24);
  assert.equal(storyTime(.93, 13), storyTime(1, 13));
  assert.equal(storyTime(.5, 0), 0);
});
test('scroll smoothing converges in either direction without overshoot', () => {
  for (const [start, target] of [[0, 12], [12, 0]]) {
    let position = start;
    for (let i = 0; i < 80; i++) {
      position = approachTime(position, target, 16);
      assert.ok(position >= Math.min(start, target) && position <= Math.max(start, target));
    }
    assert.equal(position, target);
  }
});
test('static catalog contains all three priced products and no order controls', () => {
  const html = productMarkup();
  assert.equal((html.match(/class="product-card"/g) || []).length, 3);
  assert.ok(html.includes('Karamell & Butter'));
  assert.ok(!html.includes('data-add'));
  assert.ok(menuMarkup().includes('Unsere Soufflé-Klassiker'));
});
