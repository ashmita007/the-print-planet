"use client";

import React, { useEffect, useRef } from "react";
import { animate, createTimeline, stagger } from "animejs";

export default function AnimeLogoHeroEffect() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (!containerRef.current) return;

    try {
      const circles = containerRef.current.querySelectorAll(".anime-circle");
      const crosses = containerRef.current.querySelectorAll(".anime-cross");
      const pulseRing = containerRef.current.querySelector(".anime-pulse-ring");

      if (circles.length > 0) {
        animate(circles, {
          scale: [0.8, 1],
          opacity: [0, 0.45],
          duration: 900,
          delay: stagger(120),
          ease: "outQuad",
        });
      }

      if (crosses.length > 0) {
        animate(crosses, {
          opacity: [0, 0.5],
          duration: 1000,
          delay: stagger(100),
          ease: "outQuad",
        });
      }

      if (pulseRing) {
        animate(pulseRing, {
          scale: [1, 1.35],
          opacity: [0.5, 0],
          duration: 2400,
          loop: true,
          ease: "outSine",
        });
      }
    } catch (e) {
      console.warn("Anime effect fallback", e);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute top-6 right-6 pointer-events-none select-none hidden lg:block opacity-75"
      aria-hidden="true"
    >
      <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
        {/* Precision Print Registration Mark (CMYK Calibration Symbol) */}
        <circle
          cx="70"
          cy="70"
          r="48"
          stroke="#E87832"
          strokeWidth="1"
          strokeOpacity="0.4"
          className="anime-circle"
        />
        <circle
          cx="70"
          cy="70"
          r="48"
          stroke="#FFA868"
          strokeWidth="1"
          className="anime-pulse-ring origin-center"
        />
        <circle
          cx="70"
          cy="70"
          r="26"
          stroke="#E87832"
          strokeWidth="1"
          strokeOpacity="0.5"
          className="anime-circle"
        />
        <circle
          cx="70"
          cy="70"
          r="4"
          fill="#FFA868"
          fillOpacity="0.8"
          className="anime-circle"
        />

        {/* Crosshair Registration Lines */}
        <line
          x1="70"
          y1="10"
          x2="70"
          y2="130"
          stroke="#E87832"
          strokeWidth="1"
          strokeOpacity="0.4"
          className="anime-cross"
        />
        <line
          x1="10"
          y1="70"
          x2="130"
          y2="70"
          stroke="#E87832"
          strokeWidth="1"
          strokeOpacity="0.4"
          className="anime-cross"
        />
      </svg>
    </div>
  );
}
