"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, Layers, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useClientAuth } from "./nav/shared";

/** Phone and tablet bottom bar. Account and Cart live here (not in the header), so nothing is duplicated. */
export default function MobileBottomBar() {
  const pathname = usePathname();
  const { totalItems, toggleCart } = useCart();
  const { loggedIn } = useClientAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const items = [
    { label: "Home", href: "/", icon: Home, active: pathname === "/" },
    { label: "Categories", href: "/categories", icon: Layers, active: pathname.startsWith("/categories") || pathname.startsWith("/products") },
    {
      label: loggedIn ? "Account" : "Sign in",
      href: loggedIn ? "/account" : "/account/login",
      icon: User,
      active: pathname.startsWith("/account"),
    },
  ];
  const base = "min-w-0 flex flex-col items-center justify-center gap-0.5 min-h-12 rounded-md text-[11px] leading-none active:scale-95 transition-transform motion-reduce:transition-none motion-reduce:active:scale-100 outline-none focus-visible:ring-2 focus-visible:ring-white";

  return (
    <nav
      aria-label="Quick links"
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#121418] border-t border-white/10 px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-5 items-stretch gap-1 max-w-xl mx-auto">
        {items.map(({ label, href, icon: Icon, active }) => (
          <Link key={label} href={href} aria-current={active ? "page" : undefined} className={`${base} ${active ? "text-white font-bold bg-white/10" : "text-slate-300"}`}>
            <Icon className="w-5 h-5" aria-hidden />
            <span className="truncate max-w-full">{label}</span>
          </Link>
        ))}

        <button type="button" onClick={toggleCart} aria-label={mounted && totalItems > 0 ? `Cart, ${totalItems} items` : "Cart"} className={`${base} text-slate-300`}>
          <span className="relative">
            <ShoppingCart className="w-5 h-5" aria-hidden />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-white text-[#121418] text-[10px] font-extrabold flex items-center justify-center">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </span>
          <span>Cart</span>
        </button>

        <Link href="/quote" className={`${base} bg-[#F26B1D] text-[#121418] font-bold`}>
          <FileText className="w-5 h-5" aria-hidden />
          <span>Quote</span>
        </Link>
      </div>
    </nav>
  );
}
