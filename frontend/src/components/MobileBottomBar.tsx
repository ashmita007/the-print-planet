"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Phone, FileText, ShoppingBag, MessageCircle } from "lucide-react";
import { SiteSettings } from "@/lib/types";
import { useCart } from "@/lib/cart";

interface MobileBottomBarProps {
  settings?: SiteSettings;
}

export default function MobileBottomBar({ settings }: MobileBottomBarProps) {
  const pathname = usePathname();
  const { totalItems, toggleCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const phone = settings?.phone || "+91 97418 08034";
  const cleanPhone = phone.replace(/[^0-9]/g, "");

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Catalog",
      href: "/products",
      icon: Layers,
      isActive: pathname.startsWith("/products") || pathname.startsWith("/categories"),
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/${cleanPhone}?text=Hello%20The%20Print%20Planet,%20I%20need%20wholesale%20rates%20for%20custom%20printing%20and%20merchandise`,
      icon: MessageCircle,
      isExternal: true,
      isActive: false,
    },
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#102742]/95 backdrop-blur-md border-t border-white/10 px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-2xl">
      <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isItemActive = item.isActive;
          const content = (
            <div
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all duration-200 active:scale-95 ${
                isItemActive
                  ? "text-[#FFA868] font-bold bg-white/[0.08]"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-0.5 ${
                  isItemActive ? "text-[#FFA868]" : "text-slate-300"
                }`}
              />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </div>
          );

          if (item.isExternal) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center"
              >
                {content}
              </a>
            );
          }

          return (
            <Link key={item.label} href={item.href} className="flex-1 text-center">
              {content}
            </Link>
          );
        })}

        {/* Mobile Cart Trigger */}
        <button
          onClick={toggleCart}
          className="flex-1 text-center relative"
          aria-label="Open Cart"
        >
          <div className="flex flex-col items-center justify-center py-1 px-1.5 rounded-xl text-slate-300 hover:text-white active:scale-95 transition-all">
            <div className="relative">
              <ShoppingBag className="w-5 h-5 mb-0.5 text-slate-300" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-0.5 bg-[#E87832] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">Cart</span>
          </div>
        </button>

        {/* Get Quote Action */}
        <Link
          href="/quote"
          className="flex-1 bg-[#E87832] hover:bg-[#d66b28] text-white py-1.5 px-2 rounded-xl flex flex-col items-center justify-center font-bold transition-all active:scale-95 shadow-md"
        >
          <FileText className="w-4 h-4 mb-0.5 text-white" />
          <span className="text-[10px] tracking-tight whitespace-nowrap">
            Quote
          </span>
        </Link>
      </div>
    </div>
  );
}
