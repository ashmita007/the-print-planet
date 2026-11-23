"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Layers } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { formatCategoryLabel, getProductImageUrl, sizedImage } from "@/lib/formatters";
import type { Product } from "@/lib/types";
import CategoryMenu from "./CategoryMenu";
import { MENU_ITEM } from "./HeaderDropdown";
import { type CategoryGroup } from "./shared";
import { useHoverIntent } from "./useDropdown";

const TOP_COUNT = 8;
// Smallest on-disk image copy; tiles are 56px.
const THUMB_WIDTH = 160;
// First product photo per category; the API has no category images. Kept for the session.
// An empty string means "looked, found nothing", so a failing category is not retried on every render.
const thumbCache = new Map<string, string>();

const DESKTOP = "(min-width: 1024px)";

function useCategoryThumbs(slugs: string[], enabled: boolean) {
  const [thumbs, setThumbs] = useState<Record<string, string>>(() => Object.fromEntries(thumbCache));
  // The strip is hidden below 1024px, so phones never pay for these requests.
  const [wide, setWide] = useState(false);
  const key = slugs.join(",");

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled || !wide) return;
    const missing = key.split(",").filter((s) => s && !thumbCache.has(s));
    if (missing.length === 0) return;
    const ctrl = new AbortController();
    Promise.all(
      missing.map(async (slug) => {
        try {
          const res = await fetch(`${getApiUrl()}/api/v1/products/?category=${encodeURIComponent(slug)}&page_size=1`, {
            headers: { Accept: "application/json" },
            signal: ctrl.signal,
          });
          if (!res.ok) throw new Error(String(res.status));
          const data: { results?: Product[] } = await res.json();
          const first = data.results?.[0];
          thumbCache.set(slug, first ? sizedImage(getProductImageUrl(first), THUMB_WIDTH) : "");
        } catch (err) {
          if ((err as Error).name !== "AbortError") thumbCache.set(slug, "");
        }
      })
    ).then(() => {
      if (!ctrl.signal.aborted) setThumbs(Object.fromEntries(thumbCache));
    });
    return () => ctrl.abort();
  }, [key, enabled, wide]);

  return thumbs;
}

/** One top category: link plus a hover/focus dropdown of its subcategories. */
function CategoryNavItem({
  group,
  variant,
  thumb,
  className,
  alignRight,
}: {
  group: CategoryGroup;
  variant: "tile" | "text";
  thumb?: string;
  className: string;
  /** Items on the right half open their dropdown leftwards so it stays on screen. */
  alignRight: boolean;
}) {
  const { main, subs } = group;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const hover = useHoverIntent(open, setOpen, linkRef, wrapRef);
  const label = formatCategoryLabel(main.name);
  const href = `/categories/${main.slug}`;
  const hasSubs = subs.length > 0;
  const close = () => setOpen(false);

  return (
    <div
      ref={wrapRef}
      className={`relative ${className}`}
      onPointerEnter={hasSubs ? hover.onPointerEnter : undefined}
      onPointerLeave={hasSubs ? hover.onPointerLeave : undefined}
      onFocus={(e) => hasSubs && e.target.matches(":focus-visible") && setOpen(true)}
      onBlur={(e) => open && !wrapRef.current?.contains(e.relatedTarget as Node | null) && setOpen(false)}
    >
      <Link
        ref={linkRef}
        href={href}
        onClick={close}
        title={label}
        aria-haspopup={hasSubs ? "true" : undefined}
        aria-expanded={hasSubs ? open : undefined}
        className={
          variant === "tile"
            ? `flex flex-col items-center gap-1.5 w-full rounded-lg py-1.5 px-1 text-[13px] font-semibold text-[#121418] outline-none focus-visible:ring-2 focus-visible:ring-[#121418] ${open ? "bg-[#EDF1F6]" : "hover:bg-[#EDF1F6]"}`
            : `flex items-center h-11 px-2.5 text-sm font-semibold whitespace-nowrap rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#121418] ${open ? "text-[#121418] bg-[#EDF1F6]" : "text-slate-700 hover:text-[#121418] hover:bg-[#EDF1F6]"}`
        }
      >
        {variant === "tile" && (
          <span className="w-14 h-14 rounded-full bg-[#EDF1F6] border border-[#DFE6EE] flex items-center justify-center overflow-hidden shrink-0">
            {thumb ? (
              <Image src={thumb} alt="" width={56} height={56} unoptimized className="w-full h-full object-cover" />
            ) : (
              <Layers className="w-6 h-6 text-[#353C45]" aria-hidden />
            )}
          </span>
        )}
        <span className={variant === "tile" ? "line-clamp-3 text-center leading-tight" : "truncate max-w-[15rem]"}>{label}</span>
      </Link>

      {hasSubs && open && (
        <div data-menu className={`absolute top-full z-50 pt-1 w-64 ${alignRight ? "right-0" : "left-0"}`}>
          <div className="bg-white border border-[#DFE6EE] rounded-lg shadow-[0_16px_40px_-12px_rgba(16,39,66,0.22)] py-1.5 max-h-[70dvh] overflow-y-auto">
            <Link href={href} onClick={close} className={`${MENU_ITEM} font-bold text-[#121418]`}>
              All {label}
            </Link>
            {subs.map((sub) => (
              <Link key={sub.id} href={`/categories/${sub.slug}`} onClick={close} className={MENU_ITEM}>
                {formatCategoryLabel(sub.name)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Desktop category row. Home gets photo tiles (scrolls away); every other page gets a slim text bar
 * that stays under the sticky header. Both start with "All Categories", which opens the mega menu.
 */
export default function CategoryStrip({
  groups,
  total,
  onMenuOpen,
  tiles,
}: {
  groups: CategoryGroup[];
  total: number;
  onMenuOpen: () => void;
  tiles: boolean;
}) {
  const tops = groups.slice(0, TOP_COUNT);
  const thumbs = useCategoryThumbs(tops.map((g) => g.main.slug), tiles);
  // Fewer links on narrower desktops so the row never wraps or overlaps.
  const barVisibility = (i: number) =>
    i < 4 ? "" : i === 4 ? "hidden xl:block" : i === 5 ? "hidden min-[1400px]:block" : "hidden min-[1700px]:block";

  return (
    <nav aria-label="Categories" className="hidden lg:block">
      <div className={`relative max-w-7xl 2xl:max-w-[1440px] min-[1700px]:max-w-[1600px] mx-auto px-6 ${tiles ? "py-2" : ""}`}>
        {tiles ? (
          <div className="flex items-start justify-between gap-1">
            <CategoryMenu groups={groups} total={total} onOpen={onMenuOpen} variant="tile" />
            {tops.map((g, i) => (
              <CategoryNavItem key={g.main.id} group={g} variant="tile" alignRight={i >= TOP_COUNT / 2} thumb={thumbs[g.main.slug]} className="w-[6.25rem] shrink-0" />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1 h-11">
            <CategoryMenu groups={groups} total={total} onOpen={onMenuOpen} />
            <span className="w-px h-5 bg-slate-200 mx-1.5" aria-hidden />
            {tops.slice(0, 7).map((g, i) => (
              <CategoryNavItem key={g.main.id} group={g} variant="text" alignRight={i >= 3} className={barVisibility(i)} />
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
