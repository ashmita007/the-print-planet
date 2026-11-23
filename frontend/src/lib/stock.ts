import type { Product } from "./types";

/** Stock of 0 means sold out; null or missing means the owner does not track stock. */
export const isOutOfStock = (product: Pick<Product, "stock_quantity">): boolean => product.stock_quantity === 0;
