import React from "react";
import { getProducts } from "@/lib/api";
import { getProductImageUrl } from "@/lib/formatters";
import CategoryShowcaseClient, { ShowcaseSlide } from "./CategoryShowcaseClient";

// One palette shade per product family, alternating dark and light.
const SLIDES: Omit<ShowcaseSlide, "image" | "count" | "products">[] = [
  {
    slug: "pvc-id-card-consumable",
    title: "PVC card sheets",
    blurb: "Inkjet and laser fusing sheets, overlays and core sheets for ID cards that do not peel or fade.",
    ink: "#22272E",
    onInk: "#FFFFFF",
  },
  {
    slug: "indian-satin-digital-lanyard-roll",
    title: "Lanyard rolls",
    blurb: "Indian satin rolls in 12 to 25 mm for sublimation printing, in white and solid colours.",
    ink: "#DFE6EE",
    onInk: "#22272E",
  },
  {
    slug: "id-card-holder",
    title: "ID card holders",
    blurb: "Crystal, semi-transparent and executive holders in vertical and horizontal formats.",
    ink: "#3F4A56",
    onInk: "#FFFFFF",
  },
  {
    slug: "machines",
    title: "Card machines",
    blurb: "Fusing, cutting and lanyard heat press machines, with a live video demo before you pay.",
    ink: "#B9C3CF",
    onInk: "#22272E",
  },
];

/** Server half: real product photos, counts and names for each slide. */
export default async function CategoryShowcase() {
  const slides = await Promise.all(
    SLIDES.map(async (slide) => {
      const data = await getProducts({ category: slide.slug, page: 1, page_size: 6 });
      const results = data?.results ?? [];
      return {
        ...slide,
        count: data?.count ?? results.length,
        image: getProductImageUrl(results[0]),
        products: results.slice(0, 3).map((product) => ({ name: product.name, slug: product.slug })),
      };
    })
  );

  return <CategoryShowcaseClient slides={slides} />;
}
