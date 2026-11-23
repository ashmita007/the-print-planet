import test from "node:test";
import assert from "node:assert";
import { quantityStep, quantityMax, clampQuantity, parseQuantity } from "../src/lib/quantity.ts";

test("step follows MOQ", () => {
  assert.equal(quantityStep(1), 1);
  assert.equal(quantityStep(9), 1);
  assert.equal(quantityStep(10), 10);
  assert.equal(quantityStep(99), 10);
  assert.equal(quantityStep(100), 50);
});

test("max only when stock tracked and positive", () => {
  assert.equal(quantityMax(null), undefined);
  assert.equal(quantityMax(undefined), undefined);
  assert.equal(quantityMax(40), 40);
});

test("clamp respects min and max", () => {
  assert.equal(clampQuantity(3, 10, 100), 10);
  assert.equal(clampQuantity(500, 10, 100), 100);
  assert.equal(clampQuantity(500, 10), 500);
  assert.equal(clampQuantity(5, 10, 8), 10);
});

test("parse rejects junk", () => {
  assert.equal(parseQuantity("25"), 25);
  assert.equal(parseQuantity(""), null);
  assert.equal(parseQuantity("abc"), null);
  assert.equal(parseQuantity("0"), 0);
  assert.equal(parseQuantity("-3"), null);
  assert.equal(parseQuantity("2.5"), null);
});

import { MAX_QUANTITY, nextCartQuantity } from "../src/lib/quantity.ts";

test("hard cap and comma parsing", () => {
  assert.equal(clampQuantity(99_999_999, 1), MAX_QUANTITY);
  assert.equal(parseQuantity("1,200"), 1200);
  assert.equal(parseQuantity(" 1 200 "), 1200);
  assert.equal(parseQuantity("0"), 0);
  assert.equal(clampQuantity(parseQuantity("0"), 25), 25);
  assert.equal(parseQuantity("9999999999999"), null);
});

test("cart quantity: never below MOQ (no removal), capped by stock, flagged when capped", () => {
  const line = { quantity: 50, minimumOrderQuantity: 50, stockQuantity: 120 };
  assert.deepEqual(nextCartQuantity(line, 0), { quantity: 50, cappedByStock: false });
  assert.deepEqual(nextCartQuantity(line, -5), { quantity: 50, cappedByStock: false });
  assert.deepEqual(nextCartQuantity(line, 100), { quantity: 100, cappedByStock: false });
  assert.deepEqual(nextCartQuantity(line, 500), { quantity: 120, cappedByStock: true });
  assert.deepEqual(nextCartQuantity({ ...line, stockQuantity: null }, 500), { quantity: 500, cappedByStock: false });
});
