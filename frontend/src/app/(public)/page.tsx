import React from "react";
import Link from "next/link";
import {
  CheckCircle,
  Truck,
  Award,
  Factory,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductHeroShowcase from "@/components/ProductHeroShowcase";
import DirectProductShowcase from "@/components/DirectProductShowcase";
import {
  getCategories,
  getFeaturedProducts,
  getProducts,
  getSiteSettings,
} from "@/lib/api";

export default async function HomePage() {
  const [categories, productsData, featuredProducts, machineryProducts, settings] = await Promise.all([
    getCategories(),
    getProducts({ page_size: 65 }),
    getFeaturedProducts(),
    getProducts({ category: "id-card-manufacturing-machines" }),
    getSiteSettings(),
  ]);

  const phone = settings?.phone || "+91 97418 08034";
  const email = settings?.email || "theprintplanet01@gmail.com";
  const businessName = settings?.business_name || "THE PRINT PLANET";

  const productsList = productsData?.results || [];
  const machineryList = machineryProducts?.results || [];
  const safeFeatured = featuredProducts?.length > 0 ? featuredProducts : productsList.slice(0, 6);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Product-First Industrial Hero Showcase */}
      <ProductHeroShowcase
        flagshipProducts={safeFeatured}
        totalProductsCount={productsData?.count || productsList.length}
      />

      {/* 2. Direct Industrial Products Showcase with Live Category Tabs & Search */}
      <DirectProductShowcase
        products={productsList}
        categories={categories || []}
      />

      {/* 4. Industrial Machinery & Equipment Section */}
      <section className="bg-[#F5F7FA] py-16 border-y border-[#DCE3EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E87832] block mb-1">
              Production Machinery
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight">
              ID Card Cutting, Fusing & Continuous Heat Press
            </h2>
            <p className="text-xs sm:text-sm text-[#687586] mt-2 leading-relaxed">
              Heavy-duty machines engineered for commercial print shops and ID manufacturers.
              Fully tested with warranty support and spare dies.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5">
            {machineryList.map((machine) => (
              <ProductCard key={machine.id} product={machine} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Custom Requirements & Bulk Order Callout */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="bg-[#17365D] rounded-xl sm:rounded-2xl text-white p-5 sm:p-10 shadow-xl border border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-8 space-y-3 sm:space-y-4">
              <span className="bg-[#E87832] text-white text-[10px] sm:text-[11px] font-bold uppercase px-2.5 py-1 rounded">
                Custom Dyeing & Print Service
              </span>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Require Custom Widths, Pantone Matching, or Screen Printing?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                We manufacture customized polyester ribbons in 12mm, 16mm, 20mm, and 25mm with
                custom corporate colors, multi-color sublimation transfer, and branded dog hooks.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 pt-2">
                <Link
                  href="/contact"
                  className="bg-[#E87832] hover:bg-[#d66b28] text-white px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs tracking-wide transition-colors shadow-sm text-center"
                >
                  Submit Custom Batch Specs
                </Link>
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs tracking-wide transition-colors text-center"
                >
                  Call Support: {phone}
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#102742] p-4 sm:p-6 rounded-xl border border-white/10 text-xs space-y-2.5 sm:space-y-3">
              <h3 className="font-bold text-white text-sm border-b border-white/10 pb-2">
                Wholesale Assurance
              </h3>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-[#217A4B] shrink-0" />
                <span>Verified raw materials & high tensile strength</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-[#217A4B] shrink-0" />
                <span>Uniform roll winding with plastic core</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-[#217A4B] shrink-0" />
                <span>Export quality packaging in corrugated cartons</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-[#217A4B] shrink-0" />
                <span>Pan-India and international logistics support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Company Introduction & Trust Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white border border-[#DCE3EB] p-4 sm:p-6 rounded-xl space-y-2.5 sm:space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-[#F5F7FA] flex items-center justify-center text-[#17365D]">
              <Factory className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#17365D]">Modern Manufacturing</h3>
            <p className="text-xs text-[#687586] leading-relaxed">
              Equipped with precision slitting, ultrasonic welding, automatic punching dies,
              and continuous thermal printing drums ensuring consistent quality across high volumes.
            </p>
          </div>

          <div className="bg-white border border-[#DCE3EB] p-4 sm:p-6 rounded-xl space-y-2.5 sm:space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-[#F5F7FA] flex items-center justify-center text-[#17365D]">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#17365D]">Tested Technical Tolerances</h3>
            <p className="text-xs text-[#687586] leading-relaxed">
              Every badge holder and lanyard fitting conforms to international ISO CR-80 card
              standards with zero burrs, accurate slot positions, and secure closure clips.
            </p>
          </div>

          <div className="bg-white border border-[#DCE3EB] p-4 sm:p-6 rounded-xl space-y-2.5 sm:space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-[#F5F7FA] flex items-center justify-center text-[#17365D]">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#17365D]">Direct Trade Pricing</h3>
            <p className="text-xs text-[#687586] leading-relaxed">
              As an industrial manufacturer and master distributor, we provide transparent
              trade pricing directly to corporate suppliers, schools, universities, and security providers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
