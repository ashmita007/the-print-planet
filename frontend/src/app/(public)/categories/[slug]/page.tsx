import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import MobileFilterSortBar from "@/components/MobileFilterSortBar";
import Pagination from "@/components/Pagination";
import { getCategoryBySlug, getProducts, getCategories } from "@/lib/api";
import { formatCategoryName } from "@/lib/formatters";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    page?: string;
    ordering?: string;
  }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const revalidate = 60;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return { title: "Category Not Found | The Print Planet" };
  }
  const title = category.seo_title || `${category.name} Wholesale Manufacturer & Supplier | The Print Planet India`;
  const desc = category.seo_description || category.description || `Wholesale trade supply of ${category.name} from The Print Planet (theprintplanet.co.in). High industrial grade materials, bulk trade pricing, and pan-India dispatch.`;

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
      siteName: "The Print Planet",
      images: [
        {
          url: `${SITE_URL}/media/products/LAN-ROY-20M.png`,
          width: 1200,
          height: 630,
          alt: `${category.name} - The Print Planet`,
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
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/categories/${category.slug}#collection`,
        name: `${category.name} - The Print Planet`,
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
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/categories/${category.slug}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Categories",
            item: `${SITE_URL}/categories`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: category.name,
            item: `${SITE_URL}/categories/${category.slug}`,
          },
        ],
      },
    ],
  };

  const parentCategory = category.parent ? allCategories.find((c) => c.id === category.parent) : null;
  const childSubcategories = allCategories.filter((c) => c.parent === category.id);
  const mainCategories = allCategories.filter((c) => !c.parent);
  const siblingSubcategories = parentCategory ? allCategories.filter((c) => c.parent === parentCategory.id) : [];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: "Product Catalogue", href: "/products" },
          ...(parentCategory ? [{ label: parentCategory.name, href: `/categories/${parentCategory.slug}` }] : []),
          { label: category.name },
        ]}
      />

      {/* Category Hero / Header */}
      <div className="bg-[#102742] text-white p-6 sm:p-10 rounded-2xl border-l-4 border-[#E87832] shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E87832]">
              {parentCategory ? "Subcategory Sector" : "Main Category Sector"}
            </span>
            {parentCategory && (
              <Link
                href={`/categories/${parentCategory.slug}`}
                className="text-[11px] font-bold uppercase tracking-wider text-slate-300 hover:text-white bg-white/10 px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1"
              >
                <span>Part of {formatCategoryName(parentCategory.name)} &rarr;</span>
              </Link>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight uppercase">
            {formatCategoryName(category.name)}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {category.description ||
              "Explore full verified models, dimensions, materials, and trade prices."}
          </p>
        </div>
      </div>

      {/* Child Subcategories Selector Grid (if viewing Main Category) */}
      {childSubcategories.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-[#17365D] uppercase tracking-wider">
              Subcategories in {formatCategoryName(category.name)} ({childSubcategories.length})
            </h2>
            <span className="text-xs text-slate-500">Filter by specific product line</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {childSubcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/categories/${sub.slug}`}
                className="p-3 rounded-xl bg-white border border-[#DCE3EB] hover:border-[#17365D] hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <span className="text-xs font-bold text-[#263445] group-hover:text-[#17365D] transition-colors line-clamp-2 uppercase tracking-wide">
                  {formatCategoryName(sub.name)}
                </span>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                  <span>{sub.products_count || 0} products</span>
                  <span className="text-[#E87832] font-bold group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sibling Subcategories Selector (if viewing Subcategory) */}
      {siblingSubcategories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-[#687586] shrink-0">Related in {parentCategory?.name}:</span>
          {siblingSubcategories.map((sib) => (
            <Link
              key={sib.id}
              href={`/categories/${sib.slug}`}
              className={`px-3 py-1.5 rounded-full shrink-0 font-semibold transition-colors ${
                sib.slug === slug
                  ? "bg-[#17365D] text-white"
                  : "bg-[#F5F7FA] text-[#263445] hover:bg-slate-200 border border-[#DCE3EB]"
              }`}
            >
              {sib.name}
            </Link>
          ))}
        </div>
      )}

      {/* Main Sector Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <span className="font-bold text-[#687586] shrink-0">Main Sectors:</span>
        <Link
          href="/products"
          className="px-3 py-1.5 rounded-full shrink-0 font-semibold bg-[#F5F7FA] text-[#263445] hover:bg-slate-200 border border-[#DCE3EB]"
        >
          All 180+ Products
        </Link>
        {mainCategories.map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            className={`px-3 py-1.5 rounded-full shrink-0 font-semibold transition-colors ${
              c.slug === slug || (parentCategory && parentCategory.slug === c.slug)
                ? "bg-[#17365D] text-white"
                : "bg-[#F5F7FA] text-[#263445] hover:bg-slate-200 border border-[#DCE3EB]"
            }`}
          >
            {formatCategoryName(c.name)}
          </Link>
        ))}
      </div>

      {/* Products Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCE3EB] pb-3 gap-2">
          <span className="text-xs font-bold text-[#687586]">
            Showing <strong className="text-[#17365D]">{productsData.results.length}</strong> products in <span className="uppercase">{formatCategoryName(category.name)}</span>
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
