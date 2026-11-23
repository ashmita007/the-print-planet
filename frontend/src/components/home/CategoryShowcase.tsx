import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts } from "@/lib/api";
import { formatProductName, getProductImageUrl } from "@/lib/formatters";

const FAMILIES = [
  {
    slug: "pvc-id-card-consumable",
    title: "PVC card sheets",
    blurb: "Inkjet and laser fusing sheets, overlays and core sheets for ID cards that do not peel or fade.",
  },
  {
    slug: "lanyards",
    title: "Lanyards",
    blurb: "Printed and plain lanyards for staff, schools and events.",
  },
  {
    slug: "id-card-holder",
    title: "ID card holders",
    blurb: "Crystal, semi-transparent and executive holders in vertical and horizontal formats.",
  },
  {
    slug: "pvc-and-smart-cards",
    title: "PVC and smart cards",
    blurb: "CR-80 PVC cards and RFID smart cards for ID, access and membership.",
  },
];

/** Four product families as a static grid: real photo, count, three products and a shop link. */
export default async function CategoryShowcase() {
  const families = await Promise.all(
    FAMILIES.map(async (family) => {
      const data = await getProducts({ category: family.slug, page: 1, page_size: 6 });
      const results = data?.results ?? [];
      return {
        ...family,
        count: data?.count ?? results.length,
        image: getProductImageUrl(results[0]),
        products: results.slice(0, 3),
      };
    })
  );

  return (
    <section aria-labelledby="families-heading" className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 sm:mt-16">
      <h2 id="families-heading" className="text-3xl sm:text-4xl font-extrabold text-[#121418] tracking-tight">
        Shop by product family
      </h2>
      <p className="mt-2 text-sm sm:text-base text-[#353C45] max-w-2xl">
        Everything an ID card desk runs on, factory direct from Bengaluru.
      </p>

      <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {families.map((family) => (
          <li
            key={family.slug}
            className="m-card group relative flex flex-col bg-white border border-[#DFE6EE] rounded-lg overflow-hidden"
          >
            <div className="relative aspect-[4/3] bg-[#EDF1F6] overflow-hidden">
              {family.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={family.image}
                  alt=""
                  loading="lazy"
                  className="m-zoom-img absolute inset-0 w-full h-full object-contain p-5"
                />
              )}
            </div>

            <div className="flex flex-col flex-1 p-4 sm:p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-bold text-[#121418]">{family.title}</h3>
                <span className="text-xs font-semibold text-[#353C45] tabular-nums shrink-0">{family.count} products</span>
              </div>
              <p className="mt-2 text-sm text-[#353C45] leading-relaxed">{family.blurb}</p>

              {family.products.length > 0 && (
                <ul className="mt-4 border-t border-[#DFE6EE]">
                  {family.products.map((product) => (
                    <li key={product.slug} className="border-b border-[#EDF1F6]">
                      <Link
                        href={`/products/${product.slug}`}
                        className="relative z-10 flex items-center min-h-11 text-[13px] font-semibold text-[#121418] hover:text-[#F26B1D] transition-colors"
                      >
                        <span className="line-clamp-1">{formatProductName(product.name)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {/* This link stretches over the whole card; the product links sit above it. */}
              <Link
                href={`/categories/${family.slug}`}
                className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#121418] group-hover:text-[#F26B1D] transition-colors after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[#121418]/50 focus-visible:after:rounded-lg"
              >
                Shop {family.title.toLowerCase()}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
