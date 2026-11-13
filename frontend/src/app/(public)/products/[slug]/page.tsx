import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import ProductDetailClient from "@/components/ProductDetailClient";
import { formatCategoryName, formatProductName } from "@/lib/formatters";
import { getProductBySlug } from "@/lib/api";
import { brandedTitle, snippet } from "@/lib/seo";
import { isBoilerplate, isMaterialCode, productFaqs, productMetaDescription, productSummary } from "@/lib/productCopy";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const revalidate = 120;

const KNOWN_BRANDS: Array<[RegExp, string]> = [[/\bwenlin\b/i, "Wenlin"]];
const productBrand = (name: string) => KNOWN_BRANDS.find(([re]) => re.test(name))?.[1] || "";

const getAbsoluteImageUrl = (url?: string) => {
  if (!url) return `${SITE_URL}/media/products/LAN-ROY-20M.png`;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: { absolute: "Product Not Found | The Print Planet" }, robots: { index: false, follow: true } };
  }

  const imgUrl = getAbsoluteImageUrl(product.primary_image?.secure_url);
  const name = formatProductName(product.name);
  // Google shows about 60 characters: add the price wording only while the title still fits.
  const fallbackTitle =
    `${name} Wholesale Price`.length <= 60 ? `${name} Wholesale Price` : `${name} Price`.length <= 60 ? `${name} Price` : name;
  const title = brandedTitle(product.seo_title || fallbackTitle);
  const stored = product.seo_description || "";
  const description = snippet(
    stored.length >= 110 && !isBoilerplate(stored) && !/^Buy .+ wholesale factory direct/i.test(stored)
      ? stored
      : productMetaDescription(product)
  );
  const shareTitle = title.absolute;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/products/${product.slug}`,
    },
    ...(isMaterialCode(product.name) ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: shareTitle,
      description,
      url: `${SITE_URL}/products/${product.slug}`,
      siteName: "The Print Planet",
      images: [
        {
          url: imgUrl,
          width: 800,
          height: 800,
          alt: `${product.name} - The Print Planet`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: [imgUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const faqs = isMaterialCode(product.name) ? [] : productFaqs(product);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${SITE_URL}/products/${product.slug}#product`,
        name: product.name,
        image: getAbsoluteImageUrl(product.primary_image?.secure_url),
        description: productSummary(product),
        sku: product.sku || product.id?.toString(),
        category: product.category?.name,
        // Only state a brand the product name itself gives; we do not claim to make third-party machines.
        ...(productBrand(product.name) ? { brand: { "@type": "Brand", name: productBrand(product.name) } } : {}),
        // A ₹0 offer would show as free in search, so quote-only products carry no offer.
        ...(Number(product.price) > 0
          ? {
              offers: {
                "@type": "Offer",
                url: `${SITE_URL}/products/${product.slug}`,
                priceCurrency: product.currency || "INR",
                price: product.price?.toString(),
                priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
                availability: "https://schema.org/InStock",
                itemCondition: "https://schema.org/NewCondition",
                seller: { "@id": `${SITE_URL}/#organization` },
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/products/${product.slug}#breadcrumb`,
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
            name: "Product Catalogue",
            item: `${SITE_URL}/products`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.category?.name || "Products",
            item: product.category?.slug ? `${SITE_URL}/categories/${product.category.slug}` : `${SITE_URL}/products`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: product.name,
            item: `${SITE_URL}/products/${product.slug}`,
          },
        ],
      },
      ...(faqs.length
        ? [
            {
              "@type": "FAQPage",
              "@id": `${SITE_URL}/products/${product.slug}#faq`,
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-8 sm:space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: "Product Catalogue", href: "/products" },
          { label: formatCategoryName(product.category.name), href: `/categories/${product.category.slug}` },
          { label: formatProductName(product.name) },
        ]}
      />

      {/* Main Product Presentation */}
      <ProductDetailClient product={product} />

      {faqs.length > 0 && (
        <section aria-labelledby="product-faq" className="pt-8 sm:pt-10 border-t border-[#DFE6EE] space-y-4">
          <h2 id="product-faq" className="text-base sm:text-xl font-bold text-[#121418]">
            Questions buyers ask about {formatProductName(product.name)}
          </h2>
          <div className="divide-y divide-[#DFE6EE] rounded-xl border border-[#DFE6EE] bg-white">
            {faqs.map((f) => (
              <details key={f.q} className="group p-4 sm:p-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm sm:text-base font-semibold text-[#121418]">
                  <h3 className="font-semibold">{f.q}</h3>
                  <span aria-hidden="true" className="mt-0.5 text-[#F26B1D] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-[#2B323B]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Related Products Section */}
      {product.related_products && product.related_products.length > 0 && (
        <section className="pt-8 sm:pt-10 border-t border-[#DFE6EE] space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#121418]">
                Related Products in {formatCategoryName(product.category.name)}
              </h2>
              <p className="text-xs sm:text-sm text-[#2B323B]">
                Frequently purchased together for bulk institutional & trade supply
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {product.related_products.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
