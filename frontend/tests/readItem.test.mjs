import test from "node:test";
import assert from "node:assert";
import { fetchItem, ReadError } from "../src/lib/api/readItem.ts";

const res = (status, body = {}) => ({ status, ok: status >= 200 && status < 300, json: async () => body });
const sequence = (...steps) => {
  const calls = [];
  const fn = async (url, init) => {
    calls.push(init);
    const step = steps[Math.min(calls.length - 1, steps.length - 1)];
    if (step instanceof Error) throw step;
    return step;
  };
  fn.calls = calls;
  return fn;
};

test("200 returns the body", async () => {
  assert.deepEqual(await fetchItem("u", sequence(res(200, { a: 1 })), {}, 0), { a: 1 });
});

test("404 is missing: null, no retry", async () => {
  const f = sequence(res(404));
  assert.equal(await fetchItem("u", f, {}, 0), null);
  assert.equal(f.calls.length, 1);
});

test("a 5xx is retried once, uncached, and can recover", async () => {
  const f = sequence(res(503), res(200, { ok: true }));
  assert.deepEqual(await fetchItem("u", f, { next: { revalidate: 60 } }, 0), { ok: true });
  assert.equal(f.calls.length, 2);
  assert.deepEqual(f.calls[1], { cache: "no-store" });
});

test("a 5xx twice throws, never null", async () => {
  const f = sequence(res(500));
  await assert.rejects(fetchItem("u", f, {}, 0), (e) => e instanceof ReadError && e.status === 500);
  assert.equal(f.calls.length, 2);
});

test("network errors throw after one retry", async () => {
  const f = sequence(new Error("fetch failed"));
  await assert.rejects(fetchItem("u", f, {}, 0), ReadError);
  assert.equal(f.calls.length, 2);
});

test("a 404 on the retry still means missing", async () => {
  assert.equal(await fetchItem("u", sequence(res(502), res(404)), {}, 0), null);
});

import { classifyStatus } from "../src/lib/api/readItem.ts";

test("classifyStatus: only 404 is missing; 5xx and odd codes are unavailable", () => {
  assert.equal(classifyStatus(200), "exists");
  assert.equal(classifyStatus(404), "missing");
  for (const s of [500, 502, 503, 429, 301, 403]) assert.equal(classifyStatus(s), "unavailable", String(s));
});
