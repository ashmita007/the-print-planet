"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Inbox,
  FileSpreadsheet,
  Settings,
  LogOut,
  ExternalLink,
  PlusCircle,
  Menu,
  X,
} from "lucide-react";
import { ownerLogout, ownerGetMe } from "@/lib/api";
import { AuthUser } from "@/lib/types";

export default function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    ownerGetMe().then((res) => {
      if (res) setUser(res);
      else {
        // If not logged in and not on login page, push to login
        if (pathname !== "/owner/login") {
          router.push("/owner/login");
        }
      }
    });
  }, [pathname, router]);

  const handleLogout = async () => {
    await ownerLogout();
    router.push("/owner/login");
  };

  const navLinks = [
    { label: "Dashboard Overview", href: "/owner/dashboard", icon: LayoutDashboard },
    { label: "Product Management", href: "/owner/products", icon: Package },
    { label: "Add New Product", href: "/owner/products/new", icon: PlusCircle },
    { label: "Category Hierarchy", href: "/owner/categories", icon: Layers },
    { label: "Customer Enquiries", href: "/owner/enquiries", icon: Inbox },
    { label: "Bulk CSV/JSON Import", href: "/owner/import", icon: FileSpreadsheet },
    { label: "Store Identity & SEO", href: "/owner/settings", icon: Settings },
  ];

  useEffect(() => {
    if (mobileOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile Bar */}
      <div className="lg:hidden bg-[#102742] text-white p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#E87832] flex items-center justify-center font-bold text-white text-xs">
            P
          </div>
          <span className="font-bold text-sm">Owner Admin Portal</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-white hover:bg-white/10"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`${
          mobileOpen ? "block" : "hidden"
        } lg:block w-64 bg-[#102742] text-white flex flex-col shrink-0 min-h-screen border-r border-[#17365D] z-40 fixed lg:static inset-y-0 left-0 animate-in slide-in-from-left duration-200`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/owner/dashboard" className="flex items-center gap-2">
            <div className="bg-white px-2.5 py-1.5 rounded-lg inline-block shadow-xs">
              <Image
                src="/logo.png"
                alt="The Print Planet"
                width={130}
                height={34}
                className="h-6 w-auto object-contain"
              />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Owner Panel
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#17365D] text-white border-l-4 border-[#E87832] shadow-xs"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#E87832]" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-white/10 mt-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-slate-400" />
                Live Public Website
              </span>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-300">New tab</span>
            </Link>
          </div>
        </nav>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0c1f36]">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-xs font-bold text-white truncate">
                {user?.username || "Owner Admin"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || "owner@theprintplanet.in"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#E87832] hover:bg-white/5 transition-colors"
              title="Logout from portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
