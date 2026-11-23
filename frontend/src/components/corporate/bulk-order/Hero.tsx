"use client";

import React from "react";
import PrintPlanet from "@/components/planet/PrintPlanet";
import { ColorBar } from "@/components/animations/PrintMarks";
import { enterStep } from "@/lib/motion";
import TextReveal from "@/components/animations/TextReveal";
import type { PrintPlanet as PlanetScene } from "@/components/planet/printPlanetScene";

export interface HeroProps {
  pressPlanet: (scene: PlanetScene) => void;
}

export default function Hero({
  pressPlanet,
}: HeroProps) {
  return (
    <section data-enter data-no-reveal className="relative bg-[#0E2238] text-white overflow-hidden">
      <div data-hero-dots aria-hidden="true" className="page-hero-dots absolute inset-0 pointer-events-none" />
      <PrintPlanet
        dots={7000}
        minViewport={1024}
        onScene={pressPlanet}
        className="hidden lg:block !absolute right-[max(0rem,calc(50vw-40rem))] -top-6 w-[34rem] h-[26rem]"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-28 sm:pb-32">
        <div className="mb-4">
          <ColorBar />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-hero font-extrabold tracking-[-0.03em] leading-[1.04] max-w-3xl">
          <TextReveal text="Bulk orders, direct" />{" "}
          <span className="block text-[#FF8A3D]">
            <TextReveal text="from our factory." offset={3} />
          </span>
        </h1>
        <p data-enter-item style={enterStep(1)} className="mt-4 text-base text-slate-100 font-normal max-w-xl leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
          Lanyards, ID cards, holders and RFID for companies, schools and print shops. Tell us what you need and get a formal GST quotation in your own order portal.
        </p>
        <ul data-enter-item style={enterStep(2)} className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[13px] text-slate-200">
          {["No broker fees", "Digital proof included", "GST invoice and e-way bill", "Pan-India dispatch"].map((fact) => (
            <li key={fact} className="flex items-center gap-2">
              <span aria-hidden="true" className="w-1 h-1 bg-[#121418]" />
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
