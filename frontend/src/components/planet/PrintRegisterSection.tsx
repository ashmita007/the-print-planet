"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PrintPlanet from "./PrintPlanet";
import type { PrintPlanet as PlanetScene } from "./printPlanetScene";

const INKS = [
  { name: "Cyan", code: "C", color: "#00A0DC" },
  { name: "Magenta", code: "M", color: "#D6127E" },
  { name: "Yellow", code: "Y", color: "#F7D117" },
  { name: "Key", code: "K", color: "#FFFFFF" },
];

/** Four ink plates shown in register: the planet is drawn fully printed, with no scroll-driven motion. */
export default function PrintRegisterSection() {
  const handleScene = (scene: PlanetScene) => scene.setProgress(1);

  return (
    <section
      data-no-reveal
      aria-labelledby="register-heading"
      className="relative bg-[#0E2238] text-white overflow-hidden flex items-center"
    >
      <div aria-hidden="true" className="page-hero-dots absolute inset-0 pointer-events-none" />
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-10 items-center">
        <div className="lg:col-span-4 order-2 lg:order-1">
          <h2 id="register-heading" className="font-hero text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.04]">
            Four inks.
            <span className="block text-[#FF8A3D]">One print.</span>
          </h2>

          <ul className="mt-5 space-y-2.5 max-w-sm">
            {INKS.map((ink) => (
              <li key={ink.code} className="grid grid-cols-[1.25rem_5rem_1fr] items-center gap-2 font-mono text-[13px] text-slate-300">
                <span aria-hidden="true" className="font-semibold" style={{ color: ink.color }}>
                  {ink.code}
                </span>
                <span>{ink.name}</span>
                <span aria-hidden="true" className="block h-0.5 bg-white/15">
                  <span
                    className="block h-full w-full"
                    style={{ backgroundColor: ink.color }}
                  />
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-bold text-white underline decoration-[#B9C3CF] underline-offset-4 hover:text-[#B9C3CF] transition-colors group"
            >
              <span>See custom printing</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <PrintPlanet
          onScene={handleScene}
          className="lg:col-span-8 order-1 lg:order-2 h-[44svh] sm:h-[50svh] lg:h-[78svh] min-h-72"
        />
      </div>
    </section>
  );
}
