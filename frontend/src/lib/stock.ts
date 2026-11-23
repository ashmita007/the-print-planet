import type { Product } from "./types";

/** Stock of 0 means sold out; null or missing means the owner does not track stock. */
export const isOutOfStock = (product: Pick<Product, "stock_quantity">): boolean => product.stock_quantity === 0;

type StockFields = Pick<Product, "stock_quantity" | "minimum_order_quantity">;

/** Some stock, but fewer than the minimum order: the buyer cannot order it online. */
export const stockBelowMoq = (product: StockFields): boolean =>
  typeof product.stock_quantity === "number" &&
  product.stock_quantity > 0 &&
  product.stock_quantity < (product.minimum_order_quantity || 1);

/** Can be added to the cart: not sold out and not stuck below its minimum order. */
export const isOrderable = (product: StockFields): boolean => !isOutOfStock(product) && !stockBelowMoq(product);

export const belowMoqMessage = (stock: number): string =>
  `Only ${stock} in stock, below minimum order. Contact us to order.`;
