"use client";

import React from "react";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import TextReveal from "@/components/animations/TextReveal";
import { ColorBar, CropMarks } from "@/components/animations/PrintMarks";
import { enterStep } from "@/lib/motion";

interface PageHeroProps {
  title: string;
  lead?: string;
  crumbs: { label: string; href?: string }[];
  children?: React.ReactNode;
}

/** The ink band every inner page opens with. Words strike in, then the marks register. */
export default function PageHero({ title, lead, crumbs, children }: PageHeroProps) {
  return (
    <header data-enter className="relative overflow-hidden bg-[#0E2238] text-white">
      <div data-hero-dots aria-hidden="true" className="page-hero-dots absolute inset-0 -top-[20%]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-9 sm:pb-14">
        <Breadcrumbs items={crumbs} tone="dark" />

        <div className="mt-5 sm:mt-9 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <h1 className="relative w-fit text-[2.1rem] leading-[1.04] sm:text-5xl lg:text-6xl font-hero font-extrabold tracking-[-0.03em]">
              <TextReveal text={title} />
              <CropMarks />
            </h1>
            {lead && (
              <p data-enter-item style={enterStep(1)} className="mt-5 text-sm sm:text-base text-slate-100 font-normal leading-relaxed max-w-xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                {lead}
              </p>
            )}
            {children && (
              <div data-enter-item style={enterStep(2)} className="mt-6 flex flex-wrap items-center gap-3">
                {children}
              </div>
            )}
          </div>
          <ColorBar className="hidden md:flex shrink-0 mb-1" />
        </div>
      </div>

      <div data-enter-rule aria-hidden="true" className="h-[3px] bg-[#F26B1D]" />
    </header>
  );
}
