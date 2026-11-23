"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, FileText, LogOut, MapPin, MessageCircle, Package, Phone, User, X } from "lucide-react";
import { clientLogout } from "@/lib/api";
import { formatCategoryLabel } from "@/lib/formatters";
import type { ClientProfile } from "@/lib/types";
import { useOverlay } from "@/lib/useOverlay";
import { CDN_LOGO_URL, DRAWER_EXTRA_ITEMS, displayName, isActivePath, NAV_ITEMS, type CategoryGroup } from "./shared";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  groups: CategoryGroup[];
  loggedIn: boolean;
  user: ClientProfile | null;
  phone: string;
}

const ROW =
  "flex items-center justify-between gap-3 min-h-12 px-4 text-[15px] font-medium text-slate-800 hover:bg-slate-50 active:bg-slate-100 outline-none focus-visible:bg-[#EDF1F6] transition-colors motion-reduce:transition-none";
const LABEL = "px-4 pt-4 pb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500";

// Portalled: the sticky header would otherwise become the containing block of this fixed layer.
export default function MobileDrawer({ open, onClose, groups, loggedIn, user, phone }: MobileDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  // Id of the category whose subcategories are showing; null is the main list.
  const [sub, setSub] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const navigated = useRef(false);
  const lastOpener = useRef<number | null>(null);
  const [dir, setDir] = useState<"right" | "left" | null>(null);
  // useOverlay supplies Escape, scroll lock, the focus trap and focus return to the opener.
  const { mounted, ref } = useOverlay<HTMLDivElement>(open, onClose, { x: "-100%" });

  useEffect(() => {
    if (!open) {
      setSub(null);
      setDir(null);
      navigated.current = false;
    }
  }, [open]);

  // After a drill-down or Back, start at the top and put focus where the user's attention is.
  useEffect(() => {
    if (!navigated.current) return;
    scrollRef.current?.scrollTo({ top: 0 });
    const target =
      sub === null
        ? paneRef.current?.querySelector<HTMLElement>(`[data-cat="${lastOpener.current}"]`)
        : paneRef.current?.querySelector<HTMLElement>("[data-back]");
    target?.focus({ preventScroll: true });
  }, [sub]);

  if (!mounted) return null;

  const digits = phone.replace(/[^0-9]/g, "");
  const group = sub === null ? null : groups.find((g) => g.main.id === sub) ?? null;
  const rowClass = (href: string) => `${ROW} ${isActivePath(pathname, href) ? "bg-[#EDF1F6] text-[#121418] font-bold" : ""}`;
  const aria = (href: string) => (isActivePath(pathname, href) ? ("page" as const) : undefined);

  const drill = (id: number) => {
    navigated.current = true;
    lastOpener.current = id;
    setDir("right");
    setSub(id);
  };
  const back = () => {
    navigated.current = true;
    setDir("left");
    setSub(null);
  };

  return createPortal(
    <div ref={ref} className="fixed inset-0 z-[60] lg:hidden flex">
      <div data-backdrop onClick={onClose} className="fixed inset-0 bg-[#121418]/60 backdrop-blur-xs" />

      <div
        data-panel
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        tabIndex={-1}
        className="relative w-[88%] max-w-sm bg-white h-[100dvh] shadow-2xl flex flex-col z-10 outline-none"
      >
        <div className="px-4 h-14 border-b border-slate-200 flex items-center justify-between shrink-0">
          <Link href="/" onClick={onClose} className="flex items-center">
            <Image src={CDN_LOGO_URL} alt="The Print Planet" width={180} height={50} className="h-8 w-auto object-contain" unoptimized />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2.5 w-11 h-11 rounded-md flex items-center justify-center text-slate-600 hover:text-[#121418] hover:bg-slate-100 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div ref={paneRef} key={sub ?? "main"} className={sub !== null ? "pane-in-right" : dir === "left" ? "pane-in-left" : ""}>
            {group ? (
              <>
                <button
                  type="button"
                  data-back
                  onClick={back}
                  className="w-full flex items-center gap-1.5 min-h-12 px-3 text-sm font-bold text-[#121418] border-b border-slate-100 hover:bg-slate-50 outline-none focus-visible:bg-[#EDF1F6]"
                >
                  <ChevronLeft className="w-5 h-5" aria-hidden />
                  <span>Shop by Category</span>
                </button>
                <p className="px-4 pt-4 pb-1 text-lg font-bold text-[#121418]">{formatCategoryLabel(group.main.name)}</p>
                <Link href={`/categories/${group.main.slug}`} onClick={onClose} className={`${ROW} font-bold text-[#121418]`}>
                  <span>All {formatCategoryLabel(group.main.name)}</span>
                  <span className="text-xs text-slate-500 tabular-nums">{group.main.products_count}</span>
                </Link>
                {group.subs.map((s) => (
                  <Link key={s.id} href={`/categories/${s.slug}`} onClick={onClose} className={ROW}>
                    <span>{formatCategoryLabel(s.name)}</span>
                    <span className="text-xs text-slate-500 tabular-nums">{s.products_count}</span>
                  </Link>
                ))}
              </>
            ) : (
              <>
                {loggedIn ? (
                  <div className="px-4 py-3.5 bg-[#EDF1F6] border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#121418] text-white flex items-center justify-center font-bold text-sm shrink-0" aria-hidden>
                        {(user?.first_name?.[0] || user?.username?.[0] || "U").toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#121418] truncate">{displayName(user)}</p>
                        <p className="text-xs text-[#353C45] truncate">{user?.email || ""}</p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-x-1 -mx-2">
                      <Link href="/orders" onClick={onClose} className="flex items-center gap-1.5 min-h-11 px-2 text-sm font-semibold text-[#121418]">
                        <Package className="w-4 h-4" aria-hidden />
                        My orders
                      </Link>
                      <Link href="/account/addresses" onClick={onClose} className="flex items-center gap-1.5 min-h-11 px-2 text-sm font-semibold text-[#121418]">
                        <MapPin className="w-4 h-4" aria-hidden />
                        Addresses
                      </Link>
                      <Link href="/account" onClick={onClose} className="flex items-center gap-1.5 min-h-11 px-2 text-sm font-semibold text-[#121418]">
                        <User className="w-4 h-4" aria-hidden />
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          onClose();
                          await clientLogout();
                          router.push("/account/login");
                        }}
                        className="flex items-center gap-1.5 min-h-11 px-2 text-sm font-semibold text-red-600"
                      >
                        <LogOut className="w-4 h-4" aria-hidden />
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link href="/account/login" onClick={onClose} className="flex items-center gap-3 px-4 min-h-16 bg-[#EDF1F6] border-b border-slate-200 text-[#121418]">
                    <span className="w-10 h-10 rounded-full bg-white border border-[#DFE6EE] flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" aria-hidden />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[15px] font-bold">Sign in or register</span>
                      <span className="block text-xs text-[#353C45]">Track orders and quotes</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500" aria-hidden />
                  </Link>
                )}

                <p className={LABEL}>Shop by Category</p>
                <Link href="/products" onClick={onClose} className={rowClass("/products")} aria-current={aria("/products")}>
                  <span>All products</span>
                </Link>
                {groups.map(({ main, subs }) =>
                  subs.length > 0 ? (
                    <button key={main.id} type="button" data-cat={main.id} onClick={() => drill(main.id)} className={`${ROW} w-full text-left`}>
                      <span>{formatCategoryLabel(main.name)}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden />
                    </button>
                  ) : (
                    <Link key={main.id} href={`/categories/${main.slug}`} onClick={onClose} className={ROW}>
                      <span>{formatCategoryLabel(main.name)}</span>
                      <span className="text-xs text-slate-500 tabular-nums">{main.products_count}</span>
                    </Link>
                  )
                )}

                <p className={LABEL}>Company</p>
                {NAV_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href} onClick={onClose} aria-current={aria(item.href)} className={rowClass(item.href)}>
                    <span>{item.label}</span>
                  </Link>
                ))}
                <Link href="/orders" onClick={onClose} className={rowClass("/orders")} aria-current={aria("/orders")}>
                  <span>Track order</span>
                </Link>
                {DRAWER_EXTRA_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href} onClick={onClose} aria-current={aria(item.href)} className={rowClass(item.href)}>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t border-slate-200 bg-white space-y-2 shrink-0">
          <Link
            href="/quote"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 min-h-11 rounded-md bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] font-bold text-sm transition-colors motion-reduce:transition-none"
          >
            <FileText className="w-4 h-4" aria-hidden />
            <span>Request Quote</span>
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <a href={`tel:+${digits}`} className="flex items-center justify-center gap-1.5 min-h-11 rounded-md bg-white border border-slate-300 text-[#121418] text-sm font-semibold hover:bg-slate-50">
              <Phone className="w-4 h-4" aria-hidden />
              <span>Call</span>
            </a>
            <a
              href={`https://wa.me/${digits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 min-h-11 rounded-md bg-white border border-slate-300 text-[#121418] text-sm font-semibold hover:bg-slate-50"
            >
              <MessageCircle className="w-4 h-4" aria-hidden />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
