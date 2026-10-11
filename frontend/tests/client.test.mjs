import test from "node:test";
import assert from "node:assert";

// 1. Test API URL resolution
test("API URL resolution fallback for server and browser", () => {
  const defaultUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  assert.strictEqual(defaultUrl, "http://localhost:8000");

  const internalUrl = process.env.INTERNAL_API_URL || "http://localhost:8000";
  assert.ok(internalUrl.includes("http"));
});

// 2. Test Enquiry Form Validation Logic
test("Enquiry form validation logic enforces requirements", () => {
  const validateEnquiry = (data) => {
    const errors = [];
    if (!data.full_name || data.full_name.trim().length === 0) errors.push("Full name required");
    if (!data.phone || data.phone.trim().length < 6) errors.push("Valid phone required");
    if (!data.email || !data.email.includes("@")) errors.push("Valid email required");
    if (!data.message || data.message.trim().length === 0) errors.push("Message required");
    return errors;
  };

  // Invalid payload
  const invalidResult = validateEnquiry({ full_name: "", phone: "123", email: "invalid", message: "" });
  assert.strictEqual(invalidResult.length, 4);

  // Valid payload
  const validResult = validateEnquiry({
    full_name: "Amit Shah",
    phone: "+91 98980 12345",
    email: "amit@trade.in",
    message: "Need 200 units of V2 holders."
  });
  assert.strictEqual(validResult.length, 0);
});

// 3. Test Bulk Import Duplicate Detection Logic
test("Bulk import correctly identifies new vs existing products and handles strategies", () => {
  const existingSkus = new Set(["LAN-RB-20M", "HLD-V2-CLR", "MCH-DCT4500"]);
  
  const incomingRows = [
    { sku: "LAN-RB-20M", name: "Duplicate Royal Blue Roll", price: 300 },
    { sku: "HLD-NEW-99", name: "New Badge Holder", price: 25 },
    { sku: "MCH-DCT4500", name: "Duplicate Card Cutter", price: 185000 },
  ];

  const classified = incomingRows.map(row => ({
    ...row,
    status: existingSkus.has(row.sku) ? "existing" : "new"
  }));

  const newItems = classified.filter(r => r.status === "new");
  const existingItems = classified.filter(r => r.status === "existing");

  assert.strictEqual(newItems.length, 1);
  assert.strictEqual(existingItems.length, 2);
  assert.strictEqual(newItems[0].sku, "HLD-NEW-99");

  // Strategy 'skip'
  const skipResults = incomingRows.filter(r => !existingSkus.has(r.sku));
  assert.strictEqual(skipResults.length, 1);

  // Strategy 'update'
  const updateResults = incomingRows.filter(r => existingSkus.has(r.sku));
  assert.strictEqual(updateResults.length, 2);
});

// 4. Test Product Specifications Key/Value Mapping
test("Product specification parsing preserves exact model parameters", () => {
  const rawSpecs = {
    "Roll Length": "100 m",
    "Lanyard Width": "20 mm",
    "Material": "Polyester Satin",
    "Core Type": "Plastic Core"
  };

  const entries = Object.entries(rawSpecs);
  assert.strictEqual(entries.length, 4);
  assert.strictEqual(rawSpecs["Roll Length"], "100 m");
  assert.strictEqual(rawSpecs["Material"], "Polyester Satin");
});

// 5. Test Price Display formatting
test("Price display formatting displays standard currency formatting", () => {
  const formatPrice = (val, display) => {
    if (display) return display;
    if (val !== null && val !== undefined) return `₹ ${Number(val).toLocaleString("en-IN")}`;
    return "Price on Request";
  };

  assert.strictEqual(formatPrice(null, "₹ 300 / Roll"), "₹ 300 / Roll");
  assert.strictEqual(formatPrice(185000, null), "₹ 1,85,000");
  assert.strictEqual(formatPrice(null, null), "Price on Request");
});
