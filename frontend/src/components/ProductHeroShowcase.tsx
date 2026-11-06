"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Check } from "lucide-react";
import { Product, SiteSettings } from "@/lib/types";
import { formatCategoryName, formatProductName, getProductImageUrl } from "@/lib/formatters";
import { useCart } from "@/lib/cart";
import TextReveal from "./animations/TextReveal";
import { ColorBar, CropMarks } from "./animations/PrintMarks";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { heroCopy, heroHeadlineClass } from "@/lib/hero";

interface ProductHeroShowcaseProps {
  flagshipProducts: Product[];
  totalProductsCount: number;
  allProducts?: Product[];
  settings?: SiteSettings;
}

const HERO_CATEGORIES = [
  { id: "all", label: "Flagships" },
  { id: "machines", label: "Machines", keywords: ["machine", "cutter", "fusing", "press"] },
  { id: "lanyards", label: "Lanyard rolls", keywords: ["lanyard", "satin", "roll", "ribbon"] },
  { id: "holders", label: "Card holders", keywords: ["holder", "pvc", "acrylic", "clear"] },
  { id: "rfid", label: "RFID cards", keywords: ["rfid", "smart", "inlay", "prelam", "mifare"] },
  { id: "hooks", label: "Hooks & clips", keywords: ["hook", "clip", "fitting", "clamp"] },
];

const ROTATE_SECONDS = 5;

const DEFAULT_FLAGSHIP: Product = {
  id: 0,
  name: "CR-80 Premium PVC Cards & Sheets",
  slug: "cr80-premium-pvc-card-sheets",
  sku: "PP-PVC-CR80",
  category: {
    id: 0,
    name: "PVC Cards",
    slug: "pvc-cards",
    description: "Premium PVC Cards and Sheets",
    is_active: true,
    display_order: 0,
    products_count: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  description: "Factory direct CR-80 cards and fusing sheets.",
  specifications: {},
  material: "Super-white virgin PVC",
  price_display: "Wholesale direct",
  price: "18.50",
  currency: "INR",
  price_visibility: true,
  is_featured: true,
  display_order: 0,
  minimum_order_quantity: 100,
  is_active: true,
  verification_status: "verified",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  images: [
    {
      id: 0,
      cloudinary_public_id: "placeholder",
      secure_url: "/placeholder-product.svg",
      alt_text: "CR-80 Premium PVC Cards & Sheets",
      display_order: 0,
      is_primary: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

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
  const [heroAdded, setHeroAdded] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const thumbScrollRef = useRef<HTMLDivElement>(null);
  const stageImageRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef<gsap.core.Tween | null>(null);

  // All hero text comes from Owner Settings, with short defaults if a field is empty.
  const copy = heroCopy(settings);

  // Entrance: words stagger upward with spring easing, items fade in smoothly.
  useGSAP(
    () => {
      gsap.set("[data-hero]", { opacity: 1 });
      if (prefersReducedMotion()) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      const words = heroRef.current?.querySelectorAll("[data-word]");
      if (words && words.length > 0) {
        tl.fromTo(
          words,
          { yPercent: 125, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.045,
            ease: "back.out(1.5)",
          },
          0
        );
      }

      const items = heroRef.current?.querySelectorAll("[data-hero-item]");
      if (items && items.length > 0) {
        tl.fromTo(
          items,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.08, ease: "power3.out" },
          0.2
        );
      }

      const swatches = heroRef.current?.querySelectorAll("[data-swatch]");
      if (swatches && swatches.length > 0) {
        tl.fromTo(
          swatches,
          { scaleY: 0, transformOrigin: "50% 100%" },
          { scaleY: 1, duration: 0.45, stagger: 0.05, ease: "power2.out" },
          0.25
        );
      }

      const stage = heroRef.current?.querySelector("[data-hero-stage]");
      if (stage) {
        tl.fromTo(
          stage,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.85, ease: "power3.out" },
          0.15
        );
      }

      const crops = heroRef.current?.querySelectorAll("[data-crop]");
      if (crops && crops.length > 0) {
        tl.fromTo(
          crops,
          { autoAlpha: 0, scale: 1.6 },
          { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.06, ease: "back.out(2)" },
          0.7
        );
      }

      // The proof sheet drifts up slightly against the page as the hero scrolls away.
      const sheet = heroRef.current?.querySelector("[data-hero-sheet]");
      if (sheet) {
        gsap.to(sheet, {
          y: -36,
          ease: "none",
          scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true },
        });
      }

      // Subtle parallax drift for the precision background dots
      const dots = heroRef.current?.querySelector("[data-hero-dots]");
      if (dots) {
        gsap.to(dots, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true },
        });
      }
    },
    { scope: heroRef }
  );

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
  }, [selectedHeroCategory]);

  const activeProduct = activeProducts[activeIndex] || activeProducts[0] || DEFAULT_FLAGSHIP;

  const primaryUrl = getProductImageUrl(activeProduct);

  const [currentHeroImg, setCurrentHeroImg] = useState<string>(primaryUrl);

  useEffect(() => {
    setCurrentHeroImg(primaryUrl);
  }, [primaryUrl]);

  const handleHeroAdd = () => {
    if (!activeProduct) return;
    addItem(activeProduct, activeProduct.minimum_order_quantity || 1);
    setHeroAdded(true);
    setTimeout(() => setHeroAdded(false), 1500);
  };

  // Auto-rotation: the progress bar tween is the timer, so hover pauses both together.
  useGSAP(
    () => {
      gsap.set(progressBarRef.current, { scaleX: 0 });
      if (activeProducts.length <= 1 || prefersReducedMotion()) return;

      rotationRef.current = gsap.to(progressBarRef.current, {
        scaleX: 1,
        duration: ROTATE_SECONDS,
        ease: "none",
        paused: isPaused,
        onComplete: () => setActiveIndex((idx) => (idx + 1) % activeProducts.length),
      });
    },
    { dependencies: [activeIndex, activeProducts.length, selectedHeroCategory], scope: heroRef, revertOnUpdate: true }
  );

  useEffect(() => {
    rotationRef.current?.paused(isPaused);
  }, [isPaused]);

  // Slide change, skipping the first render so it doesn't fight the entrance timeline.
  const activeProductId = activeProduct?.id;
  const firstSlide = useRef(true);
  useGSAP(
    () => {
      if (firstSlide.current) {
        firstSlide.current = false;
        return;
      }
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        stageImageRef.current,
        { autoAlpha: 0, xPercent: 5, scale: 0.97 },
        { autoAlpha: 1, xPercent: 0, scale: 1, duration: 0.55, ease: "power3.out", clearProps: "transform" }
      );
    },
    { dependencies: [activeProductId], scope: heroRef }
  );

  // Keep the active thumbnail visible by scrolling the strip only, never the page.
  useEffect(() => {
    const strip = thumbScrollRef.current;
    const thumb = strip?.children[activeIndex] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    strip.scrollTo({ left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2, behavior: "smooth" });
  }, [activeIndex]);

  return (
    <section
      ref={heroRef}
      data-no-reveal
      className="relative bg-[#0E2238] text-white overflow-hidden border-b border-white/10"
    >
      <div data-hero-dots aria-hidden="true" className="page-hero-dots absolute inset-0 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6">
            <div data-hero data-hero-item className="flex items-center gap-3 mb-5">
              <ColorBar />
              <span className="font-mono text-xs text-slate-300">{copy.badge}</span>
            </div>

            <p data-hero data-hero-headline className={`${heroHeadlineClass(copy)} font-hero font-extrabold tracking-[-0.025em] leading-[1.08] text-white`}>
              <TextReveal text={copy.title} />
              <span className="block text-[#FF8A3D] font-hero mt-1 sm:mt-1.5 font-extrabold tracking-[-0.02em]">
                <TextReveal text={copy.subtitle} />
              </span>
            </p>

            <h1 data-hero data-hero-item className="mt-4 text-sm sm:text-base font-semibold text-white">
              The Print Planet: PVC cards, lanyards and ID card machines, Bengaluru
            </h1>

            <p data-hero data-hero-item className="mt-2 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              {copy.caption}
            </p>

            <div data-hero data-hero-item className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mt-7">
              <Link
                href="/products"
                data-magnetic
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#0E2238] font-bold text-sm transition-colors group"
              >
                <span>Browse {totalProductsCount}+ products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center gap-2 py-2 text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-[#F26B1D] transition-colors"
              >
                Request a custom quote
              </Link>
            </div>
          </div>

          {activeProduct && (
            <div
              data-hero
              data-hero-stage
              className="lg:col-span-6 w-full min-w-0"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onFocusCapture={() => setIsPaused(true)}
              onBlurCapture={() => setIsPaused(false)}
            >
              <div className="flex gap-5 overflow-x-auto scrollbar-none border-b border-white/15 mb-6">
                {HERO_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    aria-pressed={selectedHeroCategory === cat.id}
                    onClick={() => setSelectedHeroCategory(cat.id)}
                    className={`pb-2.5 -mb-px text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors ${
                      selectedHeroCategory === cat.id
                        ? "text-white border-[#B9C3CF]"
                        : "text-slate-400 hover:text-white border-transparent"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div data-hero-sheet className="relative mx-3">
                <CropMarks />
                <div className="relative bg-[#FFFFFF] text-[#121418]">
                  <div className="relative aspect-[16/10] w-full overflow-hidden p-5 flex items-center justify-center">
                    <div ref={stageImageRef} className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={currentHeroImg}
                        alt={formatProductName(activeProduct.name)}
                        onError={() => setCurrentHeroImg("/placeholder-product.svg")}
                        className="w-full h-full object-contain"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#DFE6EE]">
                      <div ref={progressBarRef} className="h-full w-full bg-[#F26B1D] origin-left" style={{ transform: "scaleX(0)" }} />
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-mono text-[11px] text-[#353C45] truncate">
                          {activeProduct.sku}
                        </p>
                        <h2 className="text-base sm:text-lg font-bold text-[#121418] leading-snug line-clamp-1 mt-0.5">
                          {formatProductName(activeProduct.name)}
                        </h2>
                        <p className="text-xs text-[#353C45] line-clamp-1 mt-0.5">
                          {activeProduct.material ? `${activeProduct.material} · ` : ""}
                          {formatCategoryName(activeProduct.category?.name || "Wholesale")}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-heading text-base sm:text-lg font-bold text-[#121418] tabular-nums whitespace-nowrap">
                          {activeProduct.price_display ||
                            (activeProduct.price
                              ? `₹${Number(activeProduct.price).toLocaleString("en-IN")}`
                              : "On request")}
                        </div>
                        {activeProduct.minimum_order_quantity ? (
                          <div className="font-mono text-[11px] text-[#353C45]">
                            MOQ {activeProduct.minimum_order_quantity}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button
                        type="button"
                        onClick={handleHeroAdd}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-md text-white font-bold text-[13px] transition-colors ${
                          heroAdded ? "bg-[#217A4B]" : "bg-[#F26B1D] hover:bg-[#FF8A3D]"
                        }`}
                      >
                        {heroAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                        <span>{heroAdded ? "Added" : "Add to order"}</span>
                      </button>
                      <Link
                        href={`/products/${activeProduct.slug}`}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-md border border-[#121418] text-[#121418] hover:bg-[#121418] hover:text-white font-semibold text-[13px] transition-colors"
                      >
                        View specifications
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div ref={thumbScrollRef} className="flex gap-2 overflow-x-auto mt-6 mx-3 pb-1 scrollbar-none">
                {activeProducts.map((p, idx) => {
                  const isSelected = idx === activeIndex;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-label={`Show ${formatProductName(p.name)}`}
                      aria-current={isSelected}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative w-12 h-12 shrink-0 bg-[#FFFFFF] overflow-hidden transition-opacity ${
                        isSelected ? "outline-2 outline-offset-2 outline-[#B9C3CF]" : "opacity-55 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={getProductImageUrl(p)}
                        alt={formatProductName(p.name)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-product.svg";
                        }}
                        className="w-full h-full object-contain p-1"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
