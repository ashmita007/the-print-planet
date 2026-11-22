/**
 * Utility formatters for canonical display of Category and Product names.
 * Ensures consistent, enterprise-grade typography across the entire storefront:
 * - Categories: strictly UPPERCASE ("category in want in uppcases")
 * - Products: proper Title Case preserving technical acronyms, units, and Roman numerals.
 */

const ACRONYMS = new Set([
  "PVC",
  "ID",
  "RFID",
  "GSM",
  "A4",
  "A3",
  "CR80",
  "CR-80",
  "USB",
  "LED",
  "MOQ",
  "SKU",
  "GST",
  "PAN",
  "HD",
  "UV",
  "CNC",
  "PC",
  "PET",
  "ABS",
  "PP",
  "NFC",
  "UHF",
  "IC",
  "ISO",
  "V4",
  "1K",
  "4K",
  "MIFARE",
  "SMART",
  "TIN",
  "RGB",
  "CMYK",
  "EH-T",
  "HIPH",
  "M1",
  "M2",
]);

const LOWERCASE_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "but",
  "by",
  "for",
  "in",
  "nor",
  "of",
  "on",
  "or",
  "so",
  "the",
  "to",
  "up",
  "yet",
  "with",
  "x",
  "×",
]);

const UNIT_MAP: Record<string, string> = {
  mm: "mm",
  cm: "cm",
  m: "m",
  gsm: "GSM",
  mic: "Mic",
  micron: "Micron",
  inch: "Inch",
  inches: "Inches",
  kg: "kg",
  g: "g",
  mhz: "MHz",
  khz: "kHz",
  ghz: "GHz",
  v: "V",
  w: "W",
};

/**
 * Format category name strictly in UPPERCASE.
 */
// Spelling mistakes in category names stored in the database; the slugs stay as they are.
const CATEGORY_TYPOS: [RegExp, string][] = [
  [/\bCANSUMABLES\b/gi, "CONSUMABLES"],
  [/\bACCESSORIE\b/gi, "ACCESSORIES"],
  [/\bGAMING ROLL\b/gi, "GUMMING ROLL"],
];

export function fixCategorySpelling(name?: string | null): string {
  if (!name) return "";
  return CATEGORY_TYPOS.reduce((acc, [re, fix]) => acc.replace(re, fix), name.replace(/\s+/g, " ").trim());
}

export function formatCategoryName(name?: string | null): string {
  return fixCategorySpelling(name).toUpperCase();
}

const HEADING_ACRONYMS = new Set(["PVC", "ID", "RFID", "NFC", "UHF", "GST", "A3", "A4", "CR-80", "CR80", "USB", "LED", "UV"]);

/**
 * Sentence case for category headings (H1, "About ..."), matching the curated headings in
 * categorySeo.ts: "ID CARD PRINTERS AND CONSUMABLES" -> "ID card printers and consumables".
 * Labels and badges keep formatCategoryName's uppercase.
 */
export function formatCategoryHeading(name?: string | null): string {
  const words = fixCategorySpelling(name).split(" ").filter(Boolean);
  return words
    .map((word, index) => {
      const upper = word.toUpperCase();
      if (HEADING_ACRONYMS.has(upper)) return upper;
      const lower = word.toLowerCase();
      return index === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
    })
    .join(" ");
}

/**
 * Format product name into clean, professional Title Case while preserving
 * technical abbreviations, dimension multipliers, and unit casing.
 */
export function formatProductName(name?: string | null): string {
  if (!name) return "";

  // Replace underscores and clean multiple whitespaces
  let cleaned = name.replace(/[_\s]+/g, " ").trim();

  // Spelling mistakes that came in with the supplier catalogue.
  cleaned = cleaned
    .replace(/\bMirare\b/gi, "Mifare")
    .replace(/Pro[χx]υ/gi, "Prox")
    .replace(/\bOvel\b/gi, "Oval");

  // Fix spaced brackets like "( 300 +100 )" -> "(300 + 100)"
  cleaned = cleaned.replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");

  const words = cleaned.split(" ");
  const formattedWords = words.map((word, index) => {
    // Separate leading/trailing punctuation (brackets, quotes, commas)
    const match = word.match(/^([(\[\{"'<]*)(.*?)([)\]\}\"'>,.:;!?]*)$/);
    if (!match) return word;

    const [, prefix, core, suffix] = match;
    if (!core) return word;

    const upperCore = core.toUpperCase();
    const lowerCore = core.toLowerCase();

    // 1. Direct acronym match (e.g. PVC, ID, RFID, A4)
    if (ACRONYMS.has(upperCore)) {
      return `${prefix}${upperCore}${suffix}`;
    }

    // 2. Dimension multiplier 'x' or 'X' (e.g. "100m x 80 GSM")
    if (lowerCore === "x" || lowerCore === "×") {
      return `${prefix}x${suffix}`;
    }

    // 3. Number + Unit combinations (e.g. 20MM -> 20mm, 80GSM -> 80 GSM, 320MIC -> 320 Mic)
    const numUnitMatch = core.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
    if (numUnitMatch) {
      const numPart = numUnitMatch[1];
      const unitPart = numUnitMatch[2].toLowerCase();
      const formattedUnit = UNIT_MAP[unitPart] || (unitPart.length <= 3 ? unitPart.toUpperCase() : unitPart);
      return `${prefix}${numPart}${formattedUnit}${suffix}`;
    }

    // 4. Standalone unit match (e.g. "GSM", "Mic", "Inch")
    if (UNIT_MAP[lowerCore]) {
      return `${prefix}${UNIT_MAP[lowerCore]}${suffix}`;
    }

    // 5. Prepositions & conjunctions (keep lowercase unless first word)
    if (index > 0 && LOWERCASE_WORDS.has(lowerCore)) {
      return `${prefix}${lowerCore}${suffix}`;
    }

    // 6. Hyphenated words (e.g. EH-T or Semi-Transparent)
    if (core.includes("-")) {
      // Model codes such as WL-8000T or WL-HSA-3C stay fully uppercase.
      const isModelCode = core
        .split("-")
        .some((sub) => /\d/.test(sub) && /[a-z]/i.test(sub) && !/^\d+(mm|cm|m|gsm|mic|kg)$/i.test(sub));
      if (isModelCode) return `${prefix}${upperCore}${suffix}`;

      const subParts = core.split("-").map((sub) => {
        const subUpper = sub.toUpperCase();
        if (ACRONYMS.has(subUpper)) return subUpper;
        return sub.charAt(0).toUpperCase() + sub.slice(1).toLowerCase();
      });
      return `${prefix}${subParts.join("-")}${suffix}`;
    }

    // 7. General Word -> Capitalize first letter, lowercase the rest
    const capitalized = core.charAt(0).toUpperCase() + core.slice(1).toLowerCase();
    return `${prefix}${capitalized}${suffix}`;
  });

  return formattedWords.join(" ");
}

/**
 * Robust image URL resolver for products.
 * Guarantees a valid, displayable image URL across all catalog formats,
 * falling back safely to the official branded placeholder asset.
 */
interface ImageObject {
  secure_url?: string | null;
  url?: string | null;
  image?: string | null;
}

type ImageLike = string | ImageObject | null | undefined;

interface ProductImageSource {
  primary_image?: ImageLike;
  images?: ImageLike[] | null;
  image?: string | null;
}

const cleanUrl = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

// Order matters: secure_url, then url, then image, as callers expect the first usable one.
const imageUrlOf = (img: ImageLike, withImageKey: boolean): string => {
  if (typeof img === "string") return cleanUrl(img);
  if (!img) return "";
  return cleanUrl(img.secure_url) || cleanUrl(img.url) || (withImageKey ? cleanUrl(img.image) : "");
};

export function getProductImageUrl(product?: ProductImageSource | ImageObject | null): string {
  if (!product) return "/placeholder-product.svg";
  const source = product as ProductImageSource;

  // 1-2. primary_image object (secure_url or url) or string
  const primary = imageUrlOf(source.primary_image, false);
  if (primary) return primary;

  // 3. images array
  if (Array.isArray(source.images)) {
    for (const img of source.images) {
      const url = imageUrlOf(img, true);
      if (url) return url;
    }
  }

  // 4. product.image property
  const direct = cleanUrl(source.image);
  if (direct) return direct;

  return "/placeholder-product.svg";
}


// Widths the server stores for images on its own disk (SIZES in backend/apps/catalog/local_images.py).
const LOCAL_IMAGE_WIDTHS = [160, 480, 900];

/**
 * Serve a right-sized copy of a product image.
 * Images on our own disk (/media/products/<name>.webp) have WebP copies at LOCAL_IMAGE_WIDTHS
 * named <name>.w<width>.webp; Cloudinary images get an on-the-fly WebP/AVIF transform.
 * Other URLs pass through.
 */
export function sizedImage(url: string, width: number): string {
  if (!url) return url;
  const local = url.match(/^(.*\/media\/products\/.+?)\.webp$/);
  if (local) {
    if (!LOCAL_IMAGE_WIDTHS.includes(width) || /\.w\d+$/.test(local[1])) return url;
    return `${local[1]}.w${width}.webp`;
  }
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) return url;
  if (/\/image\/upload\/[^/]*\b(w_|f_auto)/.test(url)) return url; // already transformed
  return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
