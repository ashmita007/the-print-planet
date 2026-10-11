import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import ProductDetailClient from "@/components/ProductDetailClient";
import { getProductBySlug } from "@/lib/api";

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
  return {
    title: `${product.seo_title || product.name} | The Print Planet`,
    description: product.seo_description || product.short_description || product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.primary_image ? [product.primary_image.secure_url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-12">
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
        <section className="pt-10 border-t border-[#DCE3EB] space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#17365D]">
              Related Products in {product.category.name}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {product.related_products.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
