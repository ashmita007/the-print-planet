"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import PrintPlanet from "./PrintPlanet";
import type { PrintPlanet as PlanetScene } from "./printPlanetScene";

const INKS = [
  { name: "Cyan", code: "C", color: "#00A0DC" },
  { name: "Magenta", code: "M", color: "#D6127E" },
  { name: "Yellow", code: "Y", color: "#F7D117" },
  { name: "Key", code: "K", color: "#FFFFFF" },
];

/** Scroll pulls four separated ink plates into register, and the planet prints itself. */
export default function PrintRegisterSection() {
  const rootRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<PlanetScene | null>(null);
  const press = useRef({ progress: 0 });

  const handleScene = (scene: PlanetScene) => {
    sceneRef.current = scene;
    scene.setProgress(press.current.progress);
  };

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        press.current.progress = 1;
        sceneRef.current?.setProgress(1);
        gsap.set("[data-ink-fill]", { scaleX: 1 });
        return;
      }

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: rootRef.current, start: "top top", end: "+=150%", pin: true, scrub: 0.6 },
        })
        .to(press.current, {
          progress: 1,
          duration: 1,
          onUpdate: () => sceneRef.current?.setProgress(press.current.progress),
        }, 0)
        .fromTo(
          "[data-ink-fill]",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.26, stagger: 0.11, ease: "power2.inOut" },
          0.02
        )
        .from("[data-register-end]", { autoAlpha: 0, y: 14, duration: 0.14, ease: "power2.out" }, 0.84);
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      data-no-reveal
      aria-labelledby="register-heading"
      className="bg-[#0E2238] text-white overflow-hidden min-h-svh flex items-center"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-10 items-center">
        <div className="lg:col-span-4 order-2 lg:order-1">
          <h2 id="register-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.06]">
            Four inks.
            <span className="block text-[#F4A36B]">One print.</span>
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
                    data-ink-fill
                    className="block h-full w-full origin-left"
                    style={{ backgroundColor: ink.color, transform: "scaleX(0)" }}
                  />
                </span>
              </li>
            ))}
          </ul>

          <div data-register-end className="mt-6">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-bold text-white underline decoration-[#F4A36B] underline-offset-4 hover:text-[#F4A36B] transition-colors group"
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
