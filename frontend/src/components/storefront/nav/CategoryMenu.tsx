"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Layers } from "lucide-react";
import { formatCategoryName } from "@/lib/formatters";
import { usePresence } from "@/lib/useOverlay";
import { isActivePath, LINK_UNDERLINE, type CategoryGroup } from "./shared";
import { useDropdown } from "./useDropdown";

export default function CategoryMenu({ groups, onOpen }: { groups: CategoryGroup[]; onOpen: () => void }) {
  const pathname = usePathname();
  const { open, setOpen, wrapRef, buttonRef, onButtonClick, onKeyDown, onBlur } = useDropdown();
  const { mounted, ref } = usePresence<HTMLDivElement>(open, { autoAlpha: 0, y: 10, scale: 0.98 });
  const active = isActivePath(pathname, "/products");
  const close = () => setOpen(false);

  return (
    <div className="relative" ref={wrapRef} onKeyDown={onKeyDown} onBlur={onBlur}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          if (!open) onOpen();
          onButtonClick(e);
        }}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="category-menu"
        aria-current={active ? "page" : undefined}
        className={`${LINK_UNDERLINE} group flex items-center gap-1.5 ${
          active || open ? "text-[#121418] font-bold after:scale-x-100" : "text-slate-700 hover:text-[#121418]"
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
          className="absolute top-full left-0 w-[640px] max-w-[calc(100vw-3rem)] bg-white border border-[#DFE6EE] rounded-lg shadow-[0_20px_50px_-10px_rgba(16,39,66,0.18)] mt-2 z-50 overflow-hidden"
        >
          <div className="px-5 py-2.5 border-b border-slate-100 bg-[#EDF1F6] flex items-center justify-between">
            <span className="text-xs font-bold text-[#121418] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#353C45]" aria-hidden /> Complete Catalog Collections
            </span>
            <span className="text-[10px] text-[#353C45] font-bold bg-white border border-[#B9C3CF]/25 px-2.5 py-0.5 rounded-full">
              180+ Products Available
            </span>
          </div>

          <div className="max-h-[460px] overflow-y-auto p-4 grid grid-cols-2 gap-3">
            {groups.length === 0 && <p className="col-span-2 text-xs text-slate-500 p-2">Categories are loading.</p>}
            {groups.map(({ main, subs }) => (
              <div key={main.id} className="p-3 rounded-md bg-slate-50/80 hover:bg-white border border-slate-100 hover:border-[#B9C3CF]/40 hover:shadow-sm transition-colors motion-reduce:transition-none">
                <Link
                  href={`/products?category=${main.slug}`}
                  onClick={close}
                  className="flex items-center justify-between text-xs font-bold text-[#121418] hover:text-[#353C45] mb-1.5 uppercase tracking-wide"
                >
                  <span className="truncate pr-1">{formatCategoryName(main.name)}</span>
                  <span className="text-[10px] text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded-full shrink-0 font-medium">
                    {main.products_count}
                  </span>
                </Link>
                {subs.length > 0 && (
                  <div className="space-y-1 pl-2 border-l-2 border-slate-200">
                    {subs.slice(0, 4).map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/products?category=${sub.slug}`}
                        onClick={close}
                        className="flex items-center justify-between text-[11px] text-slate-600 hover:text-[#121418] font-medium"
                      >
                        <span className="truncate pr-1.5">{formatCategoryName(sub.name)}</span>
                        <span className="text-[9px] text-slate-400 shrink-0 font-normal">{sub.products_count}</span>
                      </Link>
                    ))}
                    {subs.length > 4 && (
                      <Link href={`/products?category=${main.slug}`} onClick={close} className="block text-[10px] font-bold text-[#353C45] hover:underline pt-0.5">
                        +{subs.length - 4} more &rarr;
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-slate-100 bg-[#EDF1F6] flex items-center justify-between px-5">
            <span className="text-xs text-slate-500">Need tailored specifications or GST invoicing?</span>
            <Link href="/products" onClick={close} className="text-xs font-bold text-[#353C45] hover:text-[#2B323B]">
              View All Products &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
