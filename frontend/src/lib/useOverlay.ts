"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "./gsap";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps an element mounted through its GSAP exit animation.
 * Children marked [data-panel] tween from `from`; [data-backdrop] fades.
 */
export function usePresence<T extends HTMLElement>(open: boolean, from: gsap.TweenVars) {
  const [mounted, setMounted] = useState(open);
  const ref = useRef<T>(null);
  const fromRef = useRef(from);

  if (open && !mounted) setMounted(true);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!mounted || !root) return;

    const panel = root.matches("[data-panel]") ? root : root.querySelector("[data-panel]");
    const backdrop = root.querySelector("[data-backdrop]");
    const to = { x: 0, y: 0, scale: 1, autoAlpha: 1 };
    const tl = gsap.timeline();

    if (open) {
      if (backdrop) tl.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, 0);
      if (panel) tl.fromTo(panel, { ...to, ...fromRef.current }, { ...to, duration: 0.45, ease: "power3.out" }, 0);
    } else {
      if (panel) tl.to(panel, { ...fromRef.current, duration: 0.24, ease: "power2.in" }, 0);
      if (backdrop) tl.to(backdrop, { autoAlpha: 0, duration: 0.24, ease: "power1.in" }, 0);
      tl.eventCallback("onComplete", () => setMounted(false));
    }

    if (prefersReducedMotion()) tl.progress(1);
    return () => {
      tl.kill();
    };
  }, [open, mounted]);

  return { mounted, ref };
}

/** Modal behaviour: exit animation, Escape, scroll lock, focus trap and focus return. */
export function useOverlay<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
  from: gsap.TweenVars
) {
  const presence = usePresence<T>(open, from);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = presence.ref.current?.querySelector<HTMLElement>("[data-panel]");
    panel?.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.({ preventScroll: true });
    };
  }, [open, presence.ref, presence.mounted]);

  return presence;
}
