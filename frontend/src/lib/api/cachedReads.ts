import { cache } from "react";
import { getCategoryBySlug, getProductBySlug } from "./public";

// One fetch per request, shared by generateMetadata and the page itself.
export const loadProduct = cache(getProductBySlug);
export const loadCategory = cache(getCategoryBySlug);
