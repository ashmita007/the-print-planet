/** Step for +/- buttons, driven by the product's minimum order quantity. */
export const quantityStep = (moq: number): number => (moq >= 100 ? 50 : moq >= 10 ? 10 : 1);

/** No order is larger than this, whatever is typed or stored. */
export const MAX_QUANTITY = 10_000_000;

/** Upper limit only when stock is tracked; null/undefined means no limit. */
export const quantityMax = (stock: number | null | undefined): number | undefined =>
  typeof stock === "number" && stock > 0 ? stock : undefined;

/** Clamp to [min, max] and never above MAX_QUANTITY. Min wins if stock is below the MOQ. */
export const clampQuantity = (value: number, min: number, max?: number): number => {
  const floor = Math.max(1, min);
  const ceiling = Math.min(max ?? MAX_QUANTITY, MAX_QUANTITY);
  return Math.max(floor, Math.min(value, ceiling));
};

/** Parse typed text such as "1,200" or "1 200". Null when it is not a whole number; 0 is returned so it can snap to the MOQ. */
export const parseQuantity = (text: string): number | null => {
  const cleaned = text.replace(/[,\s]/g, "");
  if (!/^\d{1,12}$/.test(cleaned)) return null;
  return parseInt(cleaned, 10);
};

interface CartLine {
  quantity: number;
  minimumOrderQuantity: number;
  stockQuantity?: number | null;
}

/**
 * The quantity a cart line should hold after a change. A request of 0 or less snaps up to the
 * MOQ, so the minus button can never remove a line (the remove button does that).
 */
export const nextCartQuantity = (line: CartLine, requested: number): { quantity: number; cappedByStock: boolean } => {
  const max = quantityMax(line.stockQuantity);
  const quantity = clampQuantity(requested, line.minimumOrderQuantity || 1, max);
  return { quantity, cappedByStock: max !== undefined && requested > max };
};
