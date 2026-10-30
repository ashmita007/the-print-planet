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
  Briefcase,
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
        { label: "Bulk Orders & Chats", href: "/owner/orders", icon: Briefcase },
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
    if (!mobileOpen) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile Bar */}
      <div className="lg:hidden bg-[#0E2238]/95 backdrop-blur-md text-white px-4 py-3 flex items-center justify-between border-b border-white/10 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E87832] flex items-center justify-center font-bold text-white text-xs shadow-xs">
            P
          </div>
          <div>
            <span className="font-bold text-xs block leading-tight">THE PRINT PLANET</span>
            <span className="text-[10px] text-slate-400 block leading-tight">Owner Console</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-white hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          aria-controls="owner-sidebar"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside
        id="owner-sidebar"
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-72 sm:w-64 bg-[#0E2238] text-white flex flex-col shrink-0 h-dvh lg:h-auto lg:min-h-screen border-r border-white/[0.06] shadow-2xl lg:shadow-none transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Brand Header */}
        <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between bg-[#0B1B2D]">
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
              <span className="text-[11px] font-semibold text-white/90 block leading-tight">
                Owner Console
              </span>
              <span className="text-[9px] text-slate-500 block leading-tight">
                Wholesale operations
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
        <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <span className="px-3 text-[9px] font-semibold text-slate-500 uppercase tracking-[0.14em] block mb-1.5">
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
                      className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-white/[0.08] text-white font-semibold"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-[#E87832]" />
                      )}
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-[#FFA868]" : "text-slate-500 group-hover:text-slate-300"}`} />
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
              className="group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/[0.04] hover:text-slate-100 transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                <span>Live Public Site</span>
              </span>
              <span className="text-[10px] text-slate-500 group-hover:text-slate-300 transition-colors">↗</span>
            </Link>
          </div>
        </nav>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0B1B2D]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-[11px] font-semibold text-slate-200 shrink-0">
                {(user?.username || "O").charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-[11px] font-semibold text-white truncate">
                  {user?.username || "Owner Admin"}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {user?.email || "theprintplanet01@gmail.com"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-500 hover:text-[#FFA868] hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
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
