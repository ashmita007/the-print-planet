import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import PageHero from "@/components/PageHero";
import FaqAccordion from "@/components/FaqAccordion";
import { CATEGORY_SEO } from "@/lib/categorySeo";
import { brandedTitle, snippet } from "@/lib/seo";
import MobileFilterSortBar from "@/components/MobileFilterSortBar";
import Pagination from "@/components/Pagination";
import { getCategoryBySlug, getProducts, getCategories } from "@/lib/api";
import { fixCategorySpelling, formatCategoryName, formatProductName } from "@/lib/formatters";

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

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { page } = searchParams ? await searchParams : { page: undefined };
  const currentPage = Number(page) || 1;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return { title: { absolute: "Category Not Found | The Print Planet" }, robots: { index: false, follow: true } };
  }
  const seo = CATEGORY_SEO[category.slug];
  const name = formatProductName(fixCategorySpelling(category.name));
  // Stored copy of this shape was bulk generated and says nothing specific.
  const generic = /wholesale id supplies|high quality industrial/i;
  const storedTitle = category.seo_title && !generic.test(category.seo_title) ? category.seo_title : "";
  const storedDesc = category.seo_description && !generic.test(category.seo_description) ? category.seo_description : "";
  // Long category names plus "Wholesale Supplier in India" ran past 60 characters and got cut in results.
  const fallbackTitle = name.length <= 32 ? `${name} Wholesale Supplier India` : `${name} Wholesale`;
  const title = brandedTitle(seo?.title || storedTitle || fallbackTitle);
  const desc = snippet(
    seo?.description ||
      storedDesc ||
      `${name} from The Print Planet, Bengaluru. See wholesale prices online, with GST invoice and delivery across India.`
  );
  const shareTitle = title.absolute;

  return {
    title,
    description: desc,
    alternates: {
      canonical: `${SITE_URL}/categories/${category.slug}${currentPage > 1 ? `?page=${currentPage}` : ""}`,
    },
    // An empty category has nothing to rank, so it stays out of the index until stocked.
    ...(category.products_count > 0 ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      title: shareTitle,
      description: desc,
      url: `${SITE_URL}/categories/${category.slug}`,
      type: "website",
      siteName: "The Print Planet",
      images: [
        {
          url: `${SITE_URL}/media/products/LAN-ROY-20M.png`,
          width: 1200,
          height: 630,
          alt: `${fixCategorySpelling(category.name)} - The Print Planet`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
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
  const seo = CATEGORY_SEO[category.slug];

  const categoryJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/categories/${category.slug}#collection`,
        name: `${fixCategorySpelling(category.name)} - The Print Planet`,
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
            name: fixCategorySpelling(category.name),
            item: `${SITE_URL}/categories/${category.slug}`,
          },
        ],
      },
      ...(seo?.questions && seo.questions.length > 0
        ? [
            {
              "@type": "FAQPage",
              "@id": `${SITE_URL}/categories/${category.slug}#faq`,
              mainEntity: seo.questions.map((q) => ({
                "@type": "Question",
                name: q.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: q.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };

  const parentCategory = category.parent ? allCategories.find((c) => c.id === category.parent) : null;

  // Subcategories without written copy were a bare product grid. Summarise the real catalogue data instead.
  const listed = productsData.results || [];
  const prices = listed.map((p) => Number(p.price)).filter((n) => n > 0);
  const moqs = listed.map((p) => p.minimum_order_quantity || 0).filter((n) => n > 0);
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const displayName = formatProductName(fixCategorySpelling(category.name));
  const subcategoryIntro =
    !seo && listed.length > 0
      ? [
          `We stock ${productsData.count} ${productsData.count === 1 ? "product" : "products"} in ${displayName}, sold wholesale from our Bengaluru unit with a GST invoice on every order.`,
          prices.length > 0
            ? `Listed prices run from ${inr(Math.min(...prices))} to ${inr(Math.max(...prices))} per unit before GST${
                prices.length < listed.length ? "; the rest are priced on request by quantity" : ""
              }.`
            : "Prices depend on quantity, so every item here is quoted on request.",
          moqs.length > 0 ? `Minimum orders start at ${Math.min(...moqs)} units.` : "",
          `Models in this range: ${listed
            .slice(0, 8)
            .map((p) => formatProductName(p.name))
            .join(", ")}${listed.length > 8 ? " and more" : ""}.`,
        ].filter(Boolean)
      : [];
  const childSubcategories = allCategories.filter((c) => c.parent === category.id);
  const mainCategories = allCategories.filter((c) => !c.parent);
  const siblingSubcategories = parentCategory ? allCategories.filter((c) => c.parent === parentCategory.id) : [];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />
      <PageHero
        title={seo?.h1 || formatCategoryName(category.name)}
        lead={seo?.lead || category.description || undefined}
        crumbs={[
          { label: "Products", href: "/products" },
          ...(parentCategory ? [{ label: fixCategorySpelling(parentCategory.name), href: `/categories/${parentCategory.slug}` }] : []),
          { label: fixCategorySpelling(category.name) },
        ]}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Child Subcategories Selector Grid (if viewing Main Category) */}
      {childSubcategories.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-[#121418] uppercase tracking-wider">
              Subcategories in {formatCategoryName(category.name)} ({childSubcategories.length})
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {childSubcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/categories/${sub.slug}`}
                className="p-3 rounded-md bg-[#FFFFFF] border border-[#DFE6EE] hover:border-[#121418] hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <span className="text-xs font-bold text-[#121418] group-hover:text-[#121418] transition-colors line-clamp-2 uppercase tracking-wide">
                  {formatCategoryName(sub.name)}
                </span>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                  <span>{sub.products_count || 0} products</span>
                  <span className="text-[#353C45] font-bold group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sibling Subcategories Selector (if viewing Subcategory) */}
      {siblingSubcategories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-[#353C45] shrink-0">Related in {fixCategorySpelling(parentCategory?.name)}:</span>
          {siblingSubcategories.map((sib) => (
            <Link
              key={sib.id}
              href={`/categories/${sib.slug}`}
              className={`px-3 py-1.5 rounded-full shrink-0 font-semibold transition-colors ${
                sib.slug === slug
                  ? "bg-[#121418] text-white"
                  : "bg-[#EDF1F6] text-[#121418] hover:bg-slate-200 border border-[#DFE6EE]"
              }`}
            >
              {fixCategorySpelling(sib.name)}
            </Link>
          ))}
        </div>
      )}

      {/* Main Sector Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <span className="font-bold text-[#353C45] shrink-0">Main Sectors:</span>
        <Link
          href="/products"
          className="px-3 py-1.5 rounded-full shrink-0 font-semibold bg-[#EDF1F6] text-[#121418] hover:bg-slate-200 border border-[#DFE6EE]"
        >
          All 180+ Products
        </Link>
        {mainCategories.map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            className={`px-3 py-1.5 rounded-full shrink-0 font-semibold transition-colors ${
              c.slug === slug || (parentCategory && parentCategory.slug === c.slug)
                ? "bg-[#121418] text-white"
                : "bg-[#EDF1F6] text-[#121418] hover:bg-slate-200 border border-[#DFE6EE]"
            }`}
          >
            {formatCategoryName(c.name)}
          </Link>
        ))}
      </div>

      {/* Products Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#DFE6EE] pb-3 gap-2">
          <h2 className="text-xs font-bold text-[#353C45]">
            Showing <strong className="text-[#121418]">{productsData.results.length}</strong> products in <span className="uppercase">{formatCategoryName(category.name)}</span>
          </h2>
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
          <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-md p-12 text-center text-xs text-slate-500">
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

      {subcategoryIntro.length > 0 && (
        <section aria-labelledby="category-about" className="border-t border-[#DFE6EE] pt-8 max-w-3xl">
          <h2 id="category-about" className="text-xl font-extrabold tracking-tight text-[#121418]">
            About {displayName}
          </h2>
          <div className="mt-3 space-y-3 text-sm text-[#121418] leading-relaxed">
            {subcategoryIntro.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>
              Not sure which one matches what you use now? Send a photo on{" "}
              <a href="https://wa.me/919741808034" className="font-semibold underline" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>{" "}
              or{" "}
              <Link href="/quote" className="font-semibold underline">
                request a quote
              </Link>
              {parentCategory ? (
                <>
                  , or browse the full{" "}
                  <Link href={`/categories/${parentCategory.slug}`} className="font-semibold underline">
                    {formatProductName(fixCategorySpelling(parentCategory.name))}
                  </Link>{" "}
                  range
                </>
              ) : null}
              .
            </p>
          </div>
        </section>
      )}

      {seo && (
        <section aria-labelledby="category-guide" className="border-t border-[#DFE6EE] pt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 id="category-guide" className="text-2xl font-extrabold tracking-tight text-[#121418]">
              Choosing {seo.h1.toLowerCase().replace(/\bid\b/, "ID").replace(/\bpvc\b/, "PVC").replace(/\brfid\b/, "RFID")}
            </h2>
            <div className="mt-3 space-y-3 text-sm text-[#121418] leading-relaxed max-w-xl">
              {seo.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <FaqAccordion items={seo.questions} />
        </section>
      )}
      </div>
    </div>
  );
}
