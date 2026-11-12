import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";
const PAGE_SIZE = 500; // backend max_page_size

async function getAllActiveProducts(): Promise<Product[]> {
  const all: Product[] = [];
  for (let page = 1; page <= 20; page++) {
    const res = await getProducts({ page, page_size: PAGE_SIZE, ordering: "display_order" });
    all.push(...res.results);
    if (!res.next || res.results.length === 0) break;
  }
  return all.filter((p) => p.is_active !== false);
}

/** Table cells must not contain pipes or line breaks. */
function cell(value: unknown): string {
  return String(value ?? "").replace(/\|/g, "/").replace(/\s+/g, " ").trim();
}

function priceText(p: Product): string {
  if (p.price_visibility === false) return "On request";
  if (p.price_display && p.price_display.trim()) return cell(p.price_display);
  const n = p.price == null || p.price === "" ? NaN : Number(p.price);
  return Number.isFinite(n) ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "On request";
}

const HEADER = `# Wholesale Price List: The Print Planet

> **Published by:** The Print Planet (theprintplanet.co.in)
> **Factory:** No. 33, 34, Srigandhadakaval, Byraveshwaranagar, Near Hanumanthnagar, Sunkadakatte, Bangalore 560091, Karnataka, India
> **GSTIN:** 29AAQFT3909B1ZZ
> **Sales desk:** +91 97418 08034 | theprintplanet01@gmail.com
> **Currency:** INR, exclusive of GST unless stated
> **Source:** generated from the live product catalogue, so prices match the product pages`;

const TERMS = `## Ordering and Commercial Terms

1. **Request a proforma invoice (PI):**
   - Quote form: [${SITE_URL}/quote](${SITE_URL}/quote)
   - Corporate orders: [${SITE_URL}/corporate](${SITE_URL}/corporate)
   - WhatsApp: **+91 97418 08034**
   - Email: **theprintplanet01@gmail.com**
2. **Bulk pricing:** prices below are list prices. Volume rates for large quantities are quoted on request.
3. **Payment modes:** Bank NEFT / RTGS, IMPS, UPI and corporate net banking.
4. **GST invoicing:** every consignment ships with an HSN-coded GST tax invoice under GSTIN \`29AAQFT3909B1ZZ\`.
5. **Dispatch:** from Sunkadakatte, Bengaluru (560091). Tracking details are shared on carrier handover.`;

export async function buildPricingMarkdown(): Promise<string> {
  let products: Product[] = [];
  try {
    products = await getAllActiveProducts();
  } catch {
    products = [];
  }

  if (products.length === 0) {
    // Never publish stale or invented numbers when the catalogue is unreachable.
    return `${HEADER}\n\n---\n\nLive prices are temporarily unavailable. See ${SITE_URL}/products or WhatsApp +91 97418 08034 for current rates.\n\n---\n\n${TERMS}\n`;
  }

  const groups = new Map<string, { name: string; slug: string; order: number; items: Product[] }>();
  for (const p of products) {
    const slug = p.category?.slug || "other";
    if (!groups.has(slug)) {
      groups.set(slug, {
        name: p.category?.name || "Other Products",
        slug,
        order: p.category?.display_order ?? 999,
        items: [],
      });
    }
    groups.get(slug)!.items.push(p);
  }
  const sorted = [...groups.values()].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  const updated = new Date().toISOString().slice(0, 10);
  const sections = sorted.map((g, i) => {
    const rows = [...g.items]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(
        (p) =>
          `| [${cell(p.name)}](${SITE_URL}/products/${p.slug}) | ${cell(p.sku)} | ${priceText(p)} | ${cell(p.minimum_order_quantity ?? "")} |`,
      );
    return [
      `## ${i + 1}. ${cell(g.name)}`,
      "",
      `Category page: ${SITE_URL}/categories/${g.slug}`,
      "",
      "| Product | SKU | Price | MOQ |",
      "| :--- | :--- | :--- | :--- |",
      ...rows,
    ].join("\n");
  });

  return [
    HEADER,
    `> **Last updated:** ${updated} (${products.length} products)`,
    "",
    "---",
    "",
    sections.join("\n\n---\n\n"),
    "",
    "---",
    "",
    TERMS,
    "",
  ].join("\n");
}
