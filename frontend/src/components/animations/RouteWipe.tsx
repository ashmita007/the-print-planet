"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, PRINT_EASE, prefersReducedMotion } from "@/lib/gsap";

const COVER_SECONDS = 0.45;
const UNCOVER_SECONDS = 0.5;
// A link can fail or be cancelled, so the plates never wait on it for long.
const GIVE_UP_MS = 1400;

function isInternalPageLink(event: MouseEvent): HTMLAnchorElement | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;

  const link = (event.target as Element | null)?.closest?.("a");
  if (!link || !link.href || link.target === "_blank" || link.hasAttribute("download")) return null;

  const to = new URL(link.href, window.location.href);
  if (to.origin !== window.location.origin) return null;
  // Filters and in-page anchors stay on the same sheet, so they get no wipe.
  if (to.pathname === window.location.pathname) return null;
  return link;
}

/**
 * Two circles grow from the click point and close again once the new route has committed. The click
 * gets feedback at once, which matters here because every public route is server rendered.
 */
export default function RouteWipe() {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const covered = useRef(false);
  const giveUp = useRef<number | undefined>(undefined);
  const landed = useRef(false);
  const pending = useRef(false);
  const uncover = useRef<() => void>(() => {});
  const origin = useRef("50% 50%");

  useEffect(() => {
    const plates = () => root.current?.querySelectorAll<HTMLElement>("[data-plate]");
    const mark = () => root.current?.querySelector<HTMLElement>("[data-reg-mark]");

    uncover.current = () => {
      window.clearTimeout(giveUp.current);
      const items = plates();
      if (!covered.current || !items) return;
      // A prefetched route commits before the cover lands; let it land first.
      if (!landed.current) {
        pending.current = true;
        return;
      }
      pending.current = false;
      covered.current = false;
      gsap.to(mark() ?? [], { opacity: 0, duration: 0.1 });
      // The circles close back into the point the visitor clicked, ink first.
      gsap.to(Array.from(items).reverse(), {
        clipPath: `circle(0% at ${origin.current})`,
        duration: UNCOVER_SECONDS,
        ease: "power3.inOut",
        stagger: 0.06,
        overwrite: true,
        onComplete: () => {
          if (root.current) root.current.style.visibility = "hidden";
        },
      });
    };

    const onClick = (event: MouseEvent) => {
      const items = plates();
      if (!items || prefersReducedMotion() || !isInternalPageLink(event)) return;

      covered.current = true;
      landed.current = false;
      pending.current = false;
      origin.current = `${event.clientX}px ${event.clientY}px`;
      if (root.current) root.current.style.visibility = "visible";
      gsap.set(items, { clipPath: `circle(0% at ${origin.current})`, overwrite: true });
      gsap.fromTo(
        mark() ?? [],
        { opacity: 0, scale: 0.7, rotation: -45 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.24, delay: 0.1, ease: "power3.out" }
      );
      // A gold circle grows from the click, with ink close behind it.
      gsap.to(items, {
        clipPath: `circle(150% at ${origin.current})`,
        duration: COVER_SECONDS,
        ease: PRINT_EASE,
        stagger: 0.07,
        onComplete: () => {
          landed.current = true;
          if (pending.current) uncover.current();
        },
      });

      window.clearTimeout(giveUp.current);
      giveUp.current = window.setTimeout(() => uncover.current(), GIVE_UP_MS);
    };

    // Capture phase, so a page handler cannot swallow the feedback.
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(giveUp.current);
    };
  }, []);

  // The route has committed: clear the plates over the new page.
  useEffect(() => {
    uncover.current();
  }, [pathname]);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="fixed inset-0 z-[120] overflow-hidden pointer-events-none"
      style={{ visibility: "hidden" }}
    >
      <div data-plate className="absolute inset-0 bg-[#F26B1D]" style={{ clipPath: "circle(0% at 50% 50%)" }} />
      <div data-plate className="absolute inset-0 bg-[#22272E]" style={{ clipPath: "circle(0% at 50% 50%)" }} />
      <svg
        data-reg-mark
        viewBox="0 0 48 48"
        className="absolute left-1/2 top-1/2 w-12 h-12 -ml-6 -mt-6 opacity-0"
        fill="none"
        stroke="#B9C3CF"
        strokeWidth="1.5"
      >
        <circle cx="24" cy="24" r="13" />
        <path d="M24 2v44M2 24h44" />
      </svg>
    </div>
  );
}
