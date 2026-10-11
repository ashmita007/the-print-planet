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
  Sparkles,
  Palette,
  CreditCard,
  ArrowUpRight,
  Wrench,
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

      {/* 2. Trending Industrial Capabilities & Category Ecosystem (Bento Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E87832]/10 border border-[#E87832]/25 text-[#E87832] text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Production Infrastructure</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight">
              Engineered Product Ecosystems
            </h2>
            <p className="text-xs sm:text-sm text-[#687586] mt-1 max-w-xl">
              Precision extrusion, optical-grade holders, contactless RFID, and turnkey manufacturing systems.
            </p>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-[#17365D] hover:text-[#E87832] transition-colors self-start sm:self-auto py-1.5 px-3 rounded-lg border border-[#DCE3EB] hover:border-[#E87832] bg-white shadow-2xs"
          >
            <span>Explore All 63 Models</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 mb-8">
          {/* Bento Card 1: Lanyard Rolls & Custom Sublimation (Span 7 cols) */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#F5F7FA] to-white border border-[#DCE3EB] hover:border-[#17365D] rounded-2xl p-6 sm:p-7 transition-all duration-300 shadow-2xs hover:shadow-lg flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E87832]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#E87832]/10 transition-colors" />
            
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#17365D] text-white">
                  <Palette className="w-3 h-3 text-[#E87832]" />
                  Flagship Extrusion
                </span>
                <span className="text-xs font-bold text-[#687586] bg-white border border-[#DCE3EB] px-2.5 py-1 rounded-md">
                  16 Models Available
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-[#17365D] group-hover:text-[#E87832] transition-colors leading-snug mb-2">
                Color & Digital Sublimation Lanyard Rolls
              </h3>
              <p className="text-xs sm:text-sm text-[#475467] leading-relaxed mb-5 max-w-lg">
                Premium high-tenacity polyester & satin ribbons manufactured for commercial badge printers. Zero dye bleeding, high tensile weave, and precision slit edges.
              </p>

              {/* Color Swatch Ribbon Visual */}
              <div className="bg-white rounded-xl p-3.5 border border-[#DCE3EB] shadow-2xs mb-5">
                <div className="text-[11px] font-bold text-[#687586] uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Factory In-Stock Color Palette</span>
                  <span className="text-[#E87832] lowercase text-[10px] font-semibold">100m – 500m rolls</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { name: "Royal Blue", bg: "bg-[#1E40AF]" },
                    { name: "Navy Blue", bg: "bg-[#17365D]" },
                    { name: "Orange", bg: "bg-[#EA580C]" },
                    { name: "Crimson Red", bg: "bg-[#DC2626]" },
                    { name: "Forest Green", bg: "bg-[#16A34A]" },
                    { name: "Yellow", bg: "bg-[#EAB308]" },
                    { name: "Charcoal", bg: "bg-[#334155]" },
                    { name: "Jet Black", bg: "bg-[#0F172A]" },
                    { name: "White Satin", bg: "bg-[#F8FAFC] border border-gray-300" },
                  ].map((color) => (
                    <div
                      key={color.name}
                      className="group/swatch relative flex items-center gap-1 px-2 py-1 rounded-md bg-[#F5F7FA] border border-[#DCE3EB] text-[11px] font-medium text-[#263445]"
                      title={color.name}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${color.bg} shadow-2xs`} />
                      <span className="hidden sm:inline text-[10px]">{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specs Pills */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-[#17365D]/5 text-[#17365D] font-semibold px-2.5 py-1 rounded-md">
                  12mm, 16mm & 20mm
                </span>
                <span className="bg-[#17365D]/5 text-[#17365D] font-semibold px-2.5 py-1 rounded-md">
                  Heat Transfer Ready
                </span>
                <span className="bg-[#17365D]/5 text-[#17365D] font-semibold px-2.5 py-1 rounded-md">
                  High-Strength Weave
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DCE3EB] flex items-center justify-between">
              <div className="flex gap-2">
                <Link
                  href="/categories/color-id-card-lanyard-roll"
                  className="text-xs font-bold text-[#17365D] hover:text-[#E87832] underline underline-offset-4 decoration-[#E87832]"
                >
                  Color Rolls &rarr;
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  href="/categories/white-satin-digital-lanyard-roll"
                  className="text-xs font-bold text-[#17365D] hover:text-[#E87832] underline underline-offset-4 decoration-[#E87832]"
                >
                  Digital Satin &rarr;
                </Link>
              </div>
              <Link
                href="/categories/color-id-card-lanyard-roll"
                className="w-8 h-8 rounded-full bg-[#17365D] group-hover:bg-[#E87832] text-white flex items-center justify-center transition-colors shadow-2xs"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Bento Card 2: CR-80 High-Clarity ID Holders (Span 5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#DCE3EB] hover:border-[#17365D] rounded-2xl p-6 sm:p-7 transition-all duration-300 shadow-2xs hover:shadow-lg flex flex-col justify-between group relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#F5F7FA] text-[#17365D] border border-[#DCE3EB]">
                  <CreditCard className="w-3 h-3 text-[#E87832]" />
                  CR-80 ISO 7810
                </span>
                <span className="text-xs font-bold text-[#687586] bg-[#F5F7FA] px-2.5 py-1 rounded-md">
                  18 Models
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-[#17365D] group-hover:text-[#E87832] transition-colors leading-snug mb-2">
                Optical PVC & Rigid Acrylic Holders
              </h3>
              <p className="text-xs sm:text-sm text-[#475467] leading-relaxed mb-4">
                Crystal clear transparency, shatter-resistant acrylic, and semi-transparent flexible frost holders designed for standard 86×54mm badges.
              </p>

              {/* Visual Holder Graphic Simulation */}
              <div className="bg-[#F5F7FA] border border-[#DCE3EB] rounded-xl p-4 mb-4 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#DCE3EB] pb-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#E87832]" />
                    <span className="text-[11px] font-bold text-[#17365D]">Standard CR-80 Enclosure</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#687586]">86 × 54 mm</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded-lg border border-[#DCE3EB]">
                    <div className="text-[11px] font-bold text-[#263445]">V-2 / V-4</div>
                    <div className="text-[9px] text-[#687586]">Crystal Clear</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-[#DCE3EB]">
                    <div className="text-[11px] font-bold text-[#263445]">VS-T Frost</div>
                    <div className="text-[9px] text-[#687586]">Semi-Trans</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-[#DCE3EB]">
                    <div className="text-[11px] font-bold text-[#263445]">Executive</div>
                    <div className="text-[9px] text-[#687586]">Dual-Side</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#DCE3EB] flex items-center justify-between">
              <div className="flex gap-2">
                <Link
                  href="/categories/crystal-clear-pvc-id-card-holder"
                  className="text-xs font-bold text-[#17365D] hover:text-[#E87832] underline underline-offset-4 decoration-[#E87832]"
                >
                  Crystal Clear &rarr;
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  href="/categories/semi-transparent-pvc-id-card-holder"
                  className="text-xs font-bold text-[#17365D] hover:text-[#E87832] underline underline-offset-4 decoration-[#E87832]"
                >
                  Semi-Transparent &rarr;
                </Link>
              </div>
              <Link
                href="/categories/crystal-clear-pvc-id-card-holder"
                className="w-8 h-8 rounded-full bg-[#17365D] group-hover:bg-[#E87832] text-white flex items-center justify-center transition-colors shadow-2xs"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Bento Card 3: Smart RFID & Contactless Cards (Span 4 cols) */}
          <div className="lg:col-span-4 bg-[#102742] text-white border border-[#17365D] hover:border-[#E87832] rounded-2xl p-6 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#17365D] text-[#E87832] border border-white/10">
                  <Cpu className="w-3 h-3" />
                  Smart Access
                </span>
                <span className="text-xs font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded">
                  ISO 14443A
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-[#E87832] transition-colors leading-snug mb-2">
                RFID, Proximity & Magnetic Solutions
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                13.56 MHz Mifare 1K smart cards, 125 kHz EM4100 proximity chips, and high-coercivity magnetic stripes for automated turnstiles & access systems.
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs">
                  <span className="text-slate-300 font-medium">Mifare 1K Classic</span>
                  <span className="text-[#E87832] font-mono font-bold">13.56 MHz</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs">
                  <span className="text-slate-300 font-medium">EM4100 Proximity</span>
                  <span className="text-[#E87832] font-mono font-bold">125 kHz</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <Link
                href="/categories/rfid-smart-cards-and-consumables"
                className="text-xs font-bold text-white group-hover:text-[#E87832] transition-colors flex items-center gap-1"
              >
                <span>View RFID Hardware</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/categories/rfid-smart-cards-and-consumables"
                className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-[#E87832] text-white flex items-center justify-center transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Card 4: Industrial Fittings, Dog Hooks & Yo-Yo (Span 4 cols) */}
          <div className="lg:col-span-4 bg-[#F5F7FA] border border-[#DCE3EB] hover:border-[#17365D] rounded-2xl p-6 transition-all duration-300 shadow-2xs hover:shadow-lg flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white text-[#17365D] border border-[#DCE3EB]">
                  <Boxes className="w-3 h-3 text-[#E87832]" />
                  Tensile Tested
                </span>
                <span className="text-xs font-bold text-[#687586] bg-white border border-[#DCE3EB] px-2 py-0.5 rounded">
                  18 SKUs
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-[#17365D] group-hover:text-[#E87832] transition-colors leading-snug mb-2">
                Lanyard Hooks, Metal Clamps & Yo-Yos
              </h3>
              <p className="text-xs text-[#475467] leading-relaxed mb-4">
                Nickel-plated zinc alloy dog hooks, alligator clips, plastic safety breakaways, crimp metal clamps, and heavy-duty retractable badge reels.
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
                <div className="bg-white p-2 rounded-lg border border-[#DCE3EB] font-medium text-[#263445]">
                  Lobster Dog Hooks
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#DCE3EB] font-medium text-[#263445]">
                  Metal Clamps (12-20mm)
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#DCE3EB] font-medium text-[#263445]">
                  Crocodile Clips
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#DCE3EB] font-medium text-[#263445]">
                  Retractable Yo-Yos
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#DCE3EB] flex items-center justify-between">
              <Link
                href="/categories/id-card-lanyard-hooks"
                className="text-xs font-bold text-[#17365D] group-hover:text-[#E87832] transition-colors flex items-center gap-1"
              >
                <span>Browse Fittings & Clips</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/categories/id-card-lanyard-hooks"
                className="w-7 h-7 rounded-full bg-[#17365D] group-hover:bg-[#E87832] text-white flex items-center justify-center transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Card 5: Heavy-Duty Manufacturing Machinery (Span 4 cols) */}
          <div className="lg:col-span-4 bg-gradient-to-br from-white to-[#F5F7FA] border border-[#DCE3EB] hover:border-[#17365D] rounded-2xl p-6 transition-all duration-300 shadow-2xs hover:shadow-lg flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#E87832]/10 text-[#E87832] border border-[#E87832]/20">
                  <Wrench className="w-3 h-3" />
                  Workshop Grade
                </span>
                <span className="text-xs font-bold text-[#687586] bg-white border border-[#DCE3EB] px-2 py-0.5 rounded">
                  Warranty Backed
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-[#17365D] group-hover:text-[#E87832] transition-colors leading-snug mb-2">
                Card Cutting & Continuous Heat Press
              </h3>
              <p className="text-xs text-[#475467] leading-relaxed mb-4">
                Heavy-duty hydraulic fusers, rotary continuous roll heat transfer machines, and manual card die cutters built for industrial production runs.
              </p>

              <div className="bg-white rounded-lg p-3 border border-[#DCE3EB] text-xs space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-[#263445] font-semibold">
                  <span>Continuous Heat Press</span>
                  <span className="text-[#E87832] text-[11px]">Industrial</span>
                </div>
                <div className="flex items-center justify-between text-[#687586] text-[11px]">
                  <span>Manual CR-80 Die Cutter</span>
                  <span className="text-[#17365D] font-medium">Hardened Die</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#DCE3EB] flex items-center justify-between">
              <Link
                href="/categories/id-card-manufacturing-machines"
                className="text-xs font-bold text-[#17365D] group-hover:text-[#E87832] transition-colors flex items-center gap-1"
              >
                <span>Explore Machinery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/categories/id-card-manufacturing-machines"
                className="w-7 h-7 rounded-full bg-[#17365D] group-hover:bg-[#E87832] text-white flex items-center justify-center transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick-Jump All 10 Categories Filter Bar */}
        <div className="bg-[#F5F7FA] border border-[#DCE3EB] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#17365D] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#E87832]" />
              <span>Complete Category Index ({categories.length} Specialized Lines)</span>
            </div>
            <Link
              href="/products"
              className="text-[11px] font-bold text-[#E87832] hover:text-[#d66b28] transition-colors flex items-center gap-1"
            >
              <span>View All Catalogue Items</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group/pill inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-[#17365D] border border-[#DCE3EB] hover:border-[#17365D] transition-all duration-200 text-xs font-medium text-[#263445] hover:text-white shadow-2xs hover:shadow-xs"
              >
                <span className="font-semibold">{cat.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#F5F7FA] group-hover/pill:bg-white/20 text-[#687586] group-hover/pill:text-white font-bold transition-colors">
                  {cat.products_count}
                </span>
              </Link>
            ))}
          </div>
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
