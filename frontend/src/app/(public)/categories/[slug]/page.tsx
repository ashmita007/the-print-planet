import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import MobileFilterSortBar from "@/components/MobileFilterSortBar";
import Pagination from "@/components/Pagination";
import { getCategoryBySlug, getProducts, getCategories } from "@/lib/api";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    page?: string;
    ordering?: string;
  }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://the-print-planet.onrender.com";

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return { title: "Category Not Found | The Print Planet" };
  }
  const title = category.seo_title || `${category.name} | The Print Planet`;
  const desc = category.seo_description || category.description || `Wholesale trade supply of ${category.name}. High industrial grade materials.`;

  return {
    title,
    description: desc,
    alternates: {
      canonical: `${SITE_URL}/categories/${category.slug}`,
    },
    openGraph: {
      title,
      description: desc,
      url: `${SITE_URL}/categories/${category.slug}`,
      type: "website",
      images: [
        {
          url: `${SITE_URL}/media/products/LAN-ROY-20M.png`,
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [`${SITE_URL}/media/products/LAN-ROY-20M.png`],
    },
  };
}

export default async function CategoryDetailPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sParams = searchParams ? await searchParams : {};
  const currentPage = sParams.page ? parseInt(sParams.page, 10) : 1;

  const [category, productsData, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    getProducts({
      category: slug,
      page: currentPage,
      ordering: sParams.ordering,
    }),
    getCategories(),
  ]);

  if (!category) {
    notFound();
  }

  const totalPages = Math.ceil(productsData.count / 24);

  const categoryJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: `${SITE_URL}/categories/${category.slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: (productsData.results || []).map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE_URL}/products/${p.slug}`,
        name: p.name,
      })),
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />
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
        <div className="flex items-center justify-between border-b border-[#DCE3EB] pb-3 gap-2">
          <span className="text-xs font-bold text-[#687586]">
            Showing <strong className="text-[#17365D]">{productsData.results.length}</strong> products in {category.name}
          </span>
          <MobileFilterSortBar
            categories={allCategories}
            activeCategory={slug}
            totalCount={productsData.results.length}
            basePath="/products"
            buttonOnly={true}
          />
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

        {/* Responsive Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={productsData.count}
          pageSize={24}
          basePath={`/categories/${slug}`}
          queryParams={{
            ordering: sParams.ordering,
          }}
        />
      </section>
    </div>
  );
}
