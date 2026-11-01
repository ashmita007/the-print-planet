"use client";

import React, { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

const REVEAL_SELECTOR = "h2, [data-reveal], .surface-card, .grid > *";
const REVEAL_EXCLUDE = "form, .sticky, [data-no-reveal]";
const CLEAR = "transform,opacity";

function formatCount(value: number, sample: string) {
  return sample.includes(",") ? value.toLocaleString("en-IN") : String(value);
}

function setupCounters(root: HTMLElement) {
  const counters = root.querySelectorAll<HTMLElement>("[data-count]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        // Write to the text node so React keeps ownership of the element.
        const node = entry.target.firstChild;
        const match = node?.nodeValue?.match(/^(\D*)([\d,]+)(.*)$/);
        if (!node || !match) return;

        const [full, prefix, digits, suffix] = match;
        const state = { value: 0 };
        gsap.to(state, {
          value: Number(digits.replace(/,/g, "")),
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            node.nodeValue = `${prefix}${formatCount(Math.round(state.value), digits)}${suffix}`;
          },
          onComplete: () => {
            node.nodeValue = full;
          },
        });
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}

function setupReveals(root: HTMLElement) {
  const foldLine = window.innerHeight * 0.92;

  // Anything already on screen stays put, so first paint never flashes.
  const found = Array.from(root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)).filter((el) => {
    if (el.closest(REVEAL_EXCLUDE)) return false;
    const box = el.getBoundingClientRect();
    return box.height > 0 && box.top > foldLine;
  });

  // Animate the outermost match only, otherwise nested grids animate twice.
  const set = new Set(found);
  const targets = found.filter((el) => {
    for (let p = el.parentElement; p && p !== root; p = p.parentElement) {
      if (set.has(p)) return false;
    }
    return true;
  });

  // Opacity, not visibility: hidden sections must stay reachable by keyboard and Ctrl+F.
  gsap.set(targets, { opacity: 0, y: 26 });

  // IntersectionObserver rather than ScrollTrigger: catalogue filters and lazy images
  // change page height constantly, and a stale trigger would leave content hidden.
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
      if (visible.length === 0) return;
      visible.forEach((el) => observer.unobserve(el));
      gsap.to(visible, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: "power3.out",
        stagger: 0.07,
        clearProps: CLEAR,
      });
    },
    { rootMargin: "0px 0px -6% 0px" }
  );

  targets.forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}

function setupParallax(root: HTMLElement) {
  gsap.utils.toArray<HTMLElement>("[data-parallax]", root).forEach((el) => {
    gsap.to(el, {
      y: Number(el.dataset.parallax) || 60,
      ease: "none",
      scrollTrigger: {
        trigger: el.parentElement,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });
}

function setupMagnetic(root: HTMLElement) {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};

  const cleanups = gsap.utils.toArray<HTMLElement>("[data-magnetic]", root).map((el) => {
    const x = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

    const move = (e: PointerEvent) => {
      const box = el.getBoundingClientRect();
      x((e.clientX - box.left - box.width / 2) * 0.18);
      y((e.clientY - box.top - box.height / 2) * 0.3);
    };
    const leave = () => {
      x(0);
      y(0);
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  });

  return () => cleanups.forEach((fn) => fn());
}

/**
 * One motion layer for every public page. Pages stay server components and opt in
 * with data attributes: data-reveal, data-count, data-parallax, data-magnetic.
 * Headings, cards and grid items reveal automatically.
 */
export default function PageReveal({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const el = root.current;
      if (!el || !contextSafe || prefersReducedMotion()) return;

      let stops: Array<() => void> = [];

      // Server-rendered sections hydrate in chunks. Waiting a beat keeps GSAP's inline
      // styles off nodes React has not claimed yet, which would be a hydration mismatch.
      const start = contextSafe(() => {
        stops = [setupReveals(el), setupCounters(el), setupMagnetic(el)];
        setupParallax(el);
      });
      const timer = window.setTimeout(start, 160);

      return () => {
        window.clearTimeout(timer);
        stops.forEach((stop) => stop());
      };
    },
    { scope: root }
  );

  return <div ref={root}>{children}</div>;
}
