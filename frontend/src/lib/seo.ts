const BRAND = "The Print Planet";

/** Drops any brand suffix stored in the database, then adds exactly one. */
export function brandedTitle(raw: string) {
  const core = raw.split(/\s+\|\s+/)[0].replace(/\s+/g, " ").trim();
  return { absolute: `${core} | ${BRAND}` };
}

/** Search snippets cut at about 155 characters, so end on a whole word before that. */
export function snippet(text: string, limit = 155) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit).replace(/\s+\S*$/, "")}...`;
}
