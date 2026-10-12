import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCategoryBySlug, getProducts, getCategories } from "@/lib/api";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return { title: "Category Not Found | The Print Planet" };
  }
  return {
    title: `${category.seo_title || category.name} | The Print Planet`,
    description: category.seo_description || category.description,
  };
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [category, productsData, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    getProducts({ category: slug }),
    getCategories(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-8">
      <Breadcrumbs
        items={[
          { label: "Product Catalogue", href: "/products" },
          { label: category.name },
        ]}
      />

      {/* Category Hero / Header */}
      <div className="bg-[#102742] text-white p-6 sm:p-10 rounded-2xl border-l-4 border-[#E87832] shadow-sm">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E87832]">
            Category Overview
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {category.description ||
              "Explore full verified models, dimensions, materials, and trade prices."}
          </p>
        </div>
      </div>

      {/* Cross-Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <span className="font-bold text-[#687586] shrink-0">Browse Categories:</span>
        {allCategories.map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            className={`px-3 py-1.5 rounded-full shrink-0 font-semibold transition-colors ${
              c.slug === slug
                ? "bg-[#17365D] text-white"
                : "bg-[#F5F7FA] text-[#263445] hover:bg-slate-200"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* Products Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCE3EB] pb-3">
          <span className="text-xs font-bold text-[#687586]">
            Showing <strong className="text-[#17365D]">{productsData.results.length}</strong> products in {category.name}
          </span>
        </div>

        {productsData.results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5">
            {productsData.results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#DCE3EB] rounded-xl p-12 text-center text-xs text-slate-500">
            No products currently active in this category.
          </div>
        )}
      </section>
    </div>
  );
}
