"use client";

import React, { useRef } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";

const TICKER_ITEMS = [
  "CR-80 ISO die cutting",
  "50,000+ units daily",
  "Full GST input tax credit",
  "Free digital proofs",
  "12 / 16 / 20 / 25 mm satin",
  "125 kHz + 13.56 MHz RFID",
  "Pan-India dispatch",
];

export default function MarqueeTicker() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const loop = gsap.to(track.current, {
        xPercent: -50,
        duration: 36,
        ease: "none",
        repeat: -1,
      });

      // Scrolling pushes the belt faster, then it eases back to cruising speed.
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => loop.paused(!self.isActive),
        onUpdate: (self) => {
          const boost = gsap.utils.clamp(1, 5, 1 + Math.abs(self.getVelocity()) / 400);
          gsap.killTweensOf(loop);
          loop.timeScale(boost);
          gsap.to(loop, { timeScale: 1, duration: 0.9, ease: "power2.out" });
        },
      });
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      data-no-reveal
      className="w-full bg-[#F3F5F7] border-b border-[#D8DEE5] py-3 overflow-hidden select-none">
      <div className="flex w-max">
        <div ref={track} className="flex items-center gap-8 shrink-0 pr-8">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
            <span key={idx} className="flex items-center gap-8 font-mono text-xs text-[#475565] whitespace-nowrap">
              {item}
              <span aria-hidden="true" className="w-1 h-1 bg-[#D9601A]" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
