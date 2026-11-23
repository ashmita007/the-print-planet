/** Where Enter in the header search goes; null when there is nothing to search for. */
export function searchHref(query: string): string | null {
  const q = query.trim();
  return q ? `/products?search=${encodeURIComponent(q)}` : null;
}

/** Arrow-key movement through suggestions; -1 means "no row highlighted" (the input itself). */
export function stepIndex(current: number, delta: 1 | -1, count: number): number {
  if (count <= 0) return -1;
  if (delta === 1) return current >= count - 1 ? -1 : current + 1;
  return current <= -1 ? count - 1 : current - 1;
}
