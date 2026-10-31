"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
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
  Package,
  ShoppingBag,
  Sparkles,
  Building2,
  FileText,
  Truck,
  ShieldCheck,
  MessageCircle,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { Category, SiteSettings } from "@/lib/types";
import { formatCategoryName } from "@/lib/formatters";
import { getApiUrl } from "@/lib/api";
import { useCart } from "@/lib/cart";

const CDN_LOGO_URL =
  process.env.NEXT_PUBLIC_LOGO_URL ||
  "https://res.cloudinary.com/pmq4rert/image/upload/v1793343181/the_print_planet/brand/logo_webp.webp";

interface NavbarProps {
  categories?: Category[];
  settings?: SiteSettings;
}

export default function Navbar({ categories = [], settings }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, toggleCart } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);
  const [clientUser, setClientUser] = useState<any>(null);
  const [liveCategories, setLiveCategories] = useState<Category[]>(categories);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Rotating announcement bar messages
  const announcements = [
    "🚀 PAN-India Factory-Direct Dispatch | Free Digital Proofs on All Custom Orders",
    "💼 Corporate & Educational Bulk Enquiries: Custom Sample Kits Available",
    "⚡ High-Speed Card Manufacturing Machinery & Satin Lanyards at Wholesale Rates",
  ];
  const [announcementIdx, setAnnouncementIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

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
      // retain existing
    }
  };

  useEffect(() => {
    fetchFreshCategories();
    const handleCategoryUpdate = () => fetchFreshCategories();
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
        const clientTok = localStorage.getItem("client_token");
        const clientUserStr = localStorage.getItem("client_user");
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

  // Lock body scroll on mobile menu
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mobileMenuOpen]);

  // Close dropdown when clicking outside
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

  const phone = settings?.phone || "+91 97418 08034";
  const email = settings?.email || "theprintplanet01@gmail.com";

  return (
    <header className="w-full sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* 1. ANNOUNCEMENT BAR */}
      <div className="bg-[#102742] text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <span className="w-2 h-2 rounded-full bg-[#E87832] animate-pulse shrink-0" />
            <AnimatePresence mode="wait">
              <motion.span
                key={announcementIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="text-slate-200 truncate font-medium"
              >
                {announcements[announcementIdx]}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="hidden md:flex items-center gap-4 shrink-0 text-slate-300">
            <a
              href={`mailto:${email}`}
              className="hover:text-[#FFA868] transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-[#FFA868]" />
              <span>{email}</span>
            </a>
            <span className="text-white/20">|</span>
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="hover:text-[#FFA868] transition-colors flex items-center gap-1.5 font-semibold tabular-nums text-white"
            >
              <Phone className="w-3.5 h-3.5 text-[#FFA868]" />
              <span>{phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-1 text-slate-700 hover:text-[#E87832] hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 py-1" title="The Print Planet Home">
            <Image
              src={CDN_LOGO_URL}
              alt="The Print Planet — Premium Custom Printing & Merchandise"
              width={240}
              height={70}
              className="h-10 sm:h-14 w-auto object-contain"
              priority
              unoptimized
            />
          </Link>

          {/* Search Box (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-3 lg:mx-6 relative items-center"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, ID cards, lanyards, apparel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#E87832] focus:bg-white focus:ring-4 focus:ring-[#E87832]/10 rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-all outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold bg-[#E87832] text-white px-2 py-0.5 rounded-md hover:bg-[#d66b28] transition-colors"
                >
                  Go
                </button>
              )}
            </div>
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs sm:text-[13px] font-semibold text-slate-800">
            {/* Shop by Category Mega Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => {
                  const nextState = !categoriesDropdownOpen;
                  setCategoriesDropdownOpen(nextState);
                  if (nextState) fetchFreshCategories();
                }}
                className="nav-link flex items-center gap-1 hover:text-[#E87832] transition-colors focus:outline-none py-2"
              >
                <span>Shop by Category</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    categoriesDropdownOpen ? "rotate-180 text-[#E87832]" : "text-slate-400"
                  }`}
                />
              </button>

              {/* Mega Dropdown Menu */}
              <AnimatePresence>
                {categoriesDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full left-0 w-[640px] bg-white border border-slate-200 rounded-2xl shadow-2xl py-3 mt-1.5 z-50"
                  >
                    <div className="px-5 py-2.5 border-b border-slate-100 bg-[#F8FAFC] flex items-center justify-between rounded-t-2xl">
                      <span className="text-xs font-bold text-[#17365D] uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#E87832]" /> Complete Catalog Collections
                      </span>
                      <span className="text-[10px] text-[#E87832] font-bold bg-[#FFF7F2] border border-[#E87832]/25 px-2.5 py-0.5 rounded-full">
                        180+ Products Available
                      </span>
                    </div>

                    <div className="max-h-[460px] overflow-y-auto p-4 grid grid-cols-2 gap-3">
                      {(liveCategories.filter((c) => !c.parent).length > 0
                        ? liveCategories.filter((c) => !c.parent)
                        : liveCategories.slice(0, 8)
                      ).map((mainCat) => {
                        const subs = liveCategories.filter((c) => c.parent === mainCat.id);
                        return (
                          <div
                            key={mainCat.id}
                            className="p-3 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-100 hover:border-[#E87832]/40 hover:shadow-sm transition-all"
                          >
                            <Link
                              href={`/products?category=${mainCat.slug}`}
                              onClick={() => setCategoriesDropdownOpen(false)}
                              className="flex items-center justify-between text-xs font-bold text-[#17365D] hover:text-[#E87832] transition-colors mb-1.5 uppercase tracking-wide"
                            >
                              <span className="truncate pr-1">{formatCategoryName(mainCat.name)}</span>
                              <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-full shrink-0 font-normal">
                                {mainCat.products_count || 0}
                              </span>
                            </Link>
                            {subs.length > 0 && (
                              <div className="space-y-1 pl-2 border-l-2 border-slate-200">
                                {subs.slice(0, 3).map((sub) => (
                                  <Link
                                    key={sub.id}
                                    href={`/products?category=${sub.slug}`}
                                    onClick={() => setCategoriesDropdownOpen(false)}
                                    className="block text-[11px] text-slate-600 hover:text-[#E87832] truncate transition-colors font-medium"
                                  >
                                    {formatCategoryName(sub.name)}
                                  </Link>
                                ))}
                                {subs.length > 3 && (
                                  <Link
                                    href={`/products?category=${mainCat.slug}`}
                                    onClick={() => setCategoriesDropdownOpen(false)}
                                    className="block text-[10px] font-bold text-[#E87832] hover:underline pt-0.5"
                                  >
                                    +{subs.length - 3} more &rarr;
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 border-t border-slate-100 bg-[#F8FAFC] flex items-center justify-between px-5 rounded-b-2xl">
                      <span className="text-xs text-slate-500">
                        Need tailored specifications or GST invoicing?
                      </span>
                      <Link
                        href="/products"
                        onClick={() => setCategoriesDropdownOpen(false)}
                        className="text-xs font-bold text-[#E87832] hover:text-[#d66b28] flex items-center gap-1"
                      >
                        <span>View All Products &rarr;</span>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/corporate" className="nav-link hover:text-[#E87832] transition-colors whitespace-nowrap">
              Corporate Gifting
            </Link>

            <Link href="/services" className="nav-link hover:text-[#E87832] transition-colors whitespace-nowrap">
              Custom Printing
            </Link>

            <Link href="/bulk-orders" className="nav-link hover:text-[#E87832] transition-colors whitespace-nowrap font-bold text-[#E87832]">
              Bulk Orders
            </Link>

            <Link href="/about" className="nav-link hover:text-[#E87832] transition-colors whitespace-nowrap">
              About Us
            </Link>

            <Link href="/contact" className="nav-link hover:text-[#E87832] transition-colors whitespace-nowrap">
              Contact
            </Link>
          </nav>

          {/* Action Icons (Cart, Account, Request Quote) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2 sm:p-2.5 rounded-xl border border-slate-200 hover:border-[#E87832]/50 hover:bg-[#FFF7F2] text-slate-700 hover:text-[#E87832] transition-all flex items-center justify-center group"
              title="View Cart & Quote List"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-105" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E87832] text-white text-[10px] font-bold flex items-center justify-center shadow-sm animate-pulse">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            {/* Track Orders / Account */}
            {isClientLoggedIn ? (
              <Link
                href="/orders"
                className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                title="My Orders & Quotes"
              >
                <Package className="w-4 h-4 text-[#17365D]" />
                <span>Orders</span>
              </Link>
            ) : null}

            {/* Request a Quote Button */}
            <Link
              href="/quote"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#E87832] hover:bg-[#d66b28] active:scale-95 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all whitespace-nowrap"
            >
              <FileText className="w-4 h-4" />
              <span>Request Quote</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#0A1128]/60 backdrop-blur-xs"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center"
                >
                  <Image
                    src={CDN_LOGO_URL}
                    alt="The Print Planet"
                    width={180}
                    height={50}
                    className="h-9 w-auto object-contain"
                    unoptimized
                  />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="p-4 border-b border-slate-100">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Search products, cards, apparel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 outline-none focus:border-[#E87832] focus:bg-white"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </form>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1 text-sm font-semibold text-slate-800">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span>Home</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                {/* Categories Accordion */}
                <div className="border border-slate-100 rounded-xl overflow-hidden my-1">
                  <button
                    onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-50/70 text-left font-semibold hover:bg-slate-100 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#E87832]" />
                      <span>Shop by Category</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        mobileCategoriesOpen ? "rotate-180 text-[#E87832]" : ""
                      }`}
                    />
                  </button>
                  {mobileCategoriesOpen && (
                    <div className="p-2 space-y-1 bg-white border-t border-slate-100 max-h-56 overflow-y-auto">
                      <Link
                        href="/products"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-1.5 rounded-lg text-xs font-bold text-[#E87832] hover:bg-[#FFF7F2]"
                      >
                        ★ View All 180+ Products
                      </Link>
                      {liveCategories.map((c) => (
                        <Link
                          key={c.id}
                          href={`/products?category=${c.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 hover:text-[#E87832] truncate"
                        >
                          {formatCategoryName(c.name)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/corporate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#E87832]" />
                    <span>Corporate Gifting</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span>Custom Printing</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/bulk-orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF7F2] text-[#E87832] font-bold hover:bg-[#FFEADA] transition-colors"
                >
                  <span>Bulk Orders &amp; RFQ</span>
                  <span className="text-[10px] bg-[#E87832] text-white px-2 py-0.5 rounded-full">
                    Wholesale
                  </span>
                </Link>

                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span>About Us</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/gallery"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span>Portfolio Gallery</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span>Contact &amp; Support</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2.5">
                <Link
                  href="/quote"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#E87832] hover:bg-[#d66b28] text-white font-semibold text-xs shadow-md"
                >
                  <FileText className="w-4 h-4" />
                  <span>Request Custom Quote</span>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold hover:bg-slate-100"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#E87832]" />
                    <span>Call Us</span>
                  </a>
                  <a
                    href={`https://wa.me/919741808034`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
