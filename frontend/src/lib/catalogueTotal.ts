/** Navbar badge count: the live catalogue size, else the sum of top-level category counts. */
export function catalogueTotal(apiCount: number, topLevelCounts: number[]): number {
  if (apiCount > 0) return apiCount;
  return topLevelCounts.reduce((sum, n) => sum + (n > 0 ? n : 0), 0);
}
