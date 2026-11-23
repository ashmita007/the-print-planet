"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Layers } from "lucide-react";
import { formatCategoryLabel } from "@/lib/formatters";
import { usePresence } from "@/lib/useOverlay";
import { isActivePath, LINK_UNDERLINE, type CategoryGroup } from "./shared";
import { useDropdown } from "./useDropdown";

const HOVER_OPEN_MS = 150;
const HOVER_CLOSE_MS = 200;
const HOVER_CLICK_GUARD_MS = 400;
const TOP_GROUPS = 8;
const SUBS_PER_GROUP = 3;

const categoryHref = (slug: string) => `/categories/${slug}`;

/**
 * Full-width mega menu. The panel is positioned against the header container (the nearest
 * positioned ancestor), so it lines up with the logo on the left and the actions on the right.
 */
export default function CategoryMenu({
  groups,
  total,
  onOpen,
}: {
  groups: CategoryGroup[];
  total: number;
  onOpen: () => void;
}) {
  const pathname = usePathname();
  const { open, setOpen, wrapRef, buttonRef, onButtonClick, onKeyDown, onBlur } = useDropdown();
  const { mounted, ref } = usePresence<HTMLDivElement>(open, { autoAlpha: 0, y: 8 });
  // Underline means "you are on a category page"; an open menu gets its own pill style.
  const active = isActivePath(pathname, "/categories");
  const close = () => setOpen(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Time of the last hover-open; only a click right after it is treated as "pin open".
  const hoverOpenedAt = useRef(0);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Hover-opened menus have no focus inside, so the hook's Escape handler never sees the key.
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

  const clearTimer = () => clearTimeout(timer.current);
  useEffect(() => () => clearTimeout(timer.current), []);

  // Mouse only: touch and pen go through the click handler.
  const onEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimer();
    if (openRef.current) return;
    timer.current = setTimeout(() => {
      hoverOpenedAt.current = Date.now();
      onOpen();
      setOpen(true);
    }, HOVER_OPEN_MS);
  };
  const onLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimer();
    if (!openRef.current) return;
    timer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_MS);
  };

  const visible = groups.slice(0, TOP_GROUPS);

  return (
    <div ref={wrapRef} onKeyDown={onKeyDown} onBlur={onBlur} onPointerEnter={onEnter} onPointerLeave={onLeave}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          clearTimer();
          // A click right after hover-open keeps the menu open instead of flipping it shut.
          const justHovered = Date.now() - hoverOpenedAt.current < HOVER_CLICK_GUARD_MS;
          hoverOpenedAt.current = 0;
          if (open && justHovered) return;
          if (!open) onOpen();
          onButtonClick(e);
        }}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="category-menu"
        aria-current={active ? "page" : undefined}
        className={`${LINK_UNDERLINE} group flex items-center gap-1.5 h-10 ${
          open
            ? "bg-[#EDF1F6] text-[#121418] font-bold after:scale-x-0!"
            : active
              ? "text-[#121418] font-bold after:scale-x-100"
              : "text-slate-700 hover:text-[#121418]"
        }`}
      >
        <span>Shop by Category</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180 text-[#121418]" : "text-slate-400"}`}
          aria-hidden
        />
      </button>

      {mounted && (
        <div
          ref={ref}
          id="category-menu"
          data-panel
          data-menu
          className="absolute left-0 right-0 top-full z-50 pt-1"
        >
          <div className="bg-white border border-[#DFE6EE] rounded-lg shadow-[0_20px_50px_-10px_rgba(16,39,66,0.18)] overflow-hidden max-h-[calc(100dvh-10rem)] overflow-y-auto">
            <div className="px-6 py-3 border-b border-slate-100 bg-[#EDF1F6] flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-[#121418] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#353C45]" aria-hidden /> Shop by Category
              </span>
              {total > 0 && (
                <span className="text-xs text-[#353C45] font-semibold bg-white border border-[#B9C3CF]/40 px-3 py-1 rounded-full">
                  {total} Products
                </span>
              )}
            </div>

            <div className="px-6 py-5 grid grid-cols-4 gap-x-8 gap-y-6">
              {visible.length === 0 && <p className="col-span-full text-sm text-slate-500">Categories are loading.</p>}
              {visible.map(({ main, subs }) => (
                <div key={main.id} className="min-w-0">
                  <Link
                    href={categoryHref(main.slug)}
                    onClick={close}
                    className="flex items-start justify-between gap-3 py-1 text-sm font-bold text-[#121418] hover:text-[#F26B1D] transition-colors motion-reduce:transition-none"
                  >
                    <span>{formatCategoryLabel(main.name)}</span>
                    <span className="text-xs text-slate-500 font-medium tabular-nums shrink-0 pt-0.5">{main.products_count}</span>
                  </Link>
                  {subs.slice(0, SUBS_PER_GROUP).map((sub) => (
                    <Link
                      key={sub.id}
                      href={categoryHref(sub.slug)}
                      onClick={close}
                      className="flex items-start justify-between gap-3 py-1 pl-3 text-sm text-slate-600 hover:text-[#121418] transition-colors motion-reduce:transition-none"
                    >
                      <span>{formatCategoryLabel(sub.name)}</span>
                      <span className="text-xs text-slate-400 tabular-nums shrink-0 pt-0.5">{sub.products_count}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-[#EDF1F6] flex items-center justify-between gap-4">
              <Link href="/categories" onClick={close} className="text-sm font-bold text-[#121418] hover:text-[#F26B1D]">
                View all categories &rarr;
              </Link>
              <Link href="/products" onClick={close} className="text-sm font-semibold text-[#353C45] hover:text-[#121418]">
                Browse all products
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
