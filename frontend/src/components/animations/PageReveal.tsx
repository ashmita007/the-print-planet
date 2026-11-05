"use client";

import React, { useRef } from "react";
import { gsap, PRINT_EASE, ScrollTrigger, SplitText, prefersReducedMotion, useGSAP } from "@/lib/gsap";

const REVEAL_SELECTOR = "[data-reveal], .surface-card, .grid > *";
// Headings split into lines that rise and straighten, one after another.
const SPLIT_SELECTOR = "h2, .display-xl, [data-split]";
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
  gsap.set(targets, { opacity: 0, y: 40, skewY: 2.5, transformOrigin: "0 0" });

  // IntersectionObserver rather than ScrollTrigger: catalogue filters and lazy images
  // change page height constantly, and a stale trigger would leave content hidden.
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
      if (visible.length === 0) return;
      visible.forEach((el) => observer.unobserve(el));
      // Left to right, then down, so a grid prints in reading order.
      visible.sort((a, b) => {
        const boxA = a.getBoundingClientRect();
        const boxB = b.getBoundingClientRect();
        return boxA.top - boxB.top || boxA.left - boxB.left;
      });
      gsap.to(visible, {
        opacity: 1,
        y: 0,
        skewY: 0,
        duration: 0.9,
        ease: PRINT_EASE,
        stagger: 0.08,
        clearProps: CLEAR,
      });
    },
    { rootMargin: "0px 0px -6% 0px" }
  );

  targets.forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}

/** Splits headings into masked lines; each rises from below while un-skewing. */
function setupSplitHeadings(root: HTMLElement) {
  const foldLine = window.innerHeight * 0.92;
  const headings = Array.from(root.querySelectorAll<HTMLElement>(SPLIT_SELECTOR)).filter(
    (el) =>
      !el.closest(REVEAL_EXCLUDE) &&
      !el.closest("[data-split-skip], [data-marquee]") &&
      el.textContent?.trim()
  );

  const splits: SplitText[] = [];
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const lines = (entry.target as HTMLElement).querySelectorAll<HTMLElement>("[data-line]");
        gsap.to(lines, {
          yPercent: 0,
          skewY: 0,
          opacity: 1,
          duration: 1,
          ease: PRINT_EASE,
          stagger: 0.12,
        });
      });
    },
    { rootMargin: "0px 0px -8% 0px" }
  );

  headings.forEach((el) => {
    // Headings already on screen at load keep their place; no first-paint flash.
    if (el.getBoundingClientRect().top <= foldLine) return;
    const split = SplitText.create(el, {
      type: "lines",
      mask: "lines",
      linesClass: "split-line",
      aria: "auto",
      autoSplit: true,
      onSplit: (self) => {
        self.lines.forEach((line) => line.setAttribute("data-line", ""));
        gsap.set(self.lines, { yPercent: 110, skewY: 5, opacity: 0, transformOrigin: "0 0" });
      },
    });
    splits.push(split);
    observer.observe(el);
  });

  return () => {
    observer.disconnect();
    splits.forEach((split) => split.revert());
  };
}

/** Ink sections open as a circle growing from their top edge as they scroll in. */
function setupInkWipes(root: HTMLElement) {
  gsap.utils.toArray<HTMLElement>("[data-wipe]", root).forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: "circle(12% at 50% 0%)" },
      {
        clipPath: "circle(150% at 50% 0%)",
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 95%", end: "top 25%", scrub: 0.6 },
      }
    );
  });
}

/** Endless strips that run with the scroll: faster when scrolling, reversing with it. */
function setupMarquees(root: HTMLElement) {
  const tweens = gsap.utils.toArray<HTMLElement>("[data-marquee]", root).map((el) => {
    const track = el.querySelector<HTMLElement>(".marquee-track");
    if (!track) return null;
    // A second copy makes the loop seamless; it is hidden from assistive tech.
    const copy = track.cloneNode(true) as HTMLElement;
    copy.setAttribute("aria-hidden", "true");
    el.appendChild(copy);

    const reverse = el.dataset.marquee === "reverse";
    const tween = gsap.fromTo(
      [track, copy],
      { xPercent: reverse ? -100 : 0 },
      { xPercent: reverse ? 0 : -100, duration: Number(el.dataset.speed) || 28, ease: "none", repeat: -1 }
    );
    return { tween, copy };
  }).filter(Boolean) as Array<{ tween: gsap.core.Tween; copy: HTMLElement }>;

  if (tweens.length === 0) return () => {};

  const trigger = ScrollTrigger.create({
    onUpdate: (self) => {
      const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 4);
      tweens.forEach(({ tween }) => {
        gsap.to(tween, { timeScale: boost * self.direction, duration: 0.2, overwrite: true });
        gsap.to(tween, { timeScale: self.direction, duration: 1.2, delay: 0.2, ease: PRINT_EASE });
      });
    },
  });

  return () => {
    trigger.kill();
    tweens.forEach(({ tween, copy }) => {
      tween.kill();
      copy.remove();
    });
  };
}

/** Large type leans a little with scroll speed, then settles. */
function setupVelocitySkew(root: HTMLElement) {
  const targets = gsap.utils.toArray<HTMLElement>("[data-skew]", root);
  if (targets.length === 0) return () => {};
  const setters = targets.map((el) => gsap.quickTo(el, "skewY", { duration: 0.5, ease: PRINT_EASE }));
  const trigger = ScrollTrigger.create({
    onUpdate: (self) => {
      const skew = gsap.utils.clamp(-4, 4, self.getVelocity() / -300);
      setters.forEach((set) => set(skew));
    },
  });
  const settle = gsap.delayedCall(0.15, () => setters.forEach((set) => set(0))).pause();
  const onScrollEnd = () => settle.restart(true);
  window.addEventListener("scrollend", onScrollEnd);
  return () => {
    trigger.kill();
    window.removeEventListener("scrollend", onScrollEnd);
  };
}

/** Photos print in from the left edge; rules draw across. Once only. */
function setupInk(root: HTMLElement) {
  const foldLine = window.innerHeight * 0.92;
  const below = (el: HTMLElement) => el.getBoundingClientRect().top > foldLine;
  const photos = gsap.utils.toArray<HTMLElement>("[data-print]", root).filter(below);
  const rules = gsap.utils.toArray<HTMLElement>("[data-rule]", root).filter(below);

  gsap.set(photos, { clipPath: "inset(0 100% 0 0)" });
  gsap.set(rules, { scaleX: 0, transformOrigin: "0 50%" });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const el = entry.target as HTMLElement;
        if (el.hasAttribute("data-rule")) {
          gsap.to(el, { scaleX: 1, duration: 0.8, ease: "power2.inOut", clearProps: "transform" });
          return;
        }
        gsap.to(el, { clipPath: "inset(0 0% 0 0)", duration: 0.75, ease: "power3.inOut", clearProps: "clipPath" });
      });
    },
    { rootMargin: "0px 0px -8% 0px" }
  );

  [...photos, ...rules].forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}

/** One listener on the root, because catalogue cards mount and unmount with filters. */
function setupTilt(root: HTMLElement) {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};

  const quick = new WeakMap<HTMLElement, { x: gsap.QuickToFunc; y: gsap.QuickToFunc }>();
  let current: HTMLElement | null = null;

  const settle = (el: HTMLElement) => {
    const q = quick.get(el);
    q?.x(0);
    q?.y(0);
  };

  const move = (e: PointerEvent) => {
    const el = (e.target as Element).closest?.<HTMLElement>("[data-tilt]") ?? null;
    if (current && current !== el) settle(current);
    current = el;
    if (!el) return;

    let q = quick.get(el);
    if (!q) {
      gsap.set(el, { transformPerspective: 900 });
      q = {
        x: gsap.quickTo(el, "rotationY", { duration: 0.35, ease: "power3.out" }),
        y: gsap.quickTo(el, "rotationX", { duration: 0.35, ease: "power3.out" }),
      };
      quick.set(el, q);
    }
    const box = el.getBoundingClientRect();
    q.x(((e.clientX - box.left) / box.width - 0.5) * 5);
    q.y(((e.clientY - box.top) / box.height - 0.5) * -5);
  };
  const leave = () => {
    if (current) settle(current);
    current = null;
  };

  root.addEventListener("pointermove", move);
  root.addEventListener("pointerleave", leave);
  return () => {
    root.removeEventListener("pointermove", move);
    root.removeEventListener("pointerleave", leave);
  };
}

/** Timelines and progress lines that follow the scroll. */
function setupScrub(root: HTMLElement) {
  gsap.utils.toArray<HTMLElement>("[data-scrub-line]", root).forEach((el) => {
    gsap.from(el, {
      scaleX: 0,
      transformOrigin: "0 50%",
      ease: "none",
      scrollTrigger: { trigger: el, start: "top 85%", end: "top 45%", scrub: true },
    });
  });
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
 * with data attributes: data-reveal, data-print, data-rule, data-count, data-parallax,
 * data-magnetic, data-tilt, data-scrub-line, data-wipe, data-marquee, data-skew, data-split.
 * Headings split into rising lines; cards and grid items reveal automatically.
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
        stops = [
          setupSplitHeadings(el),
          setupReveals(el),
          setupInk(el),
          setupCounters(el),
          setupMagnetic(el),
          setupTilt(el),
          setupMarquees(el),
          setupVelocitySkew(el),
        ];
        setupParallax(el);
        setupScrub(el);
        setupInkWipes(el);
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
