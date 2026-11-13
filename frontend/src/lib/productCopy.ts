import type { Product } from "@/lib/types";
import { formatProductName } from "@/lib/formatters";

/**
 * The catalogue import filled ~130 products with one sentence that only swaps the name
 * ("Commercial grade X supplied by The Print Planet for corporate, school, event, and
 * industrial applications."). Search engines read that as duplicate text, so pages whose
 * stored copy matches it get a description built from the product's own data instead.
 */
const BOILERPLATE = /supplied by The Print Planet for corporate, school, event,? and industrial applications/i;

export function isBoilerplate(text?: string | null) {
  return !text || BOILERPLATE.test(text);
}

type Family = {
  test: RegExp;
  use: string;
  buyer: string;
};

// Ordered: the first match wins, so specific families come before broad ones.
const FAMILIES: Family[] = [
  {
    test: /silicon|\bspares?\b|\bpad\b|\bparts?\b|\bblades?\b|heater|heating element/i,
    use: "a replacement part for card and lanyard machines, used to keep production running without waiting on the original maker",
    buyer: "workshops already running fusing, cutting or heat press machines",
  },
  {
    test: /\bss plates?\b|steel plates?|lamination plates?/i,
    use: "used in a card fusing laminator to press PVC sheets and give the finished card its surface finish",
    buyer: "card bureaus running fusing laminators",
  },
  {
    test: /lanyard.*cutt|ribbon.*cutt/i,
    use: "used to cut lanyard ribbon to length cleanly and quickly in bulk production",
    buyer: "lanyard makers and printing units",
  },
  {
    test: /clamp fitting|crimp.*machine|fitting machine/i,
    use: "used to fix metal clamps and hooks onto lanyard ribbon in bulk",
    buyer: "lanyard makers assembling finished lanyards",
  },
  {
    test: /gumming|adhesive roll/i,
    use: "an adhesive roll used to make self-adhesive sticker cards that are pasted into sticker ID card holders",
    buyer: "ID card shops making sticker-type ID cards",
  },
  {
    test: /ink\b|inks\b/i,
    use: "used to print designs onto sublimation paper before heat transfer to polyester lanyard ribbon",
    buyer: "lanyard printing units and sublimation print shops",
  },
  {
    test: /sublimation paper|transfer paper|paper roll/i,
    use: "used as the carrier in sublimation heat transfer, taking the printed design from the printer to the lanyard ribbon in the heat press",
    buyer: "lanyard printing units running roll-to-roll heat presses",
  },
  {
    test: /lanyard roll|satin|ribbon|digital roll|lanyard white|polyester/i,
    use: "used to make printed ID card lanyards by sublimation or screen printing, then cut to length and fitted with a hook",
    buyer: "lanyard makers, ID card shops and corporate gifting printers",
  },
  {
    test: /hook|clip|clamp|buckle|crimp|fitting|attachment/i,
    use: "used to finish lanyards, joining the ribbon to the ID card holder or badge",
    buyer: "lanyard makers who assemble finished lanyards in bulk",
  },
  {
    test: /reel|yoyo|yo-yo/i,
    use: "used to hold an ID card on a retractable cord so it can be pulled out for scanning",
    buyer: "offices, hospitals and factories issuing access cards",
  },
  {
    test: /holder|pouch|case|cover|sleeve/i,
    use: "used to protect a CR-80 ID card (85.6 × 54 mm) and attach it to a lanyard or clip",
    buyer: "schools, offices, hospitals and ID card printers ordering for institutions",
  },
  {
    test: /rfid|mifare|proximity|em4100|nfc|smart card|prelam|inlay|chip/i,
    use: "used for contactless access control, attendance and cashless systems",
    buyer: "security integrators, offices, colleges and factories",
  },
  {
    test: /fusing machine|laminator|laminating machine/i,
    use: "used to fuse printed PVC core sheets and overlay film into solid cards under heat and pressure",
    buyer: "ID card print shops and card bureaus making PVC cards in-house",
  },
  {
    test: /cutt|punch|die\b|slot/i,
    use: "used to cut or punch finished ID cards to size, including CR-80 cards with rounded corners",
    buyer: "ID card print shops and card bureaus",
  },
  {
    test: /heat press|lanyard (machine|press)|roll.?to.?roll/i,
    use: "used to transfer sublimation prints onto lanyard ribbon with heat and pressure",
    buyer: "lanyard printing units",
  },
  {
    test: /hot stamp|foil/i,
    use: "used to apply metallic foil or hologram stamping to cards",
    buyer: "card manufacturers finishing premium and security cards",
  },
  {
    test: /weld|ultrasonic/i,
    use: "used to join plastic or fabric parts without glue in card and lanyard accessory production",
    buyer: "card and lanyard accessory manufacturers",
  },
  {
    test: /printer|plotter/i,
    use: "used to print ID cards or lanyard designs",
    buyer: "ID card print shops and lanyard printing units",
  },
  {
    test: /machine|press|stamping|mould|mold/i,
    use: "used in ID card or lanyard production",
    buyer: "ID card print shops, lanyard units and in-house card bureaus",
  },
  {
    test: /plate|steel/i,
    use: "used in a card fusing laminator to press PVC sheets and give the finished card its surface finish",
    buyer: "card bureaus running fusing laminators",
  },
  {
    test: /sheet|overlay|core|film|pvc|gsm|mic\b|micron|card/i,
    use: "used to make printed PVC ID cards, fused in a laminator and then punched to CR-80 size",
    buyer: "ID card print shops and card manufacturers",
  },
];

// Bare material codes (filed under unrelated categories in the catalogue) get neutral copy,
// because the category name would describe them wrongly.
const MATERIAL_CODE = /^(pc|hiph|hips|pp ?r?|gpps|abs|yarn \d+)$/i;

/** Pages for bare material codes ("PC", "Gpps") have nothing to rank on, so they stay out of the index. */
export function isMaterialCode(name?: string | null) {
  return !!name && MATERIAL_CODE.test(name.trim());
}

function familyFor(product: Product): Family | undefined {
  if (isMaterialCode(product.name)) return undefined;
  // The product's own name is the stronger signal; the category name only breaks ties.
  return (
    FAMILIES.find((f) => f.test.test(product.name)) ||
    FAMILIES.find((f) => f.test.test(product.category?.name || ""))
  );
}

function inr(n: number) {
  return `₹${n.toLocaleString("en-IN", Number.isInteger(n) ? {} : { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function priceLine(product: Product) {
  const price = Number(product.price);
  if (product.price_display) return `Wholesale price: ${product.price_display}.`;
  if (price > 0) return `Wholesale price: ${inr(price)} per unit, before GST.`;
  return "Price on request: send your quantity and we reply with a wholesale quote.";
}

/** Short, specific summary for the top of the page and for structured data. */
export function productSummary(product: Product) {
  const stored = product.short_description || product.description;
  if (!isBoilerplate(stored)) return stored as string;
  const name = formatProductName(product.name);
  const family = familyFor(product);
  return family
    ? `${name}, ${family.use}. Sold wholesale from Bengaluru.`
    : `${name}, sold wholesale from The Print Planet in Bengaluru.`;
}

/** Longer description for the "Product details" section. */
export function productDetails(product: Product) {
  const stored = product.description || product.short_description;
  if (!isBoilerplate(stored)) return stored as string;

  const name = formatProductName(product.name);
  const family = familyFor(product);
  const moq = product.minimum_order_quantity || 1;
  const facts = [
    product.material ? `Material: ${product.material}.` : "",
    product.dimensions ? `Size: ${product.dimensions}.` : "",
    product.color ? `Finish: ${product.color}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return [
    family
      ? `${name} is ${family.use}. It is ordered mostly by ${family.buyer}.`
      : `${name} is part of our ID card and lanyard supplies range.`,
    facts,
    `${priceLine(product)} Minimum order: ${moq} ${moq === 1 ? "unit" : "units"}. Every order comes with a GST invoice and ships from Sunkadakatte, Bengaluru to anywhere in India.`,
    "Send a photo or sample of what you use now on WhatsApp (+91 97418 08034) and we will confirm the match before you order.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Meta description: specific to the product, under ~155 characters after snippet(). */
export function productMetaDescription(product: Product) {
  const name = formatProductName(product.name);
  const price = Number(product.price) > 0 ? ` ${inr(Number(product.price))}.` : "";
  const moq = product.minimum_order_quantity ? ` MOQ ${product.minimum_order_quantity}.` : "";
  const family = familyFor(product);
  const lead = family ? `${name}, ${family.use.replace(/^used /, "").split(",")[0]}.` : `${name} wholesale.`;
  return `${lead}${price}${moq} GST invoice, pan-India dispatch from Bengaluru.`;
}
