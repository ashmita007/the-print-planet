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
