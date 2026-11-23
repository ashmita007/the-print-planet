import test from "node:test";
import assert from "node:assert";
import { formatCategoryLabel } from "../src/lib/formatters.ts";
import { catalogueTotal } from "../src/lib/catalogueTotal.ts";

test("category labels become Title Case with acronyms kept", () => {
  assert.equal(formatCategoryLabel("ID CARD LANYARD OVAL FISH HOOK"), "ID Card Lanyard Oval Fish Hook");
  assert.equal(formatCategoryLabel("PVC AND SMART CARDS"), "PVC and SMART Cards");
  assert.equal(formatCategoryLabel("RFID SMART CARDS & CONSUMABLES"), "RFID SMART Cards & Consumables");
  assert.equal(formatCategoryLabel("UV PRINTING FOR A4 SHEETS"), "UV Printing for A4 Sheets");
});

test("category label fixes known catalogue typos and empty input", () => {
  assert.equal(formatCategoryLabel("PLASTIC LANYARD HOOK & CLIP ACCESSORIE"), "Plastic Lanyard Hook & Clip Accessories");
  assert.equal(formatCategoryLabel(null), "");
});

test("catalogue total prefers the API count and falls back to category sums", () => {
  assert.equal(catalogueTotal(243, [36, 34]), 243);
  assert.equal(catalogueTotal(0, [36, 34, 29]), 99);
  assert.equal(catalogueTotal(0, []), 0);
});
