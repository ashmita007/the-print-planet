"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Truck,
  Award,
  Layers,
  FileText,
  RotateCw,
  Cpu,
  Package,
  CreditCard,
  Tag,
} from "lucide-react";
import { Product, SiteSettings } from "@/lib/types";
import EnquiryModal from "./EnquiryModal";

interface ProductHeroShowcaseProps {
  flagshipProducts: Product[];
  totalProductsCount: number;
  allProducts?: Product[];
  settings?: SiteSettings;
}

// Hero category filter tabs
const HERO_CATEGORIES = [
  { id: "all", label: "★ All Flagships" },
  { id: "machines", label: "Industrial Machines", keywords: ["machine", "cutter", "fusing", "press"] },
  { id: "lanyards", label: "Satin Lanyard Rolls", keywords: ["lanyard", "satin", "roll", "ribbon"] },
  { id: "holders", label: "PVC Card Holders", keywords: ["holder", "pvc", "acrylic", "clear"] },
  { id: "rfid", label: "RFID & Smart Cards", keywords: ["rfid", "smart", "inlay", "prelam", "mifare"] },
  { id: "hooks", label: "Clips & Hooks", keywords: ["hook", "clip", "fitting", "clamp"] },
];

export default function ProductHeroShowcase({
  flagshipProducts,
  totalProductsCount,
  allProducts = [],
  settings,
}: ProductHeroShowcaseProps) {
  // Use allProducts if available to give maximum diversity across 186 items, otherwise flagshipProducts
  const pool = allProducts.length > 0 ? allProducts : flagshipProducts;

  const [selectedHeroCategory, setSelectedHeroCategory] = useState<string>("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const thumbScrollRef = useRef<HTMLDivElement>(null);

  // Rotating typography phrases for brand hero headline
  const ROTATING_PHRASES = useMemo(
    () => [
      "Factory Direct",
      "Specialist in PVC Cards",
      "Wholesale ID Systems",
      "Pan-India Dispatch",
    ],
    []
  );
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isPhraseVisible, setIsPhraseVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsPhraseVisible(false);
      setTimeout(() => {
        setPhraseIdx((prev) => (prev + 1) % ROTATING_PHRASES.length);
        setIsPhraseVisible(true);
      }, 300);
    }, 3200);

    return () => clearInterval(timer);
  }, [ROTATING_PHRASES]);

  // Filter pool by active hero category
  const activeProducts = useMemo(() => {
    if (selectedHeroCategory === "all") {
      // Pick a diverse set of up to 18 products
      return flagshipProducts.slice(0, 18);
    }

    const catDef = HERO_CATEGORIES.find((c) => c.id === selectedHeroCategory);
    if (!catDef || !catDef.keywords) return flagshipProducts.slice(0, 18);

    const matches = pool.filter((p) => {
      const text = `${p.name} ${p.category?.name || ""} ${p.category?.slug || ""}`.toLowerCase();
      return catDef.keywords.some((k) => text.includes(k));
    });

    return matches.length > 0 ? matches.slice(0, 18) : flagshipProducts.slice(0, 18);
  }, [selectedHeroCategory, flagshipProducts, pool]);

  // Reset active index when category tab changes
  useEffect(() => {
    setActiveIndex(0);
    setProgress(0);
  }, [selectedHeroCategory]);

  const activeProduct = activeProducts[activeIndex] || activeProducts[0];

  const imageUrl =
    activeProduct?.primary_image?.secure_url ||
    (activeProduct?.images && activeProduct.images.length > 0
      ? activeProduct.images[0].secure_url
      : null) ||
    "/placeholder-product.svg";

  const [heroImg, setHeroImg] = useState(imageUrl);

  useEffect(() => {
    setHeroImg(imageUrl);
  }, [imageUrl]);

  // Keep active thumbnail visible in scroll view
  useEffect(() => {
    if (!thumbScrollRef.current) return;
    const container = thumbScrollRef.current;
    const activeBtn = container.children[activeIndex] as HTMLElement;
    if (activeBtn) {
      const left = activeBtn.offsetLeft - container.offsetWidth / 2 + activeBtn.offsetWidth / 2;
      container.scrollTo({ left, behavior: "smooth" });
    }
  }, [activeIndex]);

  // Auto-rotation timer and animated progress bar (4.5 seconds per product)
  const ROTATE_INTERVAL_MS = 4500;
  const STEP_MS = 100;

  useEffect(() => {
    if (isPaused || activeProducts.length <= 1) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveIndex((idx) => (idx + 1) % activeProducts.length);
          return 0;
        }
        return prev + (STEP_MS / ROTATE_INTERVAL_MS) * 100;
      });
    }, STEP_MS);

    return () => clearInterval(timer);
  }, [isPaused, activeProducts.length]);

  if (!activeProduct) return null;

  return (
    <section className="relative bg-[#0D1E35] text-white overflow-hidden py-8 sm:py-12 lg:py-16 border-b-4 border-[#E87832]">
      {/* Ambient background glows & technical grid */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E87832]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#17365D]/50 rounded-full blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 relative z-10">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left Column: Industrial Proposition & Quotation */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6 w-full text-left">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md text-white shadow-xs transition-all">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-[11px] sm:text-xs font-black tracking-wide text-white uppercase">
                {settings?.hero_badge ? settings.hero_badge.split("•")[0]?.trim() || "The Print Planet™" : "The Print Planet™"}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#FFA868]">
                {settings?.hero_badge?.includes("•") ? settings.hero_badge.split("•")[1]?.trim() : "Specialist in PVC Cards & ID Systems"}
              </span>
            </div>

            {/* Main Primary SEO & Brand Heading with Typography Animation */}
            <h1 className="text-2xl sm:text-4xl lg:text-[2.65rem] font-black tracking-tight leading-[1.15] text-white">
              The Print Planet{" "}
              <span className="text-white/60 font-light">—</span>{" "}
              <span className="inline-block relative">
                <span
                  key={phraseIdx}
                  className={`inline-block font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A1A] via-[#E87832] to-[#FFA868] animate-gradient-text animate-orange-glow transition-all duration-300 transform ${
                    isPhraseVisible
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 -translate-y-2 scale-95"
                  }`}
                >
                  {settings?.hero_title && !settings.hero_title.includes("—") ? settings.hero_title : ROTATING_PHRASES[phraseIdx]}
                </span>
                <span className="block h-[3px] bg-gradient-to-r from-[#E87832] via-[#FF7A1A] to-[#FFA868] rounded-full mt-0.5 opacity-90 shadow-[0_0_8px_rgba(232,120,50,0.6)]" />
              </span>

              <span className="block text-lg sm:text-2xl lg:text-[1.55rem] font-extrabold text-slate-100 mt-2 sm:mt-2.5 leading-snug">
                {(() => {
                  const subText = settings?.hero_subtitle || settings?.tagline || "Specialist in PVC Cards, Lanyard Rolls & ID Machinery";
                  if (subText.includes("Specialist in PVC Cards")) {
                    const parts = subText.split("Specialist in PVC Cards");
                    return (
                      <>
                        {parts[0]}
                        <span className="text-[#FFA868] font-black underline decoration-[#E87832]/60 decoration-2 underline-offset-4">
                          Specialist in PVC Cards
                        </span>
                        {parts.slice(1).join("Specialist in PVC Cards")}
                      </>
                    );
                  }
                  if (subText.includes("PVC Cards")) {
                    const parts = subText.split("PVC Cards");
                    return (
                      <>
                        {parts[0]}
                        <span className="text-[#FFA868] font-black underline decoration-[#E87832]/60 decoration-2 underline-offset-4">
                          PVC Cards
                        </span>
                        {parts.slice(1).join("PVC Cards")}
                      </>
                    );
                  }
                  return subText;
                })()}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed max-w-xl">
              {settings?.hero_caption || (
                <>
                  Official portal of <strong>The Print Planet</strong> (theprintplanet.co.in) — recognized factory <strong>specialist in PVC cards</strong>, CR-80 fusing sheets, rigid ID card holders, satin lanyard rolls, RFID smart cards, and industrial card die-cutting machinery with 24–48h pan-India dispatch from Sunkadakatte, Bangalore.
                </>
              )}
            </p>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
              <a
                href="#catalogue-section"
                className="bg-gradient-to-r from-[#E87832] to-[#FF7A1A] hover:from-[#d66b28] hover:to-[#e66c15] text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-[0_6px_20px_rgba(232,120,50,0.35)] flex items-center justify-center gap-2 group text-center"
              >
                <span>Browse {totalProductsCount} Live Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <Link
                href="/quote"
                className="bg-white/10 hover:bg-white/15 text-white border border-white/25 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 text-center backdrop-blur-xs"
              >
                <FileText className="w-4 h-4 text-[#FFA868]" />
                <span>Instant Factory Quote</span>
              </Link>
            </div>

            {/* Technical Factory Standards Strip */}
            <div className="pt-3 sm:pt-4 border-t border-white/15 grid grid-cols-3 gap-2 sm:gap-3 text-xs">
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="font-extrabold text-white text-[11px] sm:text-xs">CR-80 ISO</span>
                </div>
                <div className="text-slate-300 text-[10px]">85.6 × 54 mm Standard</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <div className="flex items-center gap-1.5 text-[#FFA868] mb-0.5">
                  <Award className="w-3.5 h-3.5" />
                  <span className="font-extrabold text-white text-[11px] sm:text-xs">Optical Grade</span>
                </div>
                <div className="text-slate-300 text-[10px]">UV &amp; Scratch Proof</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <div className="flex items-center gap-1.5 text-cyan-400 mb-0.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span className="font-extrabold text-white text-[11px] sm:text-xs">Fast Dispatch</span>
                </div>
                <div className="text-slate-300 text-[10px]">24–48h Pan-India</div>
              </div>
            </div>
          </div>

          {/* Right Column: PRODUCT-FIRST HERO SHOWCASE STAGE */}
          <div
            className="lg:col-span-7 w-full"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="bg-gradient-to-b from-[#142C4B]/95 to-[#0F223A]/95 backdrop-blur-xl border border-white/20 rounded-2xl p-3.5 sm:p-5 lg:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden ring-1 ring-white/10">
              {/* Dynamic Auto-Rotation Progress Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#E87832] to-[#FFA868] transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Category Filter Pills (Switch Between Machines, Lanyards, Holders, RFID, Clips) */}
              <div className="pt-1 pb-3 flex items-center gap-1.5 overflow-x-auto scrollbar-none snap-x">
                {HERO_CATEGORIES.map((cat) => {
                  const isCatSelected = selectedHeroCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedHeroCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer snap-start ${
                        isCatSelected
                          ? "bg-[#E87832] text-white shadow-xs"
                          : "bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white border border-white/10"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Spotlight Header */}
              <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/10 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#FFA868] flex items-center gap-1.5 bg-[#E87832]/15 border border-[#E87832]/30 px-2 py-0.5 rounded-md">
                    <Sparkles className="w-3 h-3 text-[#FFA868]" />
                    <span>Auto-Rotating Spotlight</span>
                  </span>
                  <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                  <span className="text-[11px] sm:text-xs text-slate-200 font-medium truncate max-w-[120px] sm:max-w-[180px]">
                    {activeProduct.category?.name}
                  </span>
                </div>

                {/* Carousel Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setProgress(0);
                      setActiveIndex(
                        (prev) => (prev - 1 + activeProducts.length) % activeProducts.length
                      );
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 cursor-pointer"
                    aria-label="Previous product"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-200 px-1">
                    {activeIndex + 1}/{activeProducts.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setProgress(0);
                      setActiveIndex((prev) => (prev + 1) % activeProducts.length);
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 cursor-pointer"
                    aria-label="Next product"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Product Showcase Block: Split Image + Details */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-5 py-3 sm:py-4 items-center">
                {/* Product Image Stage */}
                <div className="sm:col-span-5 relative">
                  <Link
                    href={`/products/${activeProduct.slug}`}
                    className="block aspect-square max-h-48 sm:max-h-none w-44 sm:w-full mx-auto bg-gradient-to-b from-white to-slate-50 rounded-2xl p-3 sm:p-4 overflow-hidden border border-white/30 shadow-lg group relative"
                  >
                    <img
                      src={heroImg}
                      alt={activeProduct.name}
                      onError={() => setHeroImg("/placeholder-product.svg")}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-[#17365D] text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
                      Factory Direct
                    </div>
                    <div className="absolute bottom-2 right-2 bg-slate-900/90 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {activeProduct.sku}
                    </div>
                  </Link>
                </div>

                {/* Product Information & Live Pricing */}
                <div className="sm:col-span-7 space-y-2.5 sm:space-y-3">
                  <div>
                    <h3 className="text-sm sm:text-lg font-bold text-white leading-snug hover:text-[#FFA868] transition-colors line-clamp-2">
                      <Link href={`/products/${activeProduct.slug}`}>
                        {activeProduct.name}
                      </Link>
                    </h3>
                  </div>

                  {/* Specifications Pills */}
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 text-xs">
                    {activeProduct.material && (
                      <span className="bg-white/10 text-slate-200 px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-medium border border-white/10 truncate max-w-full">
                        {activeProduct.material}
                      </span>
                    )}
                    {activeProduct.dimensions && (
                      <span className="bg-white/10 text-slate-200 px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-medium border border-white/10 truncate max-w-full">
                        {activeProduct.dimensions}
                      </span>
                    )}
                    {activeProduct.color && (
                      <span className="bg-white/10 text-slate-200 px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-medium border border-white/10 truncate max-w-full">
                        {activeProduct.color}
                      </span>
                    )}
                  </div>

                  {/* Pricing Box */}
                  <div className="bg-white/10 border border-white/15 rounded-xl p-2.5 sm:p-3 flex items-baseline justify-between backdrop-blur-xs">
                    <div>
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-300 block">
                        Wholesale Factory Rate
                      </span>
                      <span className="text-base sm:text-xl font-black text-[#FFA868]">
                        {activeProduct.price_display ||
                          (activeProduct.price
                            ? `₹ ${Number(activeProduct.price).toLocaleString("en-IN")}`
                            : "Trade Quote on Request")}
                      </span>
                    </div>

                    {activeProduct.minimum_order_quantity && (
                      <span className="text-[10px] sm:text-xs text-slate-200 font-semibold bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                        MOQ: {activeProduct.minimum_order_quantity} Units
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="flex-1 bg-gradient-to-r from-[#E87832] to-[#FF7A1A] hover:from-[#d66b28] hover:to-[#e66c15] text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-bold text-xs transition-all shadow-[0_4px_14px_rgba(232,120,50,0.4)] text-center cursor-pointer"
                    >
                      Request Batch Quotation
                    </button>
                    <Link
                      href={`/products/${activeProduct.slug}`}
                      className="bg-white/10 hover:bg-white/20 text-white py-2 sm:py-2.5 px-3 rounded-xl font-semibold text-xs transition-colors border border-white/20 text-center"
                    >
                      Specs &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              {/* Thumbnails Row: Dynamic Horizontal Carousel with Active Ring */}
              <div className="pt-2.5 sm:pt-3 border-t border-white/10">
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Factory Product Lineup ({activeProducts.length} Items):</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {isPaused ? "Paused on hover" : "Auto-rotating every 4.5s"}
                  </span>
                </div>
                <div
                  ref={thumbScrollRef}
                  className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x touch-pan-x"
                >
                  {activeProducts.map((prod, idx) => {
                    const thumbImg =
                      prod.primary_image?.secure_url ||
                      (prod.images && prod.images.length > 0
                        ? prod.images[0].secure_url
                        : "/placeholder-product.svg");
                    const isSelected = idx === activeIndex;

                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => {
                          setProgress(0);
                          setActiveIndex(idx);
                        }}
                        className={`p-1.5 rounded-xl border transition-all text-left flex flex-col items-center shrink-0 w-20 sm:w-24 snap-start cursor-pointer ${
                          isSelected
                            ? "bg-white text-[#17365D] border-[#E87832] shadow-md ring-2 ring-[#E87832]"
                            : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/15"
                        }`}
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg p-1 overflow-hidden shrink-0 mb-1 border border-slate-100">
                          <img
                            src={thumbImg}
                            alt={prod.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[8.5px] sm:text-[9.5px] font-bold truncate max-w-full leading-tight text-center">
                          {prod.sku.replace("LAN-", "").replace("MCH-", "").replace("HLD-", "").replace("CRD-", "")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RFQ Enquiry Modal */}
      {modalOpen && (
        <EnquiryModal
          product={activeProduct}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </section>
  );
}
