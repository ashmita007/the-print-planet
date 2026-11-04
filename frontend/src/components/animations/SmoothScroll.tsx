"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

let lenis: Lenis | null = null;

/** Lets other components pause smooth scroll, e.g. while a modal is open. */
export const getLenis = () => lenis;

/**
 * Weighted smooth scrolling, driven by GSAP's ticker so ScrollTrigger reads the same
 * position Lenis paints. Native scroll stays on touch and for reduced motion.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      anchors: { offset: -96 },
      // Scrollable panels (drawers, chat threads, selects) keep their own scroll.
      prevent: (node) => node.closest?.("[data-lenis-prevent], [role='dialog'], [role='listbox']") !== null,
    });

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Body scroll locks (modals set overflow:hidden) pause Lenis too.
    const lockWatcher = new MutationObserver(() => {
      const locked = getComputedStyle(document.body).overflow === "hidden";
      if (locked) lenis?.stop();
      else lenis?.start();
    });
    lockWatcher.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });

    return () => {
      lockWatcher.disconnect();
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  // New page: start at the top and let triggers re-measure the fresh layout.
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true });
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
