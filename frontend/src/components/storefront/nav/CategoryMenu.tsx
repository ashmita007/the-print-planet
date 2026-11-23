"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Layers } from "lucide-react";
import { formatCategoryLabel } from "@/lib/formatters";
import { usePresence } from "@/lib/useOverlay";
import { isActivePath, LINK_UNDERLINE, type CategoryGroup } from "./shared";
import { useDropdown, useHoverIntent } from "./useDropdown";

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
  variant = "bar",
}: {
  groups: CategoryGroup[];
  total: number;
  onOpen: () => void;
  /** "tile" is the icon-over-label look of the home category strip. */
  variant?: "bar" | "tile";
}) {
  const pathname = usePathname();
  const { open, setOpen, wrapRef, buttonRef, onButtonClick, onKeyDown, onBlur } = useDropdown();
  const { mounted, ref } = usePresence<HTMLDivElement>(open, { autoAlpha: 0, y: 8 });
  // Underline means "you are on a category page"; an open menu gets its own pill style.
  const active = isActivePath(pathname, "/categories");
  const close = () => setOpen(false);
  const hover = useHoverIntent(open, setOpen, buttonRef, wrapRef, onOpen);

  const visible = groups.slice(0, TOP_GROUPS);

  return (
    <div ref={wrapRef} onKeyDown={onKeyDown} onBlur={onBlur} onPointerEnter={hover.onPointerEnter} onPointerLeave={hover.onPointerLeave}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          // A click right after hover-open keeps the menu open instead of flipping it shut.
          if (open && hover.clickFollowsHover()) return;
          if (!open) onOpen();
          onButtonClick(e);
        }}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="category-menu"
        aria-current={active ? "page" : undefined}
        className={
          variant === "tile"
            ? `group flex flex-col items-center gap-1.5 w-[6.25rem] shrink-0 rounded-lg py-1.5 px-1 text-center text-[13px] font-semibold text-[#121418] outline-none focus-visible:ring-2 focus-visible:ring-[#121418] ${open ? "bg-[#EDF1F6]" : "hover:bg-[#EDF1F6]"}`
            : `${LINK_UNDERLINE} group flex items-center gap-1.5 h-10 ${
                open
                  ? "bg-[#EDF1F6] text-[#121418] font-bold after:scale-x-0!"
                  : active
                    ? "text-[#121418] font-bold after:scale-x-100"
                    : "text-slate-700 hover:text-[#121418]"
              }`
        }
      >
        {variant === "tile" ? (
          <>
            <span className="w-14 h-14 rounded-full bg-[#EDF1F6] border border-[#DFE6EE] flex items-center justify-center">
              <Layers className="w-6 h-6 text-[#353C45]" aria-hidden />
            </span>
            <span className="leading-tight">All Categories</span>
          </>
        ) : (
          <>
            <Layers className="w-4 h-4 text-[#353C45]" aria-hidden />
            <span>All Categories</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180 text-[#121418]" : "text-slate-400"}`}
              aria-hidden
            />
          </>
        )}
      </button>

      {mounted && (
        <div
          ref={ref}
          id="category-menu"
          data-panel
          data-menu
          className="absolute inset-x-4 sm:inset-x-6 top-full z-50 pt-1"
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
