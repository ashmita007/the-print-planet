import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getProducts } from "@/lib/api";
import { getProductImageUrl } from "@/lib/formatters";

const LINES: { slug: string; label: string; span: string; photo?: RegExp }[] = [
  { slug: "machines", label: "Machines", span: "col-span-2 lg:row-span-2" },
  { slug: "id-card-holder", label: "ID card holders", span: "" },
  { slug: "indian-satin-digital-lanyard-roll", label: "Lanyard rolls", span: "" },
  { slug: "pvc-id-card-consumable", label: "PVC card sheets", span: "" },
  { slug: "rfid-cansumables", label: "RFID cards", span: "", photo: /mifare|rfid/i },
];

/** The catalogue by product family: real product photos, names and live counts. */
export default async function ProductLines() {
  const lines = await Promise.all(
    LINES.map(async (line) => {
      const data = await getProducts({ category: line.slug, page: 1, page_size: 8 });
      const results = data?.results ?? [];
      // Categories can open with an accessory, so a line can name the photo it wants.
      const hero = (line.photo && results.find((product) => line.photo?.test(product.name))) || results[0];
      return { ...line, count: data?.count ?? 0, image: getProductImageUrl(hero) };
    })
  );

  return (
    <section aria-labelledby="lines-heading" className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
      <div className="flex items-baseline justify-between gap-4 mb-6">
        <h2 id="lines-heading" className="text-3xl sm:text-4xl font-extrabold text-[#22272E] tracking-tight">
          Shop by product
        </h2>
        <Link
          href="/categories"
          className="shrink-0 text-sm font-semibold text-[#4E5A67] hover:underline underline-offset-4"
        >
          All categories
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {lines
          .filter((line) => line.count > 0)
          .map((line) => (
            <Link
              key={line.slug}
              data-tilt
              href={`/categories/${line.slug}`}
              className={`group flex flex-col overflow-hidden rounded-lg bg-[#EDF1F6] hover:bg-[#EDF1F6] transition-colors ${line.span}`}
            >
              <span className="relative block flex-1 min-h-40 sm:min-h-52 m-3 sm:m-4 mb-0 sm:mb-0">
                <img
                  src={line.image}
                  alt={line.label}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </span>
              <span className="flex items-end justify-between gap-2 p-3 sm:p-4">
                <span className="min-w-0">
                  <span className="block font-heading text-[15px] sm:text-lg font-bold text-[#22272E] leading-tight">
                    {line.label}
                  </span>
                  <span className="block font-mono text-xs text-[#5B6877] mt-0.5">{line.count} products</span>
                </span>
                <ArrowUpRight className="w-5 h-5 shrink-0 text-[#22272E] group-hover:text-[#5B6877] transition-colors" />
              </span>
            </Link>
          ))}
      </div>
    </section>
  );
}
