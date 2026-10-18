import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import ProductDetailClient from "@/components/ProductDetailClient";
import { getProductBySlug } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://the-print-planet.onrender.com";

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

  return {
    title: product.seo_title || `${product.name} | The Print Planet`,
    description: product.seo_description || product.short_description || product.description,
    alternates: {
      canonical: `${SITE_URL}/products/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | The Print Planet`,
      description: product.short_description || product.description,
      url: `${SITE_URL}/products/${product.slug}`,
      images: [
        {
          url: imgUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.short_description || product.description,
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
    "@type": "Product",
    name: product.name,
    image: getAbsoluteImageUrl(product.primary_image?.secure_url),
    description: product.short_description || product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "The Print Planet",
    },
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: product.currency || "INR",
      price: product.price ? product.price.toString() : "0.00",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "The Print Planet",
      },
    },
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
