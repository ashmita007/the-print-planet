"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  FileText,
  Layers,
  LogOut,
  MessageCircle,
  Package,
  Phone,
  User,
  UserCheck,
  X,
} from "lucide-react";
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

const ROW = "flex items-center justify-between min-h-11 px-3 rounded-md hover:bg-slate-50 active:bg-slate-100 transition-colors motion-reduce:transition-none";

// Portalled: the sticky header's backdrop-filter would otherwise become the containing block of this fixed layer.
export default function MobileDrawer({ open, onClose, groups, loggedIn, user, phone }: MobileDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  // useOverlay supplies Escape, scroll lock, the focus trap and focus return to the opener.
  const { mounted, ref } = useOverlay<HTMLDivElement>(open, onClose, { x: "-100%" });

  if (!mounted) return null;

  const rowClass = (href: string) =>
    `${ROW} ${isActivePath(pathname, href) ? "bg-[#EDF1F6] text-[#121418] font-bold" : ""}`;
  const aria = (href: string) => (isActivePath(pathname, href) ? ("page" as const) : undefined);

  return createPortal(
    <div ref={ref} className="fixed inset-0 z-[60] xl:hidden flex">
      <div data-backdrop onClick={onClose} className="fixed inset-0 bg-[#121418]/60 backdrop-blur-xs" />

      <div
        data-panel
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        tabIndex={-1}
        className="relative w-full max-w-xs sm:max-w-sm bg-white h-[100dvh] shadow-2xl flex flex-col z-10 outline-none"
      >
        <div className="px-4 h-16 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <Link href="/" onClick={onClose} className="flex items-center">
            <Image src={CDN_LOGO_URL} alt="The Print Planet" width={180} height={50} className="h-9 w-auto object-contain" unoptimized />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 text-sm font-semibold text-slate-800">
          <Link href="/" onClick={onClose} aria-current={pathname === "/" ? "page" : undefined} className={`${ROW} ${pathname === "/" ? "bg-[#EDF1F6] font-bold" : ""}`}>
            <span>Home</span>
            <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden />
          </Link>

          <div className="border border-slate-100 rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => setCategoriesOpen((v) => !v)}
              aria-expanded={categoriesOpen}
              aria-controls="drawer-categories"
              className="w-full flex items-center justify-between min-h-11 px-3 bg-slate-50/70 text-left font-semibold hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#353C45]" aria-hidden />
                <span>Shop by Category</span>
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform motion-reduce:transition-none ${categoriesOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {categoriesOpen && (
              <div id="drawer-categories" className="p-1.5 bg-white border-t border-slate-100 max-h-72 overflow-y-auto">
                <Link href="/products" onClick={onClose} className="flex items-center min-h-11 px-3 rounded-md text-xs font-bold text-[#353C45] hover:bg-[#EDF1F6]">
                  View All Products
                </Link>
                {groups.map(({ main, subs }) => (
                  <div key={main.id}>
                    <Link href={`/categories/${main.slug}`} onClick={onClose} className="flex items-center justify-between min-h-11 px-3 rounded-md text-sm font-semibold text-slate-800 hover:bg-slate-50">
                      <span className="pr-2 text-sm">{formatCategoryLabel(main.name)}</span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full shrink-0">{main.products_count}</span>
                    </Link>
                    {subs.map((sub) => (
                      <Link key={sub.id} href={`/categories/${sub.slug}`} onClick={onClose} className="flex items-center justify-between min-h-11 pl-6 pr-3 py-2 rounded-md text-sm text-slate-600 hover:bg-slate-50">
                        <span className="pr-2 text-sm">{formatCategoryLabel(sub.name)}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{sub.products_count}</span>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose} aria-current={aria(item.href)} className={rowClass(item.href)}>
              <span className="flex items-center gap-2">
                {item.href === "/corporate" && <Building2 className="w-4 h-4 text-[#353C45]" aria-hidden />}
                <span>{item.label}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden />
            </Link>
          ))}
          {DRAWER_EXTRA_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose} aria-current={aria(item.href)} className={rowClass(item.href)}>
              <span>{item.label}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden />
            </Link>
          ))}
        </div>

        <div className="p-3 border-t border-slate-200 bg-[#EDF1F6] space-y-2 shrink-0">
          {loggedIn ? (
            <>
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#121418] text-white flex items-center justify-center font-bold text-xs shrink-0" aria-hidden>
                    {(user?.first_name?.[0] || user?.username?.[0] || "U").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#121418] truncate">{displayName(user)}</p>
                    <p className="text-[10px] text-[#353C45] truncate">{user?.email || ""}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    onClose();
                    await clientLogout();
                    router.push("/account/login");
                  }}
                  className="min-h-11 px-2 text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1 shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden />
                  <span>Sign Out</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/orders" onClick={onClose} className="flex items-center justify-center gap-1.5 min-h-11 bg-white border border-[#DFE6EE] rounded-md text-xs font-bold text-[#121418]">
                  <Package className="w-3.5 h-3.5 text-[#353C45]" aria-hidden />
                  <span>My Orders</span>
                </Link>
                <Link href="/account" onClick={onClose} className="flex items-center justify-center gap-1.5 min-h-11 bg-white border border-[#DFE6EE] rounded-md text-xs font-bold text-[#121418]">
                  <User className="w-3.5 h-3.5 text-[#353C45]" aria-hidden />
                  <span>Profile</span>
                </Link>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/account/login" onClick={onClose} className="flex items-center justify-center gap-1.5 min-h-11 bg-[#121418] text-white rounded-md text-xs font-bold">
                <User className="w-3.5 h-3.5" aria-hidden />
                <span>Sign In</span>
              </Link>
              <Link href="/account/register" onClick={onClose} className="flex items-center justify-center gap-1.5 min-h-11 bg-white border border-[#DFE6EE] text-[#121418] rounded-md text-xs font-bold hover:bg-slate-50">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" aria-hidden />
                <span>Register</span>
              </Link>
            </div>
          )}

          <Link href="/quote" onClick={onClose} className="w-full flex items-center justify-center gap-2 min-h-12 rounded-md bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] font-bold text-sm shadow-sm transition-colors">
            <FileText className="w-4 h-4" aria-hidden />
            <span>Request Quote</span>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-center justify-center gap-1.5 min-h-11 rounded-md bg-white border border-slate-200 text-slate-800 text-xs font-semibold hover:bg-slate-100">
              <Phone className="w-3.5 h-3.5 text-[#353C45]" aria-hidden />
              <span>Call Us</span>
            </a>
            <a href="https://wa.me/919741808034" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 min-h-11 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">
              <MessageCircle className="w-3.5 h-3.5" aria-hidden />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
