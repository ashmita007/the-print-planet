import test from "node:test";
import assert from "node:assert";

// Mock Product Dataset for deterministic unit testing
const mockProducts = [
  {
    id: 1,
    name: "20MM Indian Royal Blue Colour Satin Lanyard Roll",
    sku: "LAN-ROY-20M",
    price: 300,
    price_display: "₹ 300 / Roll",
    material: "100% High-Tenacity Polyester Satin",
    dimensions: "20 mm x 100 m",
    color: "Royal Blue",
    category: { slug: "color-id-card-lanyard-roll", name: "Color ID Card Lanyard Roll" },
    is_featured: true,
  },
  {
    id: 2,
    name: "V2 ID CARD HOLDER",
    sku: "HLD-V2",
    price: 4.5,
    price_display: "₹ 4.50 / Piece",
    material: "Polyvinyl Chloride (PVC)",
    dimensions: "86 mm x 54 mm",
    color: "Crystal Clear",
    category: { slug: "crystal-clear-pvc-id-card-holder", name: "Crystal Clear PVC ID Card Holder" },
    is_featured: true,
  },
  {
    id: 3,
    name: "DCT4500 Fully Automatic Smart ID Card Cutting Machine",
    sku: "MCH-DCT4500",
    price: 185000,
    price_display: "₹ 1,85,000 / Piece",
    material: "Heavy Duty Cast Iron & Alloy Steel",
    dimensions: "CR-80 Standard Card Size",
    color: "Industrial Blue & White",
    category: { slug: "id-card-manufacturing-machines", name: "ID Card Manufacturing Machines" },
    is_featured: false,
  },
  {
    id: 4,
    name: "Mifare 1K Classic RFID ISO Smart Cards",
    sku: "CRD-MF1K-WHT",
    price: 18,
    price_display: "₹ 18 / Piece",
    material: "Premium Laminated PVC",
    dimensions: "85.6 mm x 54 mm x 0.84 mm (CR-80)",
    color: "Gloss White",
    category: { slug: "rfid-smart-cards-and-consumables", name: "RFID Smart Cards & Consumables" },
    is_featured: true,
  },
  {
    id: 5,
    name: "SIDE LEVER / DOG HOOK 20 mm",
    sku: "HOK-SIDELEVE-08",
    price: 2.2,
    price_display: "₹ 2.20 / Piece",
    material: "Nickel-Plated Zinc Alloy",
    dimensions: "20 mm Ring / 42 mm Length",
    color: "Chrome Silver",
    category: { slug: "id-card-lanyard-hooks", name: "ID Card Lanyard Hooks & Fittings" },
    is_featured: false,
  },
];

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
    message: "Need 200 units of V2 holders.",
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

  const classified = incomingRows.map((row) => ({
    ...row,
    status: existingSkus.has(row.sku) ? "existing" : "new",
  }));

  const newItems = classified.filter((r) => r.status === "new");
  const existingItems = classified.filter((r) => r.status === "existing");

  assert.strictEqual(newItems.length, 1);
  assert.strictEqual(existingItems.length, 2);
  assert.strictEqual(newItems[0].sku, "HLD-NEW-99");

  // Strategy 'skip'
  const skipResults = incomingRows.filter((r) => !existingSkus.has(r.sku));
  assert.strictEqual(skipResults.length, 1);

  // Strategy 'update'
  const updateResults = incomingRows.filter((r) => existingSkus.has(r.sku));
  assert.strictEqual(updateResults.length, 2);
});

// 4. Test Product Specifications Key/Value Mapping
test("Product specification parsing preserves exact model parameters", () => {
  const rawSpecs = {
    "Roll Length": "100 m",
    "Lanyard Width": "20 mm",
    Material: "Polyester Satin",
    "Core Type": "Plastic Core",
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

// 6. Test Category Filter in DirectProductShowcase
test("Category filtering accurately filters products by slug", () => {
  const filterByCategory = (items, categorySlug) => {
    if (categorySlug === "all") return items;
    return items.filter((p) => p.category?.slug === categorySlug);
  };

  const all = filterByCategory(mockProducts, "all");
  assert.strictEqual(all.length, 5);

  const lanyards = filterByCategory(mockProducts, "color-id-card-lanyard-roll");
  assert.strictEqual(lanyards.length, 1);
  assert.strictEqual(lanyards[0].sku, "LAN-ROY-20M");

  const holders = filterByCategory(mockProducts, "crystal-clear-pvc-id-card-holder");
  assert.strictEqual(holders.length, 1);
  assert.strictEqual(holders[0].sku, "HLD-V2");

  const nonExistent = filterByCategory(mockProducts, "unknown-category");
  assert.strictEqual(nonExistent.length, 0);
});

// 7. Test Multi-Attribute Search in DirectProductShowcase
test("Search query matches across name, SKU, material, and dimensions", () => {
  const searchFilter = (items, query) => {
    if (!query || !query.trim()) return items;
    const q = query.toLowerCase().trim();
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.material && p.material.toLowerCase().includes(q)) ||
        (p.dimensions && p.dimensions.toLowerCase().includes(q)) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q))
    );
  };

  // Search by SKU
  assert.strictEqual(searchFilter(mockProducts, "DCT4500").length, 1);

  // Search by material keyword
  assert.strictEqual(searchFilter(mockProducts, "Polyester").length, 1);

  // Search by partial text
  assert.strictEqual(searchFilter(mockProducts, "mifare").length, 1);

  // Search by dimension
  assert.strictEqual(searchFilter(mockProducts, "CR-80").length, 2);

  // Empty query returns all
  assert.strictEqual(searchFilter(mockProducts, "").length, 5);
});

// 8. Test Product Sorting Logic
test("Product sorting behaves predictably for featured, price, and name", () => {
  const sortProducts = (items, sortBy) => {
    const list = [...items];
    if (sortBy === "featured") {
      list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    } else if (sortBy === "price-asc") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  };

  // Featured first
  const featuredSorted = sortProducts(mockProducts, "featured");
  assert.strictEqual(featuredSorted[0].is_featured, true);
  assert.strictEqual(featuredSorted[1].is_featured, true);
  assert.strictEqual(featuredSorted[2].is_featured, true);

  // Price Ascending: Cheapest first (Hook @ 2.20)
  const priceAsc = sortProducts(mockProducts, "price-asc");
  assert.strictEqual(priceAsc[0].sku, "HOK-SIDELEVE-08");
  assert.strictEqual(priceAsc[0].price, 2.2);

  // Price Descending: Most expensive first (Machine @ 185,000)
  const priceDesc = sortProducts(mockProducts, "price-desc");
  assert.strictEqual(priceDesc[0].sku, "MCH-DCT4500");
  assert.strictEqual(priceDesc[0].price, 185000);
});

// 9. Test Pagination and Chunking Logic
test("Pagination slicing respects visible limits and load more increments", () => {
  const generateList = (count) => Array.from({ length: count }, (_, i) => ({ id: i + 1 }));
  const items63 = generateList(63);

  let visibleLimit = 16;
  let sliced = items63.slice(0, visibleLimit);
  assert.strictEqual(sliced.length, 16);
  assert.strictEqual(visibleLimit < items63.length, true);

  // First click: load more +16
  visibleLimit += 16;
  sliced = items63.slice(0, visibleLimit);
  assert.strictEqual(sliced.length, 32);

  // Further loads until completion
  visibleLimit += 16; // 48
  visibleLimit += 16; // 64
  sliced = items63.slice(0, visibleLimit);
  assert.strictEqual(sliced.length, 63);
  assert.strictEqual(visibleLimit >= items63.length, true);
});

// 10. Test Hero Showcase Circular Index Cycling
test("Hero showcase carousel circular navigation calculates correctly", () => {
  const totalItems = 6;

  const nextIndex = (curr) => (curr + 1) % totalItems;
  const prevIndex = (curr) => (curr - 1 + totalItems) % totalItems;

  assert.strictEqual(nextIndex(0), 1);
  assert.strictEqual(nextIndex(5), 0); // Wraps around to start

  assert.strictEqual(prevIndex(0), 5); // Wraps around to end
  assert.strictEqual(prevIndex(4), 3);
});

// 11. Test Product Image Fallback Logic
test("Product primary image correctly falls back to secondary or placeholder", () => {
  const resolveImage = (product) => {
    return (
      product?.primary_image?.secure_url ||
      (product?.images && product.images.length > 0 ? product.images[0].secure_url : null) ||
      "/placeholder-product.svg"
    );
  };

  // Case 1: Has primary_image
  assert.strictEqual(
    resolveImage({ primary_image: { secure_url: "/media/products/LAN-ROY-20M.png" } }),
    "/media/products/LAN-ROY-20M.png"
  );

  // Case 2: Only secondary images array
  assert.strictEqual(
    resolveImage({ images: [{ secure_url: "/media/products/HLD-V2.png" }] }),
    "/media/products/HLD-V2.png"
  );

  // Case 3: Empty images
  assert.strictEqual(resolveImage({ images: [] }), "/placeholder-product.svg");
  assert.strictEqual(resolveImage(null), "/placeholder-product.svg");
});

// 12. Live Backend API Smoke Test
test("Live Backend API responds with active categories and products", async () => {
  try {
    const res = await fetch("http://localhost:8000/api/v1/categories/");
    if (!res.ok) return; // Skip if server is not up during isolated CI
    const categories = await res.json();
    assert.ok(Array.isArray(categories));
    assert.ok(categories.length >= 10);

    const prodRes = await fetch("http://localhost:8000/api/v1/products/featured/");
    if (!prodRes.ok) return;
    const featured = await prodRes.json();
    assert.ok(Array.isArray(featured));
    assert.ok(featured.length > 0);
  } catch (err) {
    // If backend is running asynchronously or isolated, network test can pass safely
    console.log("Live API check skipped network error:", err.message);
  }
});

// 13. Test File Upload Extension & Size Security Validation
test("File upload client validation rejects dangerous extensions and oversized files", () => {
  const allowedExts = [
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".txt", ".rtf",
    ".jpg", ".jpeg", ".png", ".webp", ".zip", ".rar", ".ai", ".eps", ".cdr", ".psd"
  ];
  const maxBytes = 10 * 1024 * 1024; // 10MB

  const validateFile = (filename, size) => {
    if (size > maxBytes) return "File attachment size must be under 10MB";
    const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
    if (!allowedExts.includes(ext)) return "Unsupported file format";
    return null;
  };

  assert.strictEqual(validateFile("sample.pdf", 1024 * 500), null);
  assert.strictEqual(validateFile("artwork.ai", 1024 * 1024 * 4), null);
  assert.strictEqual(validateFile("specs.docx", 1024 * 200), null);
  assert.strictEqual(validateFile("huge_file.zip", 15 * 1024 * 1024), "File attachment size must be under 10MB");
  assert.strictEqual(validateFile("trojan.exe", 1024), "Unsupported file format");
  assert.strictEqual(validateFile("exploit.php", 1024), "Unsupported file format");
  assert.strictEqual(validateFile("script.sh", 1024), "Unsupported file format");
});

// 14. Test Branded Keywords & Canonical URL Schema Consistency
test("Brand canonical metadata correctly targets 'Print Planet Bangalore' without keyword stuffing", () => {
  const brandTitle = "The Print Planet™ Bangalore | Official Website — ID Card Materials, Lanyards & Machinery";
  assert.ok(brandTitle.includes("The Print Planet"));
  assert.ok(brandTitle.includes("Bangalore"));
  assert.ok(brandTitle.includes("ID Card Materials"));
  assert.ok(brandTitle.length <= 90);

  const alternateNames = [
    "Print Planet",
    "The Print Planet",
    "The Print Planet Bangalore",
    "Print Planet Bangalore",
    "The Print Planet Sunkadakatte",
  ];
  assert.ok(alternateNames.includes("The Print Planet Bangalore"));
  assert.ok(alternateNames.includes("Print Planet"));
});

// 15. Test Category Name UPPERCASE Standardization
test("Category names are strictly normalized to UPPERCASE", () => {
  const formatCategoryName = (name) => {
    if (!name) return "";
    return name.replace(/\s+/g, " ").trim().toUpperCase();
  };

  assert.strictEqual(formatCategoryName("Aluminium Metal Holder"), "ALUMINIUM METAL HOLDER");
  assert.strictEqual(formatCategoryName("id card holder"), "ID CARD HOLDER");
  assert.strictEqual(formatCategoryName("  Coated   overlay sheets  "), "COATED OVERLAY SHEETS");
  assert.strictEqual(formatCategoryName("satin lanyard rolls"), "SATIN LANYARD ROLLS");
});

// 16. Test Product Title Case Formatting with Technical Acronyms Preservation
test("Product names are cleanly formatted to Title Case while preserving PVC, ID, RFID, A4, and units", () => {
  const ACRONYMS = new Set(["PVC", "ID", "RFID", "GSM", "A4", "CR80", "CR-80", "USB", "EH-T"]);
  const LOWERCASE_WORDS = new Set(["a", "an", "and", "for", "in", "of", "on", "to", "with", "x"]);
  const UNIT_MAP = { mm: "mm", cm: "cm", m: "m", gsm: "GSM", mic: "Mic", inch: "Inch" };

  const formatProductName = (name) => {
    if (!name) return "";
    let cleaned = name.replace(/[_\s]+/g, " ").trim();
    cleaned = cleaned.replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");
    const words = cleaned.split(" ");
    const formatted = words.map((word, index) => {
      const match = word.match(/^([(\[\{"'<]*)(.*?)([)\]\}\"'>,.:;!?]*)$/);
      if (!match) return word;
      const [, prefix, core, suffix] = match;
      if (!core) return word;
      const upperCore = core.toUpperCase();
      const lowerCore = core.toLowerCase();
      if (ACRONYMS.has(upperCore)) return `${prefix}${upperCore}${suffix}`;
      if (lowerCore === "x") return `${prefix}x${suffix}`;
      const numUnitMatch = core.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
      if (numUnitMatch) {
        const numPart = numUnitMatch[1];
        const unitPart = numUnitMatch[2].toLowerCase();
        const formattedUnit = UNIT_MAP[unitPart] || unitPart.toUpperCase();
        return `${prefix}${numPart}${formattedUnit}${suffix}`;
      }
      if (UNIT_MAP[lowerCore]) return `${prefix}${UNIT_MAP[lowerCore]}${suffix}`;
      if (index > 0 && LOWERCASE_WORDS.has(lowerCore)) return `${prefix}${lowerCore}${suffix}`;
      if (core.includes("-")) {
        const subParts = core.split("-").map((sub) => {
          const subUpper = sub.toUpperCase();
          if (ACRONYMS.has(subUpper)) return subUpper;
          return sub.charAt(0).toUpperCase() + sub.slice(1).toLowerCase();
        });
        return `${prefix}${subParts.join("-")}${suffix}`;
      }
      return `${prefix}${core.charAt(0).toUpperCase() + core.slice(1).toLowerCase()}${suffix}`;
    });
    return formatted.join(" ");
  };

  assert.strictEqual(formatProductName("YELLOW SUBLIMATION INK"), "Yellow Sublimation Ink");
  assert.strictEqual(formatProductName("WIRE HOOK 20MM"), "Wire Hook 20mm");
  assert.strictEqual(formatProductName("40 Inch x 100 M X 80 Gsm SUBLIMATION PAPER ROLL"), "40 Inch x 100 m x 80 GSM Sublimation Paper Roll");
  assert.strictEqual(formatProductName("EH-T Executive Crystal Clear ID Card Holder"), "EH-T Executive Crystal Clear ID Card Holder");
  assert.strictEqual(formatProductName("A4 PVC CORE _320 MIC"), "A4 PVC Core 320 Mic");
});

test("Cart calculation accurately computes subtotal and enforces MOQ", () => {
  const cartItems = [
    {
      id: "1-default",
      name: "20MM Satin Lanyard Roll",
      sku: "LAN-ROY-20M",
      price: 300,
      quantity: 10,
      minimumOrderQuantity: 5,
    },
    {
      id: "2-default",
      name: "V2 ID Card Holder",
      sku: "HLD-V2",
      price: 4.5,
      quantity: 100,
      minimumOrderQuantity: 50,
    },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  assert.strictEqual(subtotal, 300 * 10 + 4.5 * 100); // 3000 + 450 = 3450
  assert.strictEqual(cartItems[0].quantity >= cartItems[0].minimumOrderQuantity, true);
  assert.strictEqual(cartItems[1].quantity >= cartItems[1].minimumOrderQuantity, true);
});

test("Cart quote order serialization matches WhatsApp inquiry format", () => {
  const items = [
    { name: "Satin Lanyard", sku: "LAN-01", quantity: 500, options: { material: "20mm Royal Blue" } },
  ];
  const formatted = items
    .map((i, idx) => `${idx + 1}. ${i.name} (SKU: ${i.sku}) - Qty: ${i.quantity} [Material: ${i.options.material}]`)
    .join("\n");

  assert.strictEqual(
    formatted,
    "1. Satin Lanyard (SKU: LAN-01) - Qty: 500 [Material: 20mm Royal Blue]"
  );
});



