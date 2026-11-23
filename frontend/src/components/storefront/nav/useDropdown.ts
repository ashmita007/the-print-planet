"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const ITEMS = "[data-menu] a[href], [data-menu] button:not([disabled])";

/**
 * Disclosure-menu behaviour shared by the category mega menu and the account menu:
 * opens on click, Enter, Space or ArrowDown; Escape closes and returns focus to the
 * button; arrows move between items; leaving the menu or changing page closes it.
 */
export function useDropdown() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const items = useCallback(
    () => Array.from(wrapRef.current?.querySelectorAll<HTMLElement>(ITEMS) ?? []),
    []
  );
  const focusItem = useCallback(
    (which: "first" | "last") => {
      // The panel mounts on the render after `open` flips.
      requestAnimationFrame(() => {
        const list = items();
        (which === "first" ? list[0] : list[list.length - 1])?.focus();
      });
    },
    [items]
  );

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const onButtonClick = (e: React.MouseEvent) => {
    const next = !open;
    setOpen(next);
    // detail 0 means Enter or Space, so keyboard users land inside the menu.
    if (next && e.detail === 0) focusItem("first");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const onButton = e.target === buttonRef.current;
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (onButton) {
        if (!open) setOpen(true);
        focusItem("first");
      } else {
        const list = items();
        list[(list.indexOf(document.activeElement as HTMLElement) + 1) % list.length]?.focus();
      }
    } else if (e.key === "ArrowUp" && !onButton && open) {
      e.preventDefault();
      const list = items();
      const at = list.indexOf(document.activeElement as HTMLElement);
      list[(at - 1 + list.length) % list.length]?.focus();
    }
  };

  const onBlur = (e: React.FocusEvent) => {
    if (open && e.relatedTarget && !wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
  };

  return { open, setOpen, wrapRef, buttonRef, onButtonClick, onKeyDown, onBlur };
}

const HOVER_OPEN_MS = 150;
const HOVER_CLOSE_MS = 200;
const HOVER_CLICK_GUARD_MS = 400;

/**
 * Mouse hover-intent for a useDropdown menu: opens after a short pause, closes after a short
 * grace period, and Escape closes it even when focus never entered. Touch and pen use the click handler.
 */
export function useHoverIntent(
  open: boolean,
  setOpen: (v: boolean) => void,
  buttonRef: React.RefObject<HTMLElement | null>,
  wrapRef: React.RefObject<HTMLDivElement | null>,
  onBeforeOpen?: () => void
) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hoverOpenedAt = useRef(0);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const hadFocus = wrapRef.current?.contains(document.activeElement);
      setOpen(false);
      if (hadFocus) buttonRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen, wrapRef, buttonRef]);

  const onPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(timer.current);
    if (openRef.current) return;
    timer.current = setTimeout(() => {
      hoverOpenedAt.current = Date.now();
      onBeforeOpen?.();
      setOpen(true);
    }, HOVER_OPEN_MS);
  };
  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(timer.current);
    if (!openRef.current) return;
    timer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_MS);
  };
  /** True when this click just followed a hover-open and must not flip the menu shut. */
  const clickFollowsHover = () => {
    clearTimeout(timer.current);
    const just = Date.now() - hoverOpenedAt.current < HOVER_CLICK_GUARD_MS;
    hoverOpenedAt.current = 0;
    return just;
  };

  return { onPointerEnter, onPointerLeave, clickFollowsHover };
}
