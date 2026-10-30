"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Phone,
  Mail,
  Search,
  Menu,
  X,
  ChevronDown,
  Layers,
  User,
  ArrowRight,
  ExternalLink,
  Home,
  Info,
  Package,
  Printer,
  Sparkles,
  Building2,
  Briefcase,
  FileText,
  LogIn,
} from "lucide-react";
import { Category, SiteSettings } from "@/lib/types";
import { formatCategoryName } from "@/lib/formatters";
import { getApiUrl } from "@/lib/api";

interface NavbarProps {
  categories?: Category[];
  settings?: SiteSettings;
}

export default function Navbar({ categories = [], settings }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState(false);
  const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);
  const [clientUser, setClientUser] = useState<any>(null);
  const [liveCategories, setLiveCategories] = useState<Category[]>(categories);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setLiveCategories(categories);
    }
  }, [categories]);

  const fetchFreshCategories = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/categories/`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLiveCategories(data);
        }
      }
    } catch {
      // retain existing liveCategories on network failure
    }
  };

  useEffect(() => {
    fetchFreshCategories();
    const handleCategoryUpdate = () => {
      fetchFreshCategories();
    };
    window.addEventListener("categoryUpdated", handleCategoryUpdate);
    window.addEventListener("focus", handleCategoryUpdate);
    return () => {
      window.removeEventListener("categoryUpdated", handleCategoryUpdate);
      window.removeEventListener("focus", handleCategoryUpdate);
    };
  }, []);

  useEffect(() => {
    const updateAuth = () => {
      if (typeof window !== "undefined") {
        const ownerTok = localStorage.getItem("owner_token");
        const clientTok = localStorage.getItem("client_token");
        const clientUserStr = localStorage.getItem("client_user");
        setIsOwnerLoggedIn(!!ownerTok);
        setIsClientLoggedIn(!!clientTok);
        if (clientUserStr) {
          try {
            setClientUser(JSON.parse(clientUserStr));
          } catch {
            setClientUser(null);
          }
        } else {
          setClientUser(null);
        }
      }
    };

    updateAuth();
    window.addEventListener("authChange", updateAuth);
    window.addEventListener("storage", updateAuth);
    window.addEventListener("focus", updateAuth);
    return () => {
      window.removeEventListener("authChange", updateAuth);
      window.removeEventListener("storage", updateAuth);
      window.removeEventListener("focus", updateAuth);
    };
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoriesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const businessName = settings?.business_name || "THE PRINT PLANET";
  const phone = settings?.phone || "+91 97418 08034";
  const email = settings?.email || "theprintplanet01@gmail.com";
  const whatsapp = settings?.whatsapp || "+91 97418 08034";

  return (
    <header className="w-full border-b border-[#DCE3EB] bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/85 sticky top-0 z-50 shadow-[0_1px_14px_rgba(16,39,66,0.06)]">
      {/* Utility contact strip */}
      <div className="hidden sm:block bg-[#FAFBFC] border-b border-[#EEF2F7] text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="truncate">Bengaluru, Karnataka</span>
            {settings?.gst_number && (
              <>
                <span className="text-slate-300">·</span>
                <span className="truncate">GSTIN {settings.gst_number}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`mailto:${email}`}
              className="hidden lg:flex items-center gap-1.5 hover:text-[#17365D] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{email}</span>
            </a>
            <span className="hidden lg:inline text-slate-300">·</span>
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="flex items-center gap-1.5 hover:text-[#17365D] transition-colors tabular-nums"
            >
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-24 gap-3">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group py-1" title="Print Planet Official Wholesale Store">
            <Image
              src="/logo.png"
              alt="Print Planet — The Print Planet™ Wholesale ID Card & Printing Solutions"
              width={260}
              height={85}
              className="h-11 sm:h-16 md:h-18 w-auto object-contain hover:opacity-95 transition-opacity"
              priority
            />
          </Link>

          {/* Search Box (Desktop & Tablet) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-4 relative items-center"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search lanyard rolls, PVC holders, hooks, machines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F5F7FA] border border-[#DCE3EB] hover:border-slate-300 focus:border-[#17365D] focus:bg-white focus:ring-4 focus:ring-[#17365D]/10 rounded-lg pl-10 pr-10 py-2 text-sm text-[#263445] placeholder-[#687586] transition-all outline-none"
              />
              <Search className="w-4 h-4 text-[#687586] absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold bg-[#17365D] text-white px-2 py-0.5 rounded hover:bg-[#102742] active:scale-95 transition-all"
                >
                  Go
                </button>
              )}
            </div>
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-5 text-[13px] font-semibold text-[#263445]">
            <Link href="/" className="nav-link hover:text-[#E87832] transition-colors whitespace-nowrap">
              Home
            </Link>

            <Link href="/about" className="nav-link hover:text-[#E87832] transition-colors whitespace-nowrap">
              About Us
            </Link>

            {/* Products & Categories Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => {
                  const nextState = !categoriesDropdownOpen;
                  setCategoriesDropdownOpen(nextState);
                  if (nextState) fetchFreshCategories();
                }}
                className="nav-link flex items-center gap-1 hover:text-[#E87832] transition-colors focus:outline-none whitespace-nowrap"
              >
                <span>Products</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Mega Dropdown Menu */}
              {categoriesDropdownOpen && (
                <div className="absolute top-full left-0 w-[640px] bg-white border border-[#DCE3EB] rounded-2xl shadow-[0_24px_60px_-20px_rgba(16,39,66,0.35),inset_0_1px_0_rgba(255,255,255,0.9)] py-3 mt-1.5 z-50 anim-fade-in">
                  <div className="px-5 py-2.5 border-b border-[#F5F7FA] bg-[#F5F7FA] flex items-center justify-between rounded-t-2xl">
                    <span className="text-xs font-bold text-[#17365D] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#E87832]" /> Wholesale Product Lines
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      6 Core Sectors • 180+ Products
                    </span>
                  </div>

                  <div className="max-h-[460px] overflow-y-auto p-3 grid grid-cols-2 gap-3">
                    {(liveCategories.filter((c) => !c.parent).length > 0
                      ? liveCategories.filter((c) => !c.parent)
                      : liveCategories.slice(0, 6)
                    ).map((mainCat) => {
                      const subs = liveCategories.filter((c) => c.parent === mainCat.id);
                      return (
                        <div
                          key={mainCat.id}
                          className="p-3 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-100 hover:border-[#DCE3EB] hover:shadow-[0_6px_16px_-8px_rgba(16,39,66,0.18)] transition-all duration-200"
                        >
                          <Link
                            href={`/products?category=${mainCat.slug}`}
                            onClick={() => setCategoriesDropdownOpen(false)}
                            className="flex items-center justify-between text-xs font-bold text-[#17365D] hover:text-[#E87832] transition-colors mb-1.5 uppercase tracking-wider"
                          >
                            <span className="truncate pr-1">{formatCategoryName(mainCat.name)}</span>
                            <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-full shrink-0 font-normal">
                              {mainCat.products_count || 0}
                            </span>
                          </Link>
                          {subs.length > 0 && (
                            <div className="space-y-1 pl-2 border-l-2 border-slate-200">
                              {subs.slice(0, 4).map((sub) => (
                                <Link
                                  key={sub.id}
                                  href={`/products?category=${sub.slug}`}
                                  onClick={() => setCategoriesDropdownOpen(false)}
                                  className="block text-[10px] text-slate-600 hover:text-[#E87832] truncate transition-colors uppercase tracking-wide font-medium"
                                >
                                  {formatCategoryName(sub.name)}
                                </Link>
                              ))}
                              {subs.length > 4 && (
                                <Link
                                  href={`/products?category=${mainCat.slug}`}
                                  onClick={() => setCategoriesDropdownOpen(false)}
                                  className="block text-[10px] font-bold text-[#E87832] hover:underline pt-0.5"
                                >
                                  +{subs.length - 4} more subcategories &rarr;
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-2.5 border-t border-[#DCE3EB] bg-[#F8FAFC] flex items-center justify-between px-4 rounded-b-2xl">
                    <span className="text-[11px] text-slate-500">
                      Looking for custom batch sizes or GST invoicing?
                    </span>
                    <Link
                      href="/products"
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="text-xs font-bold text-[#17365D] hover:text-[#E87832] flex items-center gap-1"
                    >
                      <span>View All 180+ Products &rarr;</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/services" className="nav-link hover:text-[#E87832] transition-colors whitespace-nowrap">
              Services
            </Link>

            <Link href="/gallery" className="nav-link hover:text-[#E87832] transition-colors whitespace-nowrap">
              Portfolio
            </Link>

            <Link href="/industries" className="nav-link hover:text-[#E87832] transition-colors whitespace-nowrap">
              Industries
            </Link>

            <Link href="/bulk-orders" className="nav-link hover:text-[#E87832] transition-colors whitespace-nowrap text-[#E87832] font-bold">
              Bulk Orders
            </Link>

            {/* Track Orders displayed ONLY when user is logged in */}
            {(isClientLoggedIn || isOwnerLoggedIn) && (
              <Link
                href="/orders"
                className="nav-link hover:text-[#E87832] transition-colors whitespace-nowrap text-[#17365D] font-bold flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5 text-[#E87832]" />
                <span>Track Orders</span>
              </Link>
            )}

            <Link href="/contact" className="nav-link hover:text-[#E87832] transition-colors whitespace-nowrap">
              Contact
            </Link>

            {/* Request a Quote CTA Button */}
            <Link
              href="/quote"
              className="bg-[#E87832] hover:bg-[#d66b28] active:scale-[0.98] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs hover:shadow-md whitespace-nowrap flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Request Quote</span>
            </Link>

            {/* Client Account Link (if logged in as client) */}
            {isClientLoggedIn && !isOwnerLoggedIn && (
              <div suppressHydrationWarning className="flex items-center border-l border-slate-200 pl-3">
                <Link
                  href="/orders"
                  className="flex items-center gap-1.5 bg-[#F0F4F8] hover:bg-[#E2E8F0] text-[#17365D] px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
                  title="My Account & Track Orders"
                >
                  <User className="w-3 h-3 text-[#E87832]" />
                  <span className="max-w-[90px] truncate">{clientUser?.first_name || "Account"}</span>
                </Link>
              </div>
            )}

            {/* Client Login Link (if not logged in at all) */}
            {!isClientLoggedIn && !isOwnerLoggedIn && (
              <div suppressHydrationWarning className="flex items-center border-l border-slate-200 pl-3">
                <Link
                  href="/account/login"
                  className="flex items-center gap-1 text-xs text-[#687586] hover:text-[#17365D] transition-colors"
                  title="Client Login"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
              </div>
            )}

            {/* Owner Portal Link */}
            <div suppressHydrationWarning className="flex items-center border-l border-slate-200 pl-3">
              {isOwnerLoggedIn ? (
                <Link
                  href="/owner/dashboard"
                  className="flex items-center gap-1.5 bg-[#17365D] text-white px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-[#102742] transition-colors shadow-xs"
                >
                  <User className="w-3 h-3" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/owner/login"
                  className="flex items-center gap-1 text-xs text-[#687586] hover:text-[#17365D] transition-colors"
                  title="Owner Portal Login"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Owner</span>
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Fast CTA & Hamburger */}
          <div className="flex items-center gap-2 xl:hidden">
            <Link
              href="/quote"
              className="bg-[#E87832] hover:bg-[#d66b28] active:scale-[0.98] text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Quote</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-[#17365D] hover:bg-[#F5F7FA] transition-colors focus:outline-none"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search Input Bar */}
        <div className="pb-2.5 pt-0.5 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search products, models, materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] hover:border-slate-300 focus:border-[#17365D] focus:bg-white focus:ring-4 focus:ring-[#17365D]/10 rounded-lg pl-8 pr-7 py-2 text-base sm:text-xs text-[#263445] placeholder-[#687586] outline-none transition-all"
            />
            <Search className="w-3.5 h-3.5 text-[#687586] absolute left-2.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold p-1"
              >
                ✕
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Mobile Navigation Slide-over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/55 backdrop-blur-xs anim-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 right-0 w-[88vw] max-w-[22rem] h-dvh bg-white shadow-2xl flex flex-col z-50 anim-slide-in-right">
            {/* Drawer Header */}
            <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="inline-block">
                <Image
                  src="/logo.png"
                  alt="Print Planet — The Print Planet™ Wholesale ID Solutions"
                  width={180}
                  height={50}
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-[#F5F7FA] active:bg-[#EEF2F7] transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Nav Items */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors min-h-[44px] ${
                    pathname === "/"
                      ? "bg-[#17365D] text-white shadow-xs font-bold"
                      : "text-[#263445] hover:bg-[#F5F7FA]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Home className={`w-4 h-4 ${pathname === "/" ? "text-[#FFA868]" : "text-[#17365D]"}`} />
                    <span>Home</span>
                  </div>
                </Link>

                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors min-h-[44px] ${
                    pathname === "/products"
                      ? "bg-[#17365D] text-white shadow-xs font-bold"
                      : "text-[#263445] hover:bg-[#F5F7FA]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Package className={`w-4 h-4 ${pathname === "/products" ? "text-[#FFA868]" : "text-[#17365D]"}`} />
                    <span>Products &amp; Machinery</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    pathname === "/products"
                      ? "bg-white/20 text-white"
                      : "bg-[#E87832]/10 text-[#E87832]"
                  }`}>
                    180+ SKUs
                  </span>
                </Link>

                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors min-h-[44px] ${
                    pathname === "/about"
                      ? "bg-[#17365D] text-white shadow-xs font-bold"
                      : "text-[#263445] hover:bg-[#F5F7FA]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Info className={`w-4 h-4 ${pathname === "/about" ? "text-[#FFA868]" : "text-[#17365D]"}`} />
                    <span>About Our Factory</span>
                  </div>
                </Link>

                <Link
                  href="/bulk-orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors min-h-[44px] ${
                    pathname === "/bulk-orders"
                      ? "bg-[#17365D] text-white shadow-xs font-bold"
                      : "text-[#263445] hover:bg-[#F5F7FA]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className={`w-4 h-4 ${pathname === "/bulk-orders" ? "text-[#FFA868]" : "text-[#17365D]"}`} />
                    <span>Bulk Orders (Schools &amp; Corporate)</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Tier Pricing
                  </span>
                </Link>

                {/* Track Orders displayed ONLY when user is logged in */}
                {(isClientLoggedIn || isOwnerLoggedIn) && (
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors min-h-[44px] ${
                      pathname?.startsWith("/orders")
                        ? "bg-[#17365D] text-white shadow-xs font-bold"
                        : "text-[#263445] hover:bg-[#F5F7FA]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className={`w-4 h-4 ${pathname?.startsWith("/orders") ? "text-[#FFA868]" : "text-[#17365D]"}`} />
                      <span>Track My Orders &amp; Chat</span>
                    </div>
                  </Link>
                )}

                <Link
                  href="/services"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors min-h-[44px] ${
                    pathname === "/services"
                      ? "bg-[#17365D] text-white shadow-xs font-bold"
                      : "text-[#263445] hover:bg-[#F5F7FA]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Printer className={`w-4 h-4 ${pathname === "/services" ? "text-[#FFA868]" : "text-[#17365D]"}`} />
                    <span>Printing Services</span>
                  </div>
                </Link>

                <Link
                  href="/gallery"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors min-h-[44px] ${
                    pathname === "/gallery" || pathname === "/portfolio"
                      ? "bg-[#17365D] text-white shadow-xs font-bold"
                      : "text-[#263445] hover:bg-[#F5F7FA]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className={`w-4 h-4 ${pathname === "/gallery" ? "text-[#FFA868]" : "text-[#17365D]"}`} />
                    <span>Portfolio &amp; Showcase</span>
                  </div>
                </Link>

                <Link
                  href="/industries"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors min-h-[44px] ${
                    pathname === "/industries"
                      ? "bg-[#17365D] text-white shadow-xs font-bold"
                      : "text-[#263445] hover:bg-[#F5F7FA]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className={`w-4 h-4 ${pathname === "/industries" ? "text-[#FFA868]" : "text-[#17365D]"}`} />
                    <span>Industries We Supply</span>
                  </div>
                </Link>

                {/* Instant RFQ Card */}
                <div className="pt-1">
                  <Link
                    href="/quote"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3.5 rounded-lg font-semibold text-xs bg-[#E87832] hover:bg-[#d66b28] text-white transition-colors active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-white" />
                      <span>Request Wholesale Quotation</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors min-h-[44px] ${
                    pathname === "/contact"
                      ? "bg-[#17365D] text-white shadow-xs font-bold"
                      : "text-[#263445] hover:bg-[#F5F7FA]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Phone className={`w-4 h-4 ${pathname === "/contact" ? "text-[#FFA868]" : "text-[#17365D]"}`} />
                    <span>Contact Us &amp; Factory Desk</span>
                  </div>
                </Link>
              </div>

              {/* Categories Section (Accordion) */}
              <div className="pt-3 border-t border-[#DCE3EB]">
                <button
                  type="button"
                  onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                  className="w-full flex items-center justify-between px-2 py-2 text-xs font-black text-[#17365D] hover:text-[#E87832] transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#E87832]" />
                    <span>Browse Product Categories</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileCategoriesOpen ? "rotate-180" : ""}`} />
                </button>

                {mobileCategoriesOpen && (
                  <div className="mt-1 space-y-1 pl-1 max-h-60 overflow-y-auto overscroll-contain anim-fade-in">
                    {liveCategories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/categories/${c.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[#263445] hover:bg-[#F5F7FA] hover:text-[#E87832] transition-colors uppercase tracking-wider"
                      >
                        <span className="truncate pr-2 font-bold">{formatCategoryName(c.name)}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full font-mono shrink-0">
                          {c.products_count || 0}
                        </span>
                      </Link>
                    ))}
                    <Link
                      href="/products"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-center text-xs font-bold text-[#E87832] pt-1.5 hover:underline"
                    >
                      View All Products &rarr;
                    </Link>
                  </div>
                )}
              </div>

              {/* Client Account or Login in Mobile Drawer */}
              <div suppressHydrationWarning className="pt-3 border-t border-[#DCE3EB]">
                {isClientLoggedIn ? (
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#F0F4F8] text-[#17365D] text-xs font-bold hover:bg-[#E2E8F0] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#E87832]" />
                    <span>My Account ({clientUser?.first_name || "Client"})</span>
                  </Link>
                ) : !isOwnerLoggedIn ? (
                  <Link
                    href="/account/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#DCE3EB] text-[#17365D] text-xs font-semibold hover:bg-[#F5F7FA] transition-colors"
                  >
                    <LogIn className="w-4 h-4 text-slate-400" />
                    <span>Client Login / Register</span>
                  </Link>
                ) : null}
              </div>

              {/* Owner Portal Link */}
              <div suppressHydrationWarning className="pt-2">
                {isOwnerLoggedIn ? (
                  <Link
                    href="/owner/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#17365D] text-white text-xs font-bold shadow-xs hover:bg-[#102742] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#FFA868]" />
                    <span>Owner Admin Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    href="/owner/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#DCE3EB] text-[#17365D] text-xs font-semibold hover:bg-[#F5F7FA] transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Owner Portal Login</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#DCE3EB] bg-[#F5F7FA] space-y-2">
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=Hello%2C%20I%20am%20enquiring%20about%20ID%20card%20products%20from%20The%20Print%20Planet.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#217A4B] hover:bg-[#1a663e] text-white text-xs font-bold shadow-sm transition-all"
              >
                <span>WhatsApp Direct Inquiry</span>
              </a>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#102742] hover:bg-[#0c1f36] text-white text-xs font-bold transition-all truncate px-2"
                >
                  <Phone className="w-3.5 h-3.5 text-[#E87832] shrink-0" />
                  <span className="truncate">Call Factory</span>
                </a>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#DCE3EB] bg-white text-[#17365D] text-xs font-bold hover:bg-slate-50 transition-all truncate px-2"
                >
                  <Mail className="w-3.5 h-3.5 text-[#E87832] shrink-0" />
                  <span className="truncate">Email RFQ</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
