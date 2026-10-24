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
  ghz: "GHz",
  v: "V",
  w: "W",
};

/**
 * Format category name strictly in UPPERCASE.
 */
export function formatCategoryName(name?: string | null): string {
  if (!name) return "";
  return name.replace(/\s+/g, " ").trim().toUpperCase();
}

/**
 * Format product name into clean, professional Title Case while preserving
 * technical abbreviations, dimension multipliers, and unit casing.
 */
export function formatProductName(name?: string | null): string {
  if (!name) return "";

  // Replace underscores and clean multiple whitespaces
  let cleaned = name.replace(/[_\s]+/g, " ").trim();

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
