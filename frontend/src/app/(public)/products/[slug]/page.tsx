import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import ProductDetailClient from "@/components/ProductDetailClient";
import { getProductBySlug } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

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
  const title = product.seo_title || `Buy ${product.name} Wholesale Online | The Print Planet India`;
  const description = product.seo_description || `Buy ${product.name} at wholesale factory price from The Print Planet (theprintplanet.co.in). Industrial grade, bulk manufacturer supply, and fast dispatch across India.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/products/${product.slug}`,
    },
    openGraph: {
      title,
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
      title,
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
        brand: {
          "@type": "Brand",
          name: "The Print Planet",
        },
        category: product.category?.name,
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}/products/${product.slug}`,
          priceCurrency: product.currency || "INR",
          ...(product.price && Number(product.price) > 0
            ? { price: product.price.toString() }
            : { price: "0", priceSpecification: { "@type": "UnitPriceSpecification", priceType: "https://schema.org/InvoicePrice", description: "Bulk B2B wholesale pricing upon quotation" } }),
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: {
            "@type": "Organization",
            name: "The Print Planet",
            url: SITE_URL,
          },
        },
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
          { label: product.category.name, href: `/categories/${product.category.slug}` },
          { label: product.name },
        ]}
      />

      {/* Main Product Presentation */}
      <ProductDetailClient product={product} />

      {/* Related Products Section */}
      {product.related_products && product.related_products.length > 0 && (
        <section className="pt-8 sm:pt-10 border-t border-[#DCE3EB] space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#17365D]">
                Related Products in {product.category.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#4E6178]">
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
