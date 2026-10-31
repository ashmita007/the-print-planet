"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Truck,
  Award,
  FileText,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Product, SiteSettings } from "@/lib/types";
import { formatCategoryName, formatProductName } from "@/lib/formatters";
import { useCart } from "@/lib/cart";
import EnquiryModal from "./EnquiryModal";
import AnimeLogoHeroEffect from "./AnimeLogoHeroEffect";
import TextReveal from "./animations/TextReveal";
import KineticHighlight from "./animations/KineticHighlight";

interface ProductHeroShowcaseProps {
  flagshipProducts: Product[];
  totalProductsCount: number;
  allProducts?: Product[];
  settings?: SiteSettings;
}

// Hero category filter tabs
const HERO_CATEGORIES = [
  { id: "all", label: "★ All Flagships" },
  { id: "lanyards", label: "Satin Lanyards", keywords: ["lanyard", "satin", "roll", "ribbon"] },
  { id: "cards", label: "PVC & Smart Cards", keywords: ["card", "rfid", "smart", "inlay", "pvc"] },
  { id: "holders", label: "ID Card Holders", keywords: ["holder", "acrylic", "clear"] },
  { id: "machines", label: "Card Machinery", keywords: ["machine", "cutter", "fusing", "puncher"] },
  { id: "corporate", label: "Clips & Fittings", keywords: ["hook", "clip", "fitting", "clamp"] },
];

export default function ProductHeroShowcase({
  flagshipProducts,
  totalProductsCount,
  allProducts = [],
  settings,
}: ProductHeroShowcaseProps) {
  const { addItem } = useCart();
  const pool = allProducts.length > 0 ? allProducts : flagshipProducts;

  const [selectedHeroCategory, setSelectedHeroCategory] = useState<string>("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const thumbScrollRef = useRef<HTMLDivElement>(null);

  // Rotating headline phrases
  const ROTATING_PHRASES = [
    "Specialist in PVC Cards & ID Systems",
    "Custom Lanyards & Sublimation Rolls",
    "High-Speed Card Production Machinery",
    "Corporate Gifting & Brand Merchandise",
    "Lens Packaging & Commercial Printing",
  ];

  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % ROTATING_PHRASES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [ROTATING_PHRASES.length]);

  // Filter pool by active hero category
  const activeProducts = useMemo(() => {
    if (selectedHeroCategory === "all") {
      return flagshipProducts.slice(0, 14);
    }

    const catDef = HERO_CATEGORIES.find((c) => c.id === selectedHeroCategory);
    if (!catDef || !catDef.keywords) return flagshipProducts.slice(0, 14);

    const matches = pool.filter((p) => {
      const text = `${p.name} ${p.category?.name || ""} ${p.category?.slug || ""}`.toLowerCase();
      return catDef.keywords.some((k) => text.includes(k));
    });

    return matches.length > 0 ? matches.slice(0, 14) : flagshipProducts.slice(0, 14);
  }, [selectedHeroCategory, flagshipProducts, pool]);

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

  // Auto-rotation progress
  const ROTATE_INTERVAL_MS = 5000;
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
    <section className="relative bg-[#0A1128] text-white overflow-hidden py-10 sm:py-16 lg:py-20 border-b border-slate-800">
      {/* Precision atmospheric grid & lighting */}
      <div className="absolute top-0 right-1/4 w-[42rem] h-[42rem] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* Anime.js SVG Registration Animation */}
      <AnimeLogoHeroEffect />
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline, Value Proposition & Actions */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-950/80 border border-blue-500/30 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold text-blue-300">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>THE PRINT PLANET • Factory Direct Solutions</span>
            </div>

            {/* Main Headline with Split Word Animation & Highlight */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-[3.25rem] font-display font-black tracking-tight leading-[1.08] text-white">
                <TextReveal
                  text="Precision Custom Printing &"
                  delay={0.1}
                  staggerDelay={0.05}
                />
                <span className="block mt-1">
                  <KineticHighlight>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-blue-500 animate-gradient-text">
                      Enterprise Merchandise
                    </span>
                  </KineticHighlight>
                </span>
              </h1>

              <div className="h-7 sm:h-8 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={phraseIdx}
                    initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="text-xs sm:text-sm font-semibold font-mono text-blue-300 tracking-wide flex items-center gap-1.5"
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                    <span>✦ {ROTATING_PHRASES[phraseIdx]}</span>
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              India&apos;s premier specialist in PVC identification cards, satin lanyard rolls, card manufacturing machinery, custom corporate gifting, and promotional branding. Direct factory wholesale dispatch from Bangalore with 24–48h express turnaround.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all text-center group"
              >
                <span>Explore Full Catalogue ({totalProductsCount}+)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/quote"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm transition-all text-center"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Request Custom Quote</span>
              </Link>
            </div>

            {/* Key Trust Signals */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 text-[11px] sm:text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-white text-base sm:text-lg">180+</div>
                <div className="text-slate-400">Products &amp; Machines</div>
              </div>
              <div className="space-y-0.5 border-x border-slate-800 px-3">
                <div className="font-bold text-white text-base sm:text-lg">50,000+</div>
                <div className="text-slate-400">Daily Production Capacity</div>
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-white text-base sm:text-lg">100%</div>
                <div className="text-slate-400">PAN-India Dispatch</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Featured Product Showcase Card */}
          <div
            className="lg:col-span-6 w-full"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Category tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
              {HERO_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedHeroCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedHeroCategory === cat.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Showcase Stage */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
              {/* Product Badge & SKU */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 border border-blue-800/50 px-2 py-0.5 rounded">
                  {formatCategoryName(activeProduct.category?.name || "Featured Product")}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  SKU: {activeProduct.sku}
                </span>
              </div>

              {/* Product Image Stage */}
              <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-xl bg-white/95 overflow-hidden p-4 mb-4 flex items-center justify-center border border-slate-200">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProduct.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full flex items-center justify-center"
                  >
                    <Image
                      src={imageUrl}
                      alt={activeProduct.name}
                      fill
                      className="object-contain p-2"
                      priority
                      sizes="(max-width: 1024px) 100vw, 550px"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Progress bar for auto-rotation */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-200">
                  <div
                    className="h-full bg-blue-600 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Product Info & Quick Actions */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                      {formatProductName(activeProduct.name)}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {activeProduct.material ? `${activeProduct.material} • ` : ""}
                      {activeProduct.minimum_order_quantity
                        ? `MOQ: ${activeProduct.minimum_order_quantity} Units`
                        : "Wholesale batch available"}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    {activeProduct.price_display ? (
                      <div className="text-base sm:text-lg font-bold text-white">
                        {activeProduct.price_display}
                      </div>
                    ) : activeProduct.price ? (
                      <div className="text-base sm:text-lg font-bold text-white">
                        ₹{Number(activeProduct.price).toLocaleString("en-IN")}
                      </div>
                    ) : (
                      <div className="text-xs font-semibold text-blue-400">
                        Wholesale Rate
                      </div>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => addItem(activeProduct, activeProduct.minimum_order_quantity || 1)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Order / RFQ</span>
                  </button>

                  <Link
                    href={`/products/${activeProduct.slug}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-colors"
                  >
                    <span>View Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Thumbnail Strip for Carousel navigation */}
              <div
                ref={thumbScrollRef}
                className="flex gap-2 overflow-x-auto mt-4 pt-3 border-t border-slate-800/80 pb-1 scrollbar-none"
              >
                {activeProducts.map((p, idx) => {
                  const thumb =
                    p.primary_image?.secure_url ||
                    (p.images && p.images.length > 0 ? p.images[0].secure_url : "/placeholder-product.svg");
                  const isSelected = idx === activeIndex;

                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveIndex(idx);
                        setProgress(0);
                      }}
                      className={`relative w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border transition-all ${
                        isSelected
                          ? "border-blue-500 ring-2 ring-blue-500/30 scale-105"
                          : "border-slate-700 opacity-60 hover:opacity-100"
                      }`}
                      title={p.name}
                    >
                      <Image
                        src={thumb}
                        alt={p.name}
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <EnquiryModal
        product={activeProduct}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}
