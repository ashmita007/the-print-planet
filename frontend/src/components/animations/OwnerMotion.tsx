"use client";

import React, { useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

// Compared by path so a StrictMode re-run of the effect does not count as a navigation.
let lastPath: string | null = null;

/** A short settle between owner screens. This UI is used all day, so it stays quick. */
export default function OwnerMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const arrived = lastPath !== null && lastPath !== pathname;
      lastPath = pathname;
      if (!arrived || prefersReducedMotion() || !root.current) return;

      gsap.from(root.current.querySelectorAll(":scope > * > *"), {
        opacity: 0,
        y: 8,
        duration: 0.22,
        ease: "power2.out",
        stagger: 0.03,
        clearProps: "transform,opacity",
      });
    },
    { scope: root }
  );

  return <div ref={root}>{children}</div>;
}
