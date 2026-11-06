"use client";

import React, { useRef } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import TextReveal from "@/components/animations/TextReveal";
import { ColorBar, CropMarks } from "@/components/animations/PrintMarks";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

interface PageHeroProps {
  title: string;
  lead?: string;
  crumbs: { label: string; href?: string }[];
  children?: React.ReactNode;
}

/** The ink band every inner page opens with. Words strike in, then the marks register. */
export default function PageHero({ title, lead, crumbs, children }: PageHeroProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.set("[data-hero]", { opacity: 1, animation: "none" });
      if (prefersReducedMotion()) return;

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-word]", { yPercent: 115, duration: 0.7, stagger: 0.045 }, 0.05)
        .from("[data-hero-item]", { opacity: 0, y: 14, duration: 0.5, stagger: 0.08 }, 0.25)
        .from("[data-crop]", { opacity: 0, scale: 1.8, duration: 0.4, stagger: 0.05, ease: "back.out(2)" }, 0.3)
        .from("[data-swatch]", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.3, stagger: 0.05 }, 0.45)
        .from("[data-hero-rule]", { scaleX: 0, transformOrigin: "0 50%", duration: 0.9, ease: "power2.inOut" }, 0.1);

      // The halftone sits slower than the page as the band scrolls away.
      gsap.to("[data-hero-dots]", {
        yPercent: 18,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: root }
  );

  return (
    <header ref={root} className="relative overflow-hidden bg-[#0E2238] text-white">
      <div data-hero-dots aria-hidden="true" className="page-hero-dots absolute inset-0 -top-[20%]" />

      <div data-hero className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-9 sm:pb-14">
        <Breadcrumbs items={crumbs} tone="dark" />

        <div className="mt-5 sm:mt-9 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <h1 className="relative w-fit text-[2.1rem] leading-[1.04] sm:text-5xl lg:text-6xl font-hero font-extrabold tracking-[-0.03em]">
              <TextReveal text={title} />
              <CropMarks />
            </h1>
            {lead && (
              <p data-hero-item className="mt-5 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                {lead}
              </p>
            )}
            {children && (
              <div data-hero-item className="mt-6 flex flex-wrap items-center gap-3">
                {children}
              </div>
            )}
          </div>
          <ColorBar className="hidden md:flex shrink-0 mb-1" />
        </div>
      </div>

      <div data-hero-rule aria-hidden="true" className="h-[3px] bg-[#F26B1D]" />
    </header>
  );
}
