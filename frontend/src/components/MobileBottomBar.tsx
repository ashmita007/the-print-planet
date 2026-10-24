"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Phone, FileText, MessageSquare } from "lucide-react";
import { SiteSettings } from "@/lib/types";

interface MobileBottomBarProps {
  settings?: SiteSettings;
}

export default function MobileBottomBar({ settings }: MobileBottomBarProps) {
  const pathname = usePathname();
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
      label: "Catalogue",
      href: "/products",
      icon: Layers,
      isActive: pathname.startsWith("/products") || pathname.startsWith("/categories"),
    },
    {
      label: "Call Sales",
      href: `tel:${phone.replace(/\s+/g, "")}`,
      icon: Phone,
      isActive: false,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/${cleanPhone}?text=Hello%20The%20Print%20Planet,%20I%20need%20wholesale%20rates%20for%20ID%20card%20supplies`,
      icon: MessageSquare,
      isExternal: true,
      isActive: false,
    },
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#102742]/95 backdrop-blur-md border-t border-white/10 px-2 py-2 shadow-[0_-8px_25px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isItemActive = item.isActive;
          const content = (
            <div
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isItemActive
                  ? "text-[#E87832] font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-0.5 ${
                  isItemActive ? "text-[#E87832]" : "text-slate-300"
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

        {/* Highlighted Quote Action matching Navbar Orange Button */}
        <Link
          href="/quote"
          className="flex-1 bg-gradient-to-r from-[#E87832] to-[#FF7A1A] hover:from-[#d66b28] hover:to-[#e66c15] text-white py-2 px-2.5 rounded-xl flex flex-col items-center justify-center font-bold shadow-[0_4px_12px_rgba(232,120,50,0.4)] transition-all active:scale-95"
        >
          <FileText className="w-4 h-4 mb-0.5 text-white" />
          <span className="text-[10px] tracking-tight whitespace-nowrap uppercase">
            Get Quote
          </span>
        </Link>
      </div>
    </div>
  );
}
