"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { gsap, PRINT_EASE, prefersReducedMotion } from "@/lib/gsap";

export type ShowcaseSlide = {
  slug: string;
  title: string;
  blurb: string;
  ink: string;
  onInk: string;
  image: string;
  count: number;
  products: { name: string; slug: string }[];
};

/**
 * One product family at a time, each in its own palette shade. Changing slide sweeps the
 * next colour across the section as a circle from the control that was pressed.
 */
export default function CategoryShowcaseClient({ slides }: { slides: ShowcaseSlide[] }) {
  const [index, setIndex] = useState(0);
  const busy = useRef(false);
  const rootRef = useRef<HTMLElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const slide = slides[index];
  const total = slides.length;

  const goTo = useCallback(
    (next: number, from?: HTMLElement | null) => {
      const target = (next + total) % total;
      if (busy.current || target === index) return;

      if (prefersReducedMotion() || !rootRef.current || !wipeRef.current) {
        setIndex(target);
        return;
      }
      busy.current = true;

      // The circle starts at the pressed control, or the section centre for keys.
      const box = rootRef.current.getBoundingClientRect();
      const origin = from?.getBoundingClientRect();
      const x = origin ? origin.left + origin.width / 2 - box.left : box.width / 2;
      const y = origin ? origin.top + origin.height / 2 - box.top : box.height / 2;

      const wipe = wipeRef.current;
      wipe.style.background = slides[target].ink;

      gsap
        .timeline({
          onComplete: () => {
            busy.current = false;
          },
        })
        .to([contentRef.current, imageRef.current], { autoAlpha: 0, y: -24, duration: 0.3, ease: "power2.in", stagger: 0.04 })
        .fromTo(
          wipe,
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${Math.hypot(box.width, box.height)}px at ${x}px ${y}px)`, duration: 0.8, ease: PRINT_EASE },
          0.1
        )
        .add(() => {
          setIndex(target);
          gsap.set(wipe, { clipPath: "circle(0px at 50% 50%)" });
        })
        .fromTo(contentRef.current, { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: PRINT_EASE })
        .fromTo(
          imageRef.current,
          { autoAlpha: 0, y: 40, rotation: -4, scale: 0.94 },
          { autoAlpha: 1, y: 0, rotation: 0, scale: 1, duration: 0.9, ease: PRINT_EASE },
          "<0.08"
        );
    },
    [index, slides, total]
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") goTo(index + 1);
    if (event.key === "ArrowLeft") goTo(index - 1);
  };

  const dark = slide.onInk === "#FFFFFF";
  const muted = dark ? "text-white" : "text-[#22272E]";
  const rule = dark ? "border-white/25" : "border-[#22272E]/20";

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label="Shop by product family"
      onKeyDown={onKeyDown}
      className="relative overflow-hidden mt-12 sm:mt-16 transition-colors"
      style={{ background: slide.ink, color: slide.onInk }}
    >
      <div ref={wipeRef} aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none" style={{ clipPath: "circle(0px at 50% 50%)" }} />

      <div data-no-reveal className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid lg:grid-cols-12 gap-10 items-center">
        <div
          ref={contentRef}
          className="lg:col-span-6"
          aria-live="polite"
          aria-atomic="true"
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${total}: ${slide.title}`}
        >
          <p className="eyebrow flex items-center gap-3">
            <span className="tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <span className={`h-px w-10 ${dark ? "bg-white/50" : "bg-[#22272E]/40"}`} aria-hidden="true" />
            <span>{slide.count} products</span>
          </p>
          <h2 className="display-xl mt-4" data-split-skip>{slide.title}</h2>
          <p className={`mt-5 text-[15px] sm:text-base leading-relaxed max-w-md ${muted}`}>{slide.blurb}</p>

          {slide.products.length > 0 && (
            <ul className={`mt-6 max-w-md border-t ${rule}`}>
              {slide.products.map((product) => (
                <li key={product.slug} className={`border-b ${rule}`}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="group flex items-center justify-between gap-4 py-3 text-sm font-semibold"
                  >
                    <span className="line-clamp-1">{product.name}</span>
                    <ArrowUpRight className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link
            href={`/categories/${slide.slug}`}
            className={`btn-stamp mt-8 ${dark ? "" : "btn-stamp-ink"}`}
          >
            Shop {slide.title.toLowerCase()}
          </Link>
        </div>

        <div ref={imageRef} className="lg:col-span-6">
          <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)] border ${dark ? "border-white/15" : "border-[#22272E]/10"}`}>
            {slide.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slide.image} alt={slide.title} className="w-full h-full object-contain p-6" loading="lazy" />
            ) : null}
          </div>
        </div>
      </div>

      {/* Controls: arrows, the next family's name, and one tab per ink. */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-10 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => goTo(index - 1, e.currentTarget)}
            aria-label="Previous product family"
            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors ${dark ? "border-white/60 hover:bg-white hover:text-[#22272E]" : "border-[#22272E]/60 hover:bg-[#22272E] hover:text-white"}`}
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => goTo(index + 1, e.currentTarget)}
            aria-label="Next product family"
            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors ${dark ? "border-white/60 hover:bg-white hover:text-[#22272E]" : "border-[#22272E]/60 hover:bg-[#22272E] hover:text-white"}`}
          >
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </button>
          <span className="eyebrow ml-2 hidden sm:inline">Next: {slides[(index + 1) % total].title}</span>
        </div>

        <div role="tablist" aria-label="Choose a product family" className="flex items-center gap-2">
          {slides.map((item, i) => (
            <button
              key={item.slug}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={item.title}
              onClick={(e) => goTo(i, e.currentTarget)}
              className={`h-3 rounded-full transition-all duration-300 ring-2 ${i === index ? "w-10" : "w-3"} ${dark ? "ring-white/70" : "ring-[#22272E]/50"}`}
              style={{ background: item.ink }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
