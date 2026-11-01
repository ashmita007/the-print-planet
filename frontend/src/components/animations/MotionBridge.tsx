"use client";

import { useEffect } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const ENTRANCES: Record<string, { from: gsap.TweenVars; duration: number }> = {
  "anim-fade-in": { from: { autoAlpha: 0 }, duration: 0.3 },
  "anim-fade-up": { from: { autoAlpha: 0, y: 14 }, duration: 0.5 },
  "anim-scale-in": { from: { autoAlpha: 0, scale: 0.97 }, duration: 0.3 },
  "anim-slide-in-right": { from: { autoAlpha: 0, x: 26 }, duration: 0.4 },
  "anim-slide-in-left": { from: { autoAlpha: 0, x: -26 }, duration: 0.4 },
  "anim-toast": { from: { autoAlpha: 0, y: 14, scale: 0.98 }, duration: 0.35 },
};

const SELECTOR = Object.keys(ENTRANCES).map((name) => `.${name}`).join(",");
const STAGGER_STEP = 0.04;

function animate(el: Element) {
  const name = Object.keys(ENTRANCES).find((key) => el.classList.contains(key));
  if (!name) return;

  const staggerClass = Array.from(el.classList).find((c) => c.startsWith("stagger-"));
  const delay = staggerClass ? Number(staggerClass.split("-")[1]) * STAGGER_STEP : 0;

  gsap.from(el, {
    ...ENTRANCES[name].from,
    duration: ENTRANCES[name].duration,
    delay,
    ease: "power3.out",
    clearProps: "transform,opacity,visibility",
  });
}

/**
 * Plays the anim-* entrance classes through GSAP whenever they enter the DOM, so
 * modals, toasts and route changes share the site's motion without per-file wiring.
 */
export default function MotionBridge() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(SELECTOR)) animate(node);
          node.querySelectorAll(SELECTOR).forEach(animate);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
