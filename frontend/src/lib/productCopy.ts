import type { Product } from "@/lib/types";
import { formatProductName } from "@/lib/formatters";

/**
 * The catalogue import filled ~130 products with one sentence that only swaps the name
 * ("Commercial grade X supplied by The Print Planet for corporate, school, event, and
 * industrial applications."). Search engines read that as duplicate text, so pages whose
 * stored copy matches it get a description built from the product's own data instead.
 */
const BOILERPLATE = new RegExp(
  [
    "supplied by The Print Planet for corporate, school, event,? and industrial applications",
    // Second import template (55 products): generic claims, nothing specific to the item.
    "manufactured specifically for professional ID card systems",
    "Professional wholesale catalogue item",
    "High performance production grade equipment",
    // Product-sheet import (Nov 2026): names only, one shared closing line.
    "Share the quantity, size and print or branding details to get a quote",
  ].join("|"),
  "i"
);

export function isBoilerplate(text?: string | null) {
  return !text || BOILERPLATE.test(text);
}

type Copy = {
  use: string;
  buyer: string;
  /** One practical thing to confirm before ordering this kind of product. */
  check: string;
  /** Printing and finishing jobs: titled and answered as a service, not stock. */
  service?: { title: string };
};

type Family = Copy & { test: RegExp };

// Ranges added from the owner's product sheet. Their names overlap older families
// ("Business Cards" would read as PVC card sheets, "Foiling" as a stamping machine),
// so these categories pick their copy by category instead of by name.
const CATEGORY_FAMILIES: Record<string, Copy> = {
  "pvc-and-smart-cards": {
    use: "a PVC card supplied blank or printed for ID, access, membership, loyalty, gift or warranty use",
    buyer: "offices, schools, clubs, retailers and ID card printers",
    check: "Tell us the card type (plain, printed, RFID or NFC), the quantity and whether you need numbering, a QR code or a photo on each card.",
  },
  "lens-packaging-products": {
    use: "packaging that holds and protects spectacle lenses in the shop, the lab and in transit",
    buyer: "optical stores, lens labs and opticians",
    check: "Share the lens size you pack, the quantity, and your shop name or logo if you want them printed.",
  },
  "lens-cleaning-solutions": {
    use: "a lens care item for cleaning spectacles, sunglasses and other optical lenses",
    buyer: "optical stores, opticians and companies buying branded giveaways",
    check: "Tell us the quantity, the pack size you want and whether it should carry your brand.",
  },
  "id-card-printers-and-consumables": {
    use: "part of a desktop ID card printing setup, from the printer itself to ribbons, overlays, software and card encoding",
    buyer: "offices, schools, institutions and card printing shops",
    check: "Tell us how many cards you print, single or dual sided, and whether the cards carry RFID or a magnetic stripe, so the printer, ribbon and cards match.",
  },
  lanyards: {
    use: "a finished neck lanyard for carrying an ID card, badge or key",
    buyer: "offices, schools, conferences and event organisers",
    check: "Share the width, colour, attachment (hook, clip, buckle or badge reel), quantity and your logo artwork if it should be printed.",
  },
  "id-card-accessories": {
    use: "an accessory for wearing, attaching or protecting an ID card",
    buyer: "offices, schools and event organisers, and ID card printers who supply them",
    check: "Tell us the quantity and the card or lanyard it has to fit.",
  },
  "offset-printing": {
    use: "an offset printing job, suited to larger quantities where the cost per piece drops as the run grows",
    buyer: "businesses, schools, publishers and brands",
    check: "Send the size, paper, quantity, number of colours and your print-ready artwork (PDF) for a quote.",
    service: { title: "Offset Printing Bangalore" },
  },
  "digital-printing": {
    use: "a digital printing job, suited to short runs, quick turnaround and personalised prints",
    buyer: "businesses, event organisers and anyone who needs small quantities",
    check: "Send the size, paper, quantity and your print-ready artwork (PDF) for a quote.",
    service: { title: "Digital Printing Bangalore" },
  },
  "finishing-and-conversion": {
    use: "a print finishing step done after printing, before the job is packed and delivered",
    buyer: "businesses and print buyers who want a finished product, not just printed sheets",
    check: "Tell us what is being finished (cards, brochures, boxes, books), the quantity and the size.",
    service: { title: "Service in Bangalore" },
  },
};

// Ordered: the first match wins, so specific families come before broad ones.
const FAMILIES: Family[] = [
  {
    test: /silicon|\bspares?\b|\bpad\b|\bparts?\b|\bblades?\b|heater|heating element/i,
    use: "a replacement part for card and lanyard machines, used to keep production running without waiting on the original maker",
    buyer: "workshops already running fusing, cutting or heat press machines",
    check: "Share your machine model and a photo of the old part, and we confirm the fit before dispatch.",
  },
  {
    test: /\bss plates?\b|steel plates?|lamination plates?/i,
    use: "used in a card fusing laminator to press PVC sheets and give the finished card its surface finish",
    buyer: "card bureaus running fusing laminators",
    check: "Match the plate size to your laminator's platen, and pick the surface finish (mirror, matte or textured) you want on the card.",
  },
  {
    test: /lanyard.*cutt|ribbon.*cutt/i,
    use: "used to cut lanyard ribbon to length cleanly and quickly in bulk production",
    buyer: "lanyard makers and printing units",
    check: "Tell us the ribbon widths you cut most often so we can confirm the machine handles them.",
  },
  {
    test: /clamp fitting|crimp.*machine|fitting machine/i,
    use: "used to fix metal clamps and hooks onto lanyard ribbon in bulk",
    buyer: "lanyard makers assembling finished lanyards",
    check: "Tell us which clamps and hooks you fit, so the dies match your accessories.",
  },
  {
    test: /gumming|adhesive roll/i,
    use: "an adhesive roll used to make self-adhesive sticker cards that are pasted into sticker ID card holders",
    buyer: "ID card shops making sticker-type ID cards",
    check: "Tell us your sheet size and the holder you paste into.",
  },
  {
    test: /ink\b|inks\b/i,
    use: "used to print designs onto sublimation paper before heat transfer to polyester lanyard ribbon",
    buyer: "lanyard printing units and sublimation print shops",
    check: "Sublimation ink has to suit your printer and print head, so share the printer model when you enquire.",
  },
  {
    test: /sublimation paper|transfer paper|paper roll/i,
    use: "used as the carrier in sublimation heat transfer, taking the printed design from the printer to the lanyard ribbon in the heat press",
    buyer: "lanyard printing units running roll-to-roll heat presses",
    check: "Match the roll width and paper weight to your printer and heat press.",
  },
  {
    test: /lanyard roll|satin|ribbon|digital roll|lanyard white|polyester/i,
    use: "used to make printed ID card lanyards by sublimation or screen printing, then cut to length and fitted with a hook",
    buyer: "lanyard makers, ID card shops and corporate gifting printers",
    check: "Pick the ribbon width to match your hooks and print size, and tell us whether you print by sublimation or screen.",
  },
  {
    test: /hook|clip|clamp|buckle|crimp|fitting|attachment/i,
    use: "used to finish lanyards, joining the ribbon to the ID card holder or badge",
    buyer: "lanyard makers who assemble finished lanyards in bulk",
    check: "Match the hook or clip size to your lanyard ribbon width.",
  },
  {
    test: /reel|yoyo|yo-yo/i,
    use: "used to hold an ID card on a retractable cord so it can be pulled out for scanning",
    buyer: "offices, hospitals and factories issuing access cards",
    check: "Check the cord length and the clip type your card holders need.",
  },
  {
    test: /holder|pouch|case|cover|sleeve/i,
    use: "used to protect a CR-80 ID card (85.6 × 54 mm) and attach it to a lanyard or clip",
    buyer: "schools, offices, hospitals and ID card printers ordering for institutions",
    check: "Check the orientation (vertical or horizontal) and how the holder attaches: lanyard slot, clip or reel.",
  },
  {
    test: /rfid|mifare|proximity|em4100|nfc|smart card|prelam|inlay|chip/i,
    use: "used for contactless access control, attendance and cashless systems",
    buyer: "security integrators, offices, colleges and factories",
    check: "Confirm the frequency (125 kHz or 13.56 MHz) and chip type with your reader or access system before you order.",
  },
  {
    test: /fusing machine|laminator|laminating machine/i,
    use: "used to fuse printed PVC core sheets and overlay film into solid cards under heat and pressure",
    buyer: "ID card print shops and card bureaus making PVC cards in-house",
    check: "Check the sheet size and the number of daylights (sheets per cycle) against your daily card volume.",
  },
  {
    test: /cutt|punch|die\b|slot/i,
    use: "used to cut or punch finished ID cards to size, including CR-80 cards with rounded corners",
    buyer: "ID card print shops and card bureaus",
    check: "Confirm the card size and corner radius you need cut.",
  },
  {
    test: /heat press|lanyard (machine|press)|roll.?to.?roll/i,
    use: "used to transfer sublimation prints onto lanyard ribbon with heat and pressure",
    buyer: "lanyard printing units",
    check: "Check the roller width against the widest ribbon you print.",
  },
  {
    test: /hot stamp|foil/i,
    use: "used to apply metallic foil or hologram stamping to cards",
    buyer: "card manufacturers finishing premium and security cards",
    check: "Tell us the foil or hologram type and the card size you stamp.",
  },
  {
    test: /weld|ultrasonic/i,
    use: "used to join plastic or fabric parts without glue in card and lanyard accessory production",
    buyer: "card and lanyard accessory manufacturers",
    check: "Share the material and the parts you need to join.",
  },
  {
    test: /printer|plotter/i,
    use: "used to print ID cards or lanyard designs",
    buyer: "ID card print shops and lanyard printing units",
    check: "Tell us what you print on and your daily volume.",
  },
  {
    test: /machine|press|stamping|mould|mold/i,
    use: "used in ID card or lanyard production",
    buyer: "ID card print shops, lanyard units and in-house card bureaus",
    check: "Share your daily output target and your power supply (single or three phase).",
  },
  {
    test: /plate|steel/i,
    use: "used in a card fusing laminator to press PVC sheets and give the finished card its surface finish",
    buyer: "card bureaus running fusing laminators",
    check: "Match the plate size to your laminator's platen, and pick the surface finish you want on the card.",
  },
  {
    test: /sheet|overlay|core|film|pvc|gsm|mic\b|micron|card/i,
    use: "used to make printed PVC ID cards, fused in a laminator and then punched to CR-80 size",
    buyer: "ID card print shops and card manufacturers",
    check: "Match the sheet type (inkjet or digital) to your printer, and the thickness to the card you make.",
  },
];

// Bare material codes (filed under unrelated categories in the catalogue) get neutral copy,
// because the category name would describe them wrongly.
const MATERIAL_CODE = /^(pc|hiph|hips|pp ?r?|gpps|abs|yarn \d+)$/i;

/** Pages for bare material codes ("PC", "Gpps") have nothing to rank on, so they stay out of the index. */
export function isMaterialCode(name?: string | null) {
  return !!name && MATERIAL_CODE.test(name.trim());
}

function familyFor(product: Product): Copy | undefined {
  if (isMaterialCode(product.name)) return undefined;
  const byCategory = CATEGORY_FAMILIES[product.category?.slug || ""];
  if (byCategory) return byCategory;
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

/**
 * Specification values as buyers should read them. The import stored some sizes as Python dict text
 * ("{'h': '0.8', 'l': '8.6', 'w': '5.4'}") and quantities as "100.0 pcs"; both are tidied here.
 * Units are not in the data, so none are added.
 */
export function formatSpecValue(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  let text = typeof raw === "object" ? JSON.stringify(raw) : String(raw);
  const dims = text.trim().match(/^\{.*\}$/) ? text : "";
  if (dims) {
    const get = (k: string) => (dims.match(new RegExp(`['"]${k}['"]\\s*:\\s*['"]?(-?[\\d.]+)`)) || [])[1];
    const parts = (["l", "w", "h"] as const)
      .map((k) => [k, get(k)] as const)
      .filter(([, v]) => v !== undefined && Number(v) > 0)
      .map(([k, v]) => `${k.toUpperCase()} ${Number(v)}`);
    return parts.join(" × ");
  }
  text = text.replace(/(\d+)\.0\b/g, "$1").replace(/\b(PCS|Pcs)\b/g, "pcs").replace(/\bROLl?\b/g, "roll");
  return text.replace(/\s+/g, " ").trim();
}

/** Case-insensitive lookup in the product's specification table, tidied for reading. */
export function spec(product: Product, key: string): string {
  const specs = product.specifications || {};
  const hit = Object.entries(specs).find(([k]) => k.trim().toLowerCase() === key.toLowerCase());
  return hit ? formatSpecValue(hit[1]) : "";
}

/** HSN codes are 4, 6 or 8 digits; anything else in the data is a typo we should not publish. */
export function hsnCode(product: Product) {
  const code = spec(product, "HSN Code").replace(/\s/g, "");
  return /^(\d{4}|\d{6}|\d{8})$/.test(code) ? code : "";
}

/** "1 unit", "50 units". */
export function unitCount(n: number) {
  return `${n} ${n === 1 ? "unit" : "units"}`;
}

export function moqText(product: Product) {
  if (product.minimum_order_quantity) {
    return unitCount(product.minimum_order_quantity);
  }
  return spec(product, "Minimum Order Quantity");
}

// Specification keys worth putting into a sentence, in reading order. Tax and unit fields go elsewhere.
const SENTENCE_SPECS = [
  "Material", "Orientation", "Attachment Type", "Lanyard Width", "Roll Length", "Printing Type", "Core Type",
  "Hook Type", "Hook Size", "Hook Material", "Dimensions", "Color", "Finish", "Roll Packing", "Platen Size",
  "Daylights", "Power", "Speed", "Temperature Range", "Pressure",
];

function specSentence(product: Product) {
  const parts = SENTENCE_SPECS.map((k) => [k, spec(product, k)] as const)
    .filter(([, v]) => v && v.length < 80)
    .map(([k, v]) => `${k.toLowerCase()} ${v}`);
  const extra = [
    !spec(product, "Material") && product.material ? `material ${product.material}` : "",
    !spec(product, "Dimensions") && product.dimensions ? `size ${formatSpecValue(product.dimensions)}` : "",
    !spec(product, "Color") && product.color ? `finish ${product.color}` : "",
  ].filter(Boolean);
  const all = [...parts, ...extra];
  return all.length ? `Key details: ${all.join("; ")}.` : "";
}

/** Longer description for the "Product details" section, built only from the product's own data. */
export function productDetails(product: Product) {
  const stored = product.description || product.short_description;
  if (!isBoilerplate(stored)) return stored as string;

  const name = formatProductName(product.name);
  const family = familyFor(product);
  const moq = moqText(product);
  const usage = spec(product, "Usage");
  const hsn = hsnCode(product);
  const gst = spec(product, "GST Rate");

  return [
    family
      ? `${name} is ${family.use}. It is ordered mostly by ${family.buyer}.`
      : `${name} is part of our ID card and lanyard supplies range.`,
    [specSentence(product), usage ? `Typical use: ${usage.toLowerCase()}.` : ""].filter(Boolean).join(" "),
    family ? `Before you order: ${family.check}` : "",
    [
      priceLine(product),
      moq ? `Minimum order: ${moq}.` : "",
      hsn ? `HSN code ${hsn}${gst ? `, GST ${gst}` : ""}.` : gst ? `GST ${gst}.` : "",
      "Every order comes with a GST invoice and ships from Sunkadakatte, Bengaluru to anywhere in India.",
    ]
      .filter(Boolean)
      .join(" "),
    "Send a photo or sample of what you use now on WhatsApp (+91 97418 08034) and we will confirm the match before you order.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export type Faq = { q: string; a: string };

/** Buyer questions answered from this product's own data; nothing here is assumed. */
export function productFaqs(product: Product): Faq[] {
  const name = formatProductName(product.name);
  const family = familyFor(product);
  const moq = moqText(product);
  const hsn = hsnCode(product);
  const gst = spec(product, "GST Rate");
  const price = Number(product.price);
  const faqs: Faq[] = [];

  if (family) faqs.push({ q: `What can I use ${name} for?`, a: `It is ${family.use}. Most orders come from ${family.buyer}.` });
  faqs.push({
    q: `What is the wholesale price of ${name}?`,
    a: product.price_visibility && (product.price_display || price > 0)
      ? `${priceLine(product)} Bulk quantities get a better rate: send your quantity for a quote.`
      : "The price depends on quantity. Send your quantity on WhatsApp or through the enquiry form and we reply with a wholesale quote.",
  });
  if (moq) faqs.push({ q: `What is the minimum order quantity for ${name}?`, a: `The minimum order is ${moq}.` });
  if (hsn || gst) {
    faqs.push({
      q: `What is the HSN code and GST rate for ${name}?`,
      a: [hsn ? `HSN code ${hsn}.` : "", gst ? `GST rate ${gst}.` : "", "Every order is billed on a GST invoice."].filter(Boolean).join(" "),
    });
  }
  if (family) faqs.push({ q: `What should I check before ordering ${name}?`, a: family.check });
  faqs.push(
    family?.service
      ? {
          q: `Do you take ${name} orders from outside Bengaluru?`,
          a: "Yes. Send your artwork on WhatsApp or by email, and the finished job ships from Sunkadakatte, Bengaluru to anywhere in India, with a GST invoice.",
        }
      : {
          q: `Do you deliver ${name} outside Bengaluru?`,
          a: "Yes. Orders ship from Sunkadakatte, Bengaluru to anywhere in India, with a GST invoice.",
        }
  );
  return faqs;
}

/** Page title before branding: services read as a printing service, stock items as a wholesale price. */
export function productTitleBase(product: Product) {
  const name = formatProductName(product.name);
  const service = familyFor(product)?.service;
  const options = service
    ? [`${name} ${service.title}`, `${name} Printing Bangalore`]
    : [`${name} Wholesale Price`, `${name} Price`];
  // Google shows about 60 characters: keep the longest wording that still fits.
  return options.find((t) => t.length <= 60) || name;
}

/** Stored SEO title with the catalogue's raw uppercase name swapped for the Title Case one the page heading uses. */
export function productSeoTitle(product: Product) {
  const stored = (product.seo_title || "").trim();
  if (!stored) return productTitleBase(product);
  const raw = product.name.trim();
  if (!raw) return stored;
  const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return stored.replace(new RegExp(escaped, "i"), formatProductName(raw));
}

/** Meta description: specific to the product, under ~155 characters after snippet(). */
export function productMetaDescription(product: Product) {
  const name = formatProductName(product.name);
  const price = Number(product.price) > 0 ? ` ${inr(Number(product.price))}.` : "";
  const moqValue = moqText(product);
  const moq = moqValue ? ` MOQ ${moqValue}.` : "";
  const family = familyFor(product);
  const lead = family ? `${name}, ${family.use.replace(/^used /, "").split(",")[0]}.` : `${name} wholesale.`;
  const endings = [
    " GST invoice, pan-India dispatch from Bengaluru.",
    " Wholesale from Bengaluru, ships across India.",
    " Bulk quotes on WhatsApp, GST invoice.",
    " Ships India-wide from Bengaluru with GST bill.",
  ];
  // Stable per product, so the description does not change between builds.
  const ending = endings[[...product.slug].reduce((n, c) => n + c.charCodeAt(0), 0) % endings.length];
  return `${lead}${price}${moq}${ending}`;
}
