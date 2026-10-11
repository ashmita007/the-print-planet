import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Package,
  Layers,
  Settings,
  ArrowRight,
  Phone,
  Mail,
  CheckCircle,
  Truck,
  Award,
  Factory,
  Boxes,
  Cpu,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import {
  getCategories,
  getFeaturedProducts,
  getProducts,
  getSiteSettings,
} from "@/lib/api";

export default async function HomePage() {
  const [categories, featuredProducts, machineryProducts, settings] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getProducts({ category: "id-card-manufacturing-machines" }),
    getSiteSettings(),
  ]);

  const phone = settings?.phone || "+91 98980 61569";
  const email = settings?.email || "sales@theprintplanet.in";
  const businessName = settings?.business_name || "The Print Planet";

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Industrial Hero Section */}
      <section className="relative bg-[#102742] text-white overflow-hidden py-16 lg:py-24 border-b-4 border-[#E87832]">
        {/* Subtle geometric grid background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Industrial Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-[#E87832] text-xs font-bold tracking-wide uppercase border border-white/10">
                <Factory className="w-3.5 h-3.5" />
                Factory-Direct Identification Solutions
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15] text-balance">
                Industrial ID Card Supplies,{" "}
                <span className="text-[#E87832]">Lanyard Rolls</span> & Production Machinery.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                High-capacity manufacturing and wholesale distribution of single & double satin
                lanyard rolls, frosted and crystal clear PVC holders, dog hooks, crimp clamps,
                hydraulic card fusing machines, and smart card consumables.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/products"
                  className="bg-[#E87832] hover:bg-[#d66b28] text-white px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center gap-2 group"
                >
                  <span>Explore 60+ Reference Products</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/contact"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center gap-2"
                >
                  <span>Request Wholesale Quotation</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="font-extrabold text-white text-base">CR-80</div>
                  <div className="text-slate-400 text-[11px]">ISO Standard Dimensions</div>
                </div>
                <div>
                  <div className="font-extrabold text-white text-base">100m Rolls</div>
                  <div className="text-slate-400 text-[11px]">Precision Continuous Length</div>
                </div>
                <div>
                  <div className="font-extrabold text-white text-base">Same-Day</div>
                  <div className="text-slate-400 text-[11px]">Bulk Dispatch Available</div>
                </div>
              </div>
            </div>

            {/* Right Column: Key Industrial Visuals / Quick Highlights */}
            <div className="lg:col-span-5">
              <div className="bg-[#17365D] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E87832]">
                    Wholesale Highlights
                  </span>
                  <span className="text-xs bg-[#217A4B] text-white font-semibold px-2 py-0.5 rounded">
                    In Stock
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <Layers className="w-5 h-5 text-[#E87832] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Color Satin Lanyard Rolls</h4>
                      <p className="text-slate-300 text-xs mt-0.5">
                        16mm & 20mm rolls in Royal Blue, Purple, Orange, Black, Yellow, and Red.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <Boxes className="w-5 h-5 text-[#E87832] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-sm">PVC Badge Holders (V & H)</h4>
                      <p className="text-slate-300 text-xs mt-0.5">
                        Semi-transparent & crystal clear models: V2, V4, H4, VS-T, C2T, and executive series.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <Cpu className="w-5 h-5 text-[#E87832] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Card Manufacturing Units</h4>
                      <p className="text-slate-300 text-xs mt-0.5">
                        DCT4500 automatic punch cutter, DCT150 A4+ hydraulic fusing laminator.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/contact"
                    className="block text-center py-2.5 rounded-lg bg-[#E87832] text-white font-bold text-xs hover:bg-[#d66b28] transition-colors"
                  >
                    Send Direct RFQ & Batch Specs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Product Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#E87832] mb-1">
              Industrial Catalogue
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight">
              Explore Product Categories
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-[#17365D] hover:text-[#E87832] flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group bg-[#F5F7FA] hover:bg-white border border-[#DCE3EB] hover:border-[#17365D] rounded-xl p-5 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-white border border-[#DCE3EB] group-hover:bg-[#17365D] flex items-center justify-center text-[#17365D] group-hover:text-white transition-colors mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#263445] group-hover:text-[#17365D] transition-colors leading-snug">
                  {cat.name}
                </h3>
              </div>
              <div className="mt-4 pt-3 border-t border-[#DCE3EB]/60 flex items-center justify-between text-xs text-[#687586]">
                <span className="font-medium">{cat.products_count} models</span>
                <span className="text-[#E87832] font-bold group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Products from PostgreSQL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#E87832] mb-1">
              Factory Direct
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight">
              Featured Industrial Products
            </h2>
          </div>
          <Link
            href="/products?featured=true"
            className="text-xs font-bold text-[#17365D] hover:text-[#E87832] flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>Browse Featured Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {machineryProducts.results.map((machine) => (
              <ProductCard key={machine.id} product={machine} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Custom Requirements & Bulk Order Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#17365D] rounded-2xl text-white p-8 sm:p-12 shadow-xl border border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="bg-[#E87832] text-white text-[11px] font-bold uppercase px-2.5 py-1 rounded">
                Custom Dyeing & Print Service
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Require Custom Widths, Pantone Matching, or Screen Printing?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                We manufacture customized polyester ribbons in 12mm, 16mm, 20mm, and 25mm with
                custom corporate colors, multi-color sublimation transfer, and branded dog hooks.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/contact"
                  className="bg-[#E87832] hover:bg-[#d66b28] text-white px-6 py-3 rounded-xl font-bold text-xs tracking-wide transition-colors shadow-sm"
                >
                  Submit Custom Batch Specs
                </Link>
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl font-bold text-xs tracking-wide transition-colors"
                >
                  Call Technical Support: {phone}
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#102742] p-6 rounded-xl border border-white/10 text-xs space-y-3">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#DCE3EB] p-6 rounded-xl space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-[#F5F7FA] flex items-center justify-center text-[#17365D]">
              <Factory className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#17365D]">Modern Manufacturing</h3>
            <p className="text-xs text-[#687586] leading-relaxed">
              Equipped with precision slitting, ultrasonic welding, automatic punching dies,
              and continuous thermal printing drums ensuring consistent quality across high volumes.
            </p>
          </div>

          <div className="bg-white border border-[#DCE3EB] p-6 rounded-xl space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-[#F5F7FA] flex items-center justify-center text-[#17365D]">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#17365D]">Tested Technical Tolerances</h3>
            <p className="text-xs text-[#687586] leading-relaxed">
              Every badge holder and lanyard fitting conforms to international ISO CR-80 card
              standards with zero burrs, accurate slot positions, and secure closure clips.
            </p>
          </div>

          <div className="bg-white border border-[#DCE3EB] p-6 rounded-xl space-y-3 shadow-2xs">
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
