"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  Sparkles,
  Info,
  Database,
} from "lucide-react";
import { ownerLogout, ownerGetMe } from "@/lib/api";
import { AuthUser } from "@/lib/types";

interface NavLinkItem {
  label: string;
  href: string;
  icon: any;
  tab?: string;
}

interface NavSection {
  title: string;
  links: NavLinkItem[];
}

function OwnerSidebarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("owner_user");
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    ownerGetMe().then((res) => {
      if (res) {
        setUser(res);
        if (typeof window !== "undefined") {
          localStorage.setItem("owner_user", JSON.stringify(res));
        }
      }
    });
  }, [pathname]);

  const handleLogout = async () => {
    await ownerLogout();
    router.push("/owner/login");
  };

  const navSections: NavSection[] = [
    {
      title: "Overview",
      links: [
        { label: "Dashboard Overview", href: "/owner/dashboard", icon: LayoutDashboard },
        { label: "Customer Enquiries", href: "/owner/enquiries", icon: Inbox },
      ],
    },
    {
      title: "Catalogue & Inventory",
      links: [
        { label: "Product Management", href: "/owner/products", icon: Package },
        { label: "Add New Product", href: "/owner/products/new", icon: PlusCircle },
        { label: "Category Hierarchy", href: "/owner/categories", icon: Layers },
        { label: "Bulk CSV/JSON Import", href: "/owner/import", icon: FileSpreadsheet },
      ],
    },
    {
      title: "Content & Storefront CMS",
      links: [
        { label: "Homepage Hero & Caption", href: "/owner/settings?tab=hero", icon: Sparkles, tab: "hero" },
        { label: "About Us Content CMS", href: "/owner/settings?tab=about", icon: Info, tab: "about" },
        { label: "Store Identity & Address", href: "/owner/settings?tab=identity", icon: Settings, tab: "identity" },
        { label: "Cloud Sync & Backups", href: "/owner/settings?tab=database", icon: Database, tab: "database" },
      ],
    },
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
      <div className="lg:hidden bg-[#102742] text-white p-3.5 flex items-center justify-between border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E87832] flex items-center justify-center font-bold text-white text-xs shadow-xs">
            P
          </div>
          <div>
            <span className="font-bold text-xs block leading-tight">THE PRINT PLANET</span>
            <span className="text-[10px] text-slate-400 block leading-tight">Owner Control Center</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-white hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
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
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0c1f36]">
          <Link href="/owner/dashboard" className="flex items-center gap-2.5">
            <div className="bg-white px-2.5 py-1.5 rounded-lg inline-block shadow-xs">
              <Image
                src="/logo.png"
                alt="The Print Planet"
                width={140}
                height={40}
                className="h-7 w-auto object-contain"
              />
            </div>
            <div>
              <span className="text-[11px] font-bold text-white block leading-tight">
                Owner Portal
              </span>
              <span className="text-[9px] text-[#FFA868] font-mono block leading-tight">
                v2.4 Management
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-3.5 space-y-4 overflow-y-auto">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                {sec.title}
              </span>
              <div className="space-y-0.5">
                {sec.links.map((item) => {
                  const Icon = item.icon;
                  const basePath = item.href.split("?")[0];
                  let isActive = pathname === basePath;
                  if (basePath === "/owner/settings") {
                    isActive = pathname === basePath && (item.tab ? currentTab === item.tab : !currentTab);
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[#17365D] text-white border-l-4 border-[#E87832] shadow-xs font-bold"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#FFA868]" : "text-slate-400"}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="pt-3 border-t border-white/10">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Live Public Site</span>
              </span>
              <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-slate-300">New tab</span>
            </Link>
          </div>
        </nav>

        {/* User Info & Logout Footer */}
        <div className="p-3.5 border-t border-white/10 bg-[#0c1f36]">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-xs font-bold text-white truncate">
                {user?.username || "Owner Admin"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || "theprintplanet01@gmail.com"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#FFA868] hover:bg-white/5 transition-colors cursor-pointer"
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

export default function OwnerSidebar() {
  return (
    <Suspense fallback={<div className="w-64 bg-[#102742] min-h-screen hidden lg:block" />}>
      <OwnerSidebarInner />
    </Suspense>
  );
}
