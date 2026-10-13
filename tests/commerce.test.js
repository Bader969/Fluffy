import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeCart,
  total,
  createSlots,
  validateRequest,
  berlinParts,
} from "../src/commerce-core.js";
import handler from "../api/commerce.js";
test("totals use authoritative integer-cent prices and merge quantities", () => {
  assert.equal(
    total([
      { id: "klassisch", quantity: 2, price: 1 },
      { id: "matcha", quantity: 1 },
    ]),
    4500,
  );
  assert.deepEqual(
    normalizeCart([
      { id: "klassisch", quantity: 1 },
      { id: "klassisch", quantity: 2 },
    ]),
    [{ id: "klassisch", quantity: 3 }],
  );
});
test("rejects forged products, negative or fractional quantities and duplicate overflow", () => {
  for (const items of [
    [{ id: "fake", quantity: 1 }],
    [{ id: "matcha", quantity: -1 }],
    [{ id: "matcha", quantity: 1.5 }],
    [
      { id: "matcha", quantity: 8 },
      { id: "matcha", quantity: 8 },
    ],
  ])
    assert.throws(() => normalizeCart(items));
});
test("Berlin slots respect lead time, closing time and local date", () => {
  const slots = createSlots(new Date("2026-10-12T12:01:00Z"));
  assert.equal(slots[0].id, "2026-10-12T15:00");
  assert.ok(
    slots
      .filter((s) => s.id.startsWith("2026-10-12"))
      .every((s) => s.id <= "2026-10-12T18:45"),
  );
  assert.equal(
    berlinParts(new Date("2026-10-12T22:30:00Z")).date,
    "2026-10-13",
  );
});
test("Berlin DST uses correct winter offset and skips closed weekdays", () => {
  assert.equal(berlinParts(new Date("2026-10-25T12:00:00Z")).minutes, 780);
  const slots = createSlots(new Date("2026-10-12T08:00:00Z"), {
    open: 11,
    close: 19,
    closedDays: [1],
  });
  assert.ok(!slots.some((s) => s.id.startsWith("2026-10-12")));
});
test("checkout requires a current slot, consent and valid contact details", () => {
  const slots = createSlots(new Date("2026-10-12T10:00:00Z"));
  const body = {
    kind: "order",
    name: "Test Gast",
    email: "gast@example.com",
    slot: slots[0].id,
    consent: true,
    items: [{ id: "klassisch", quantity: 1 }],
  };
  assert.equal(validateRequest(body, slots).total, 1450);
  for (const update of [
    { slot: "2020-01-01T11:00" },
    { consent: false },
    { email: "bad" },
    { items: [] },
  ])
    assert.throws(() => validateRequest({ ...body, ...update }, slots));
});
test("reservation rejects unsupported party sizes", () => {
  const slots = createSlots();
  assert.throws(() =>
    validateRequest(
      {
        kind: "reservation",
        name: "Test Gast",
        email: "gast@example.com",
        slot: slots[0].id,
        consent: true,
        guests: 9,
      },
      slots,
    ),
  );
});
test("brand MVP permanently rejects commerce requests", async () => {
  const previous = process.env.COMMERCE_ENABLED;
  process.env.COMMERCE_ENABLED = "false";
  let code, payload;
  const res = {
    setHeader() {},
    status(n) {
      code = n;
      return this;
    },
    json(data) {
      payload = data;
      return this;
    },
  };
  await handler({ method: "POST", headers: {}, body: {} }, res);
  assert.equal(code, 410);
  assert.equal(payload.accepted, undefined);
  if (previous === undefined) delete process.env.COMMERCE_ENABLED;
  else process.env.COMMERCE_ENABLED = previous;
});
