const BRAND = "The Print Planet";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

/** Page-level openGraph replaces the root one, so every page must list its image again. */
export const DEFAULT_OG_IMAGES = [
  { url: `${SITE_URL}/logo.png`, width: 1200, height: 600, alt: "The Print Planet Bangalore" },
];

/** Drops any brand suffix stored in the database, then adds exactly one. */
export function brandedTitle(raw: string) {
  const core = raw.split(/\s+\|\s+/)[0].replace(/\s+/g, " ").trim();
  const full = `${core} | ${BRAND}`;
  // Google cuts titles at about 60 characters; keep the keywords, drop the brand suffix when it would overflow.
  return { absolute: full.length <= 60 ? full : core };
}

/** Search snippets cut at about 155 characters, so end on a whole word before that. */
export function snippet(text: string, limit = 155) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit).replace(/\s+\S*$/, "")}...`;
}
