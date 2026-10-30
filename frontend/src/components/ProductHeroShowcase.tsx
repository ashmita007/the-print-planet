"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Truck,
  Award,
  FileText,
  RotateCw,
} from "lucide-react";
import { Product, SiteSettings } from "@/lib/types";
import { formatCategoryName, formatProductName } from "@/lib/formatters";
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
  const ROTATING_PHRASES = useMemo(() => {
    const defaultPhrases = [
      "Specialist in PVC Cards",
      "Factory Direct",
      "Lens Packaging & Cleaning",
      "Commercial Printing",
      "Bulk ID & Card Solutions",
    ];

    if (!settings?.hero_title) return defaultPhrases;

    let clean = settings.hero_title.trim();
    if (clean.toLowerCase().startsWith("the print planet")) {
      clean = clean.replace(/^the print planet\s*[-–—]?\s*/i, "").trim();
    }

    if (!clean || clean === "Factory Direct") {
      return defaultPhrases;
    }

    // If owner set custom comma or pipe separated items in backend
    if (clean.includes(",") || clean.includes("|")) {
      const parts = clean
        .split(/[,|]/)
        .map((p) => p.trim())
        .filter(Boolean);
      return parts.length > 0 ? parts : defaultPhrases;
    }

    // If owner set a custom title in backend, place it at the front of the animation rotation!
    const customList = [clean, ...defaultPhrases.filter((p) => p.toLowerCase() !== clean.toLowerCase())];
    return customList;
  }, [settings]);

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
    <section className="relative bg-[#0D1E35] text-white overflow-hidden py-10 sm:py-14 lg:py-16 border-b border-white/10">
      {/* Quiet atmospheric depth */}
      <div className="absolute -top-40 right-0 w-[36rem] h-[36rem] bg-[#E87832]/[0.07] rounded-full blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 relative z-10">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left Column: Industrial Proposition & Quotation */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6 w-full text-left">
            {/* Brand eyebrow pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] sm:text-xs font-bold tracking-wide uppercase text-[#FFA868] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E87832] animate-pulse" />
              <span>{settings?.hero_badge?.trim() || "The Print Planet • Specialist in PVC Cards & ID Systems"}</span>
            </div>

            <div className="space-y-2 sm:space-y-2.5">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight leading-[1.12] text-white">
                The Print Planet{" "}
                <span className="text-white/40 font-light">—</span>{" "}
                <span className="inline-block text-[#FFA868]">
                  <span
                    key={phraseIdx}
                    className={`inline-block font-black transition-all duration-300 ${
                      isPhraseVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-1"
                    }`}
                  >
                    {ROTATING_PHRASES[phraseIdx % ROTATING_PHRASES.length]}
                  </span>
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-100 leading-snug tracking-tight">
                {settings?.hero_subtitle ||
                  settings?.tagline ||
                  "Specialist in PVC cards, lens packaging & commercial printing solutions"}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed max-w-xl">
              {settings?.hero_caption || (
                <>
                  Official portal of <strong className="text-white font-semibold">The Print Planet</strong> — a factory specialist in PVC cards, CR-80 fusing sheets, lens packaging, rigid ID card holders, satin lanyard rolls, commercial printing, and card die-cutting machinery. 24–48h pan-India dispatch from Bangalore.
                </>
              )}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <a
                href="#catalogue-section"
                className="bg-[#E87832] hover:bg-[#d66b28] text-white px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm tracking-wide transition-all active:scale-[0.99] flex items-center justify-center gap-2 group text-center"
              >
                <span>Browse {totalProductsCount} products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <Link
                href="/quote"
                className="text-slate-200 hover:text-white border border-white/15 hover:border-white/30 hover:bg-white/5 px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 text-center"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Request a quote</span>
              </Link>
            </div>

            {/* Standards */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 border-t border-white/10 text-[10px] sm:text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                CR-80 ISO 85.6 × 54 mm
              </span>
              <span className="hidden sm:block w-px h-3 bg-white/10" />
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-500" />
                Optical grade, UV &amp; scratch proof
              </span>
              <span className="hidden sm:block w-px h-3 bg-white/10" />
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-500" />
                24–48h pan-India
              </span>
            </div>
          </div>

          {/* Right Column: PRODUCT-FIRST HERO SHOWCASE STAGE */}
          <div
            className="lg:col-span-7 w-full"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="bg-[#0F223A]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 sm:p-5 lg:p-6 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#E87832]/80 transition-all duration-100 ease-linear"
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
                          ? "bg-white text-[#0F223A]"
                          : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-100"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Spotlight Header */}
              <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/10 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
                    Spotlight
                  </span>
                  <span className="text-slate-600 text-xs">/</span>
                  <span className="text-[11px] sm:text-xs text-slate-300 font-medium truncate max-w-[140px] sm:max-w-[200px]">
                    {formatCategoryName(activeProduct.category?.name)}
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
                    className="block aspect-square max-h-48 sm:max-h-none w-44 sm:w-full mx-auto bg-white rounded-xl p-4 sm:p-5 overflow-hidden group relative"
                  >
                    <img
                      src={heroImg}
                      alt={formatProductName(activeProduct.name)}
                      onError={() => setHeroImg("/placeholder-product.svg")}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1.5 right-2 text-[9px] font-medium tabular-nums text-slate-400">
                      {activeProduct.sku}
                    </div>
                  </Link>
                </div>

                {/* Product Information & Live Pricing */}
                <div className="sm:col-span-7 space-y-2.5 sm:space-y-3">
                  <div>
                    <h3 className="text-sm sm:text-lg font-bold text-white leading-snug hover:text-[#FFA868] transition-colors line-clamp-2">
                      <Link href={`/products/${activeProduct.slug}`}>
                        {formatProductName(activeProduct.name)}
                      </Link>
                    </h3>
                  </div>

                  {/* Specifications */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-[11px] text-slate-400">
                    {[activeProduct.material, activeProduct.dimensions, activeProduct.color]
                      .filter(Boolean)
                      .map((spec, index) => (
                        <span key={index} className="flex items-center gap-2">
                          {index > 0 && <span className="text-slate-600">•</span>}
                          <span className="truncate max-w-[14rem]">{spec}</span>
                        </span>
                      ))}
                  </div>

                  {/* Pricing */}
                  <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.12em] font-medium text-slate-500 block">
                        Wholesale rate
                      </span>
                      <span className="text-base sm:text-xl font-semibold text-[#F0A46B] tabular-nums">
                        {activeProduct.price_display ||
                          (activeProduct.price
                            ? `₹ ${Number(activeProduct.price).toLocaleString("en-IN")}`
                            : "Trade Quote on Request")}
                      </span>
                    </div>

                    {activeProduct.minimum_order_quantity && (
                      <span className="text-[10px] sm:text-[11px] text-slate-400 tabular-nums">
                        MOQ {activeProduct.minimum_order_quantity}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="flex-1 bg-[#E87832] hover:bg-[#d66b28] text-white py-2.5 px-3 sm:px-4 rounded-lg font-semibold text-xs transition-all active:scale-[0.99] text-center cursor-pointer"
                    >
                      Request batch quote
                    </button>
                    <Link
                      href={`/products/${activeProduct.slug}`}
                      className="bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 py-2.5 px-3.5 rounded-lg font-medium text-xs transition-colors border border-white/10 text-center"
                    >
                      Specs
                    </Link>
                  </div>
                </div>
              </div>

              {/* Thumbnails Row: Dynamic Horizontal Carousel with Active Ring */}
              <div className="pt-2.5 sm:pt-3 border-t border-white/10">
                <div className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.14em] mb-2 flex items-center justify-between">
                  <span>Product lineup</span>
                  <span className="tabular-nums normal-case tracking-normal">{activeProducts.length}</span>
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
                            alt={formatProductName(prod.name)}
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
