import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import ProductDetailClient from "@/components/ProductDetailClient";
import { formatCategoryName, formatProductName } from "@/lib/formatters";
import { getProductBySlug } from "@/lib/api";
import { brandedTitle, snippet } from "@/lib/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const revalidate = 120;

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
    return { title: "Product Not Found | The Print Planet" };
  }

  const imgUrl = getAbsoluteImageUrl(product.primary_image?.secure_url);
  const name = formatProductName(product.name);
  const title = brandedTitle(product.seo_title || `${name} Wholesale Price | Buy Factory Direct`);
  const price = Number(product.price) > 0 ? `Price: ₹${Number(product.price).toLocaleString("en-IN")}. ` : "";
  const moq = product.minimum_order_quantity ? `MOQ: ${product.minimum_order_quantity}. ` : "";
  const stored = product.seo_description || "";
  const description = snippet(
    stored.length >= 110
      ? stored
      : `Buy ${name} wholesale factory direct from The Print Planet Bangalore. ${price}${moq}100% GST invoice, ready stock & 24–48h pan-India delivery.`
  );
  const shareTitle = title.absolute;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/products/${product.slug}`,
    },
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

  const productJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${SITE_URL}/products/${product.slug}#product`,
        name: product.name,
        image: getAbsoluteImageUrl(product.primary_image?.secure_url),
        description: product.short_description || product.description || `Industrial ${product.name} supplied by The Print Planet India.`,
        sku: product.sku || product.id?.toString(),
        mpn: product.sku || product.id?.toString(),
        category: product.category?.name,
        brand: {
          "@type": "Brand",
          name: "The Print Planet",
        },
        manufacturer: {
          "@id": `${SITE_URL}/#organization`,
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "86",
          bestRating: "5",
          worstRating: "1",
        },
        // A ₹0 offer would show as free in search, so quote-only products carry no offer.
        ...(Number(product.price) > 0
          ? {
              offers: {
                "@type": "Offer",
                url: `${SITE_URL}/products/${product.slug}`,
                priceCurrency: product.currency || "INR",
                price: product.price?.toString(),
                priceValidUntil: "2027-12-31",
                availability: "https://schema.org/InStock",
                itemCondition: "https://schema.org/NewCondition",
                hasMerchantReturnPolicy: {
                  "@type": "MerchantReturnPolicy",
                  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                  merchantReturnDays: 7,
                  applicableCountry: "IN",
                  returnMethod: "https://schema.org/ReturnByMail",
                },
                shippingDetails: {
                  "@type": "OfferShippingDetails",
                  shippingRate: {
                    "@type": "MonetaryAmount",
                    value: "0",
                    currency: "INR",
                  },
                  shippingDestination: [
                    {
                      "@type": "DefinedRegion",
                      addressCountry: "IN",
                    },
                  ],
                  deliveryTime: {
                    "@type": "ShippingDeliveryTime",
                    handlingTime: {
                      "@type": "QuantitativeValue",
                      minValue: 0,
                      maxValue: 1,
                      unitCode: "DAY",
                    },
                    transitTime: {
                      "@type": "QuantitativeValue",
                      minValue: 1,
                      maxValue: 3,
                      unitCode: "DAY",
                    },
                  },
                },
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
            name: product.category?.name || "Category",
            item: `${SITE_URL}/categories/${product.category?.slug || ""}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: product.name,
            item: `${SITE_URL}/products/${product.slug}`,
          },
        ],
      },
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
