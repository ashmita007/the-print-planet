"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
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
  LogOut,
  UserCheck,
} from "lucide-react";
import { Category, SiteSettings } from "@/lib/types";
import { formatCategoryName } from "@/lib/formatters";
import { getApiUrl, clientLogout } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useOverlay, usePresence } from "@/lib/useOverlay";

const CDN_LOGO_URL =
  process.env.NEXT_PUBLIC_LOGO_URL ||
  "https://res.cloudinary.com/pmq4rert/image/upload/v1793343181/the_print_planet/brand/logo_webp.webp";

const ANNOUNCEMENTS = [
  "PAN-India Factory-Direct Dispatch | Free Digital Proofs on All Custom Orders",
  "Corporate & Educational Bulk Enquiries: Custom Sample Kits Available",
  "High-Speed Card Manufacturing Machinery & Satin Lanyards at Wholesale Rates",
];

const NAV_ITEMS = [
  { href: "/corporate", label: "Corporate & Bulk" },
  { href: "/services", label: "Custom Printing" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

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
  const [liveCategories, setLiveCategories] = useState<Category[]>(Array.isArray(categories) ? categories : []);
  const [mounted, setMounted] = useState(false);
  const [searchRowOpen, setSearchRowOpen] = useState(false);
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const announcementRef = useRef<HTMLSpanElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const rowSearchRef = useRef<HTMLInputElement>(null);
  const previousTotal = useRef(0);

  const { mounted: megaMenuMounted, ref: megaMenuRef } = usePresence<HTMLDivElement>(categoriesDropdownOpen, { autoAlpha: 0, y: 10, scale: 0.98 });
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const { mounted: drawerMounted, ref: drawerRef } = useOverlay<HTMLDivElement>(mobileMenuOpen, closeMobileMenu, { x: "-100%" });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll progress line and a slightly tighter header once the page is moving.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.fromTo(progressRef.current, { scaleX: 0 }, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      });

      ScrollTrigger.create({
        start: 80,
        end: "max",
        onToggle: (self) => {
          headerRef.current?.classList.toggle("shadow-md", self.isActive);
          gsap.to(logoRef.current, { scale: self.isActive ? 0.88 : 1, duration: 0.3, ease: "power2.out" });
        },
      });
    },
    { scope: headerRef }
  );

  // Announcement bar: slide out, swap text, slide in.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const timer = setInterval(() => {
      gsap.to(announcementRef.current, {
        y: -8,
        autoAlpha: 0,
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => setAnnouncementIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length),
      });
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (announcementIdx === 0 && !gsap.getProperty(announcementRef.current, "y")) return;
    gsap.fromTo(announcementRef.current, { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.3, ease: "power3.out" });
  }, [announcementIdx]);

  // Cart icon reacts whenever the item count goes up.
  useEffect(() => {
    if (mounted && totalItems > previousTotal.current && !prefersReducedMotion()) {
      gsap.fromTo(cartButtonRef.current, { scale: 0.8 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.45)" });
    }
    previousTotal.current = totalItems;
  }, [totalItems, mounted]);

  // ⌘K / Ctrl+K opens search, and Escape closes the mega menu.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (desktopSearchRef.current?.offsetParent) {
          desktopSearchRef.current.focus();
        } else {
          setSearchRowOpen(true);
        }
      }
      if (e.key === "Escape") {
        setCategoriesDropdownOpen(false);
        setSearchRowOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (searchRowOpen) rowSearchRef.current?.focus();
  }, [searchRowOpen]);

  // Single hover pill that glides between links.
  const movePill = (e: React.MouseEvent<HTMLElement>) => {
    const nav = navRef.current;
    const pill = pillRef.current;
    if (!nav || !pill) return;
    const navBox = nav.getBoundingClientRect();
    const box = e.currentTarget.getBoundingClientRect();
    const firstMove = gsap.getProperty(pill, "opacity") === 0;
    gsap.to(pill, {
      x: box.left - navBox.left,
      width: box.width,
      autoAlpha: 1,
      duration: firstMove || prefersReducedMotion() ? 0 : 0.35,
      ease: "power3.out",
    });
  };

  const hidePill = () => {
    gsap.to(pillRef.current, { autoAlpha: 0, duration: 0.2 });
  };

  useEffect(() => {
    if (Array.isArray(categories) && categories.length > 0) {
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
        const list = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
        if (list.length > 0) {
          setLiveCategories(list);
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoriesDropdownOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
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
      setSearchRowOpen(false);
    }
  };

  const phone = settings?.phone || "+91 97418 08034";
  const email = settings?.email || "theprintplanet01@gmail.com";
  const safeCategories = Array.isArray(liveCategories) ? liveCategories : [];

  return (
    <header
      ref={headerRef}
      className="w-full sticky -top-8 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-shadow duration-300"
    >
      {/* 1. ANNOUNCEMENT BAR */}
      <div className="h-8 flex items-center bg-[#121418] text-white text-[11px] sm:text-xs px-3 sm:px-6">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <span ref={announcementRef} className="text-slate-200 truncate font-medium">
              {ANNOUNCEMENTS[announcementIdx]}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 shrink-0 text-slate-300">
            <a
              href={`mailto:${email}`}
              className="hover:text-[#B9C3CF] transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-[#FF8A3D]" />
              <span>{email}</span>
            </a>
            <span className="text-white/20">|</span>
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="hover:text-[#B9C3CF] transition-colors flex items-center gap-1.5 font-semibold tabular-nums text-white"
            >
              <Phone className="w-3.5 h-3.5 text-[#FF8A3D]" />
              <span>{phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
        <div className="flex items-center justify-between h-16 lg:h-[4.5rem] gap-2 sm:gap-3 xl:gap-5">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-1 text-slate-700 hover:text-[#353C45] hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Brand Logo */}
          <Link ref={logoRef} href="/" className="flex items-center gap-2 shrink-0 py-1 origin-left mr-auto lg:mr-0" title="The Print Planet Home">
            <Image
              src={CDN_LOGO_URL}
              alt="The Print Planet — Premium Custom Printing & Merchandise"
              width={240}
              height={70}
              className="h-10 sm:h-12 w-auto object-contain"
              priority
              unoptimized
            />
          </Link>

          {/* Search Box (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="hidden xl:flex xl:order-last flex-1 min-w-0 max-w-sm relative items-center"
          >
            <div className="relative w-full group">
              <input
                ref={desktopSearchRef}
                type="search"
                aria-label="Search products"
                placeholder="Search products, ID cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#EDF1F6] hover:bg-[#FFFFFF] focus:bg-[#FFFFFF] border border-[#DFE6EE] hover:border-[#121418]/30 focus:border-[#B9C3CF] focus:ring-4 focus:ring-[#B9C3CF]/10 rounded-md pl-9 pr-14 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-all outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#353C45] transition-colors" />
              {searchQuery ? (
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold bg-[#F26B1D] text-[#121418] px-2 py-0.5 rounded-md hover:bg-[#FF8A3D] transition-colors"
                >
                  Go
                </button>
              ) : (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-[#FFFFFF] border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
                  ⌘K
                </span>
              )}
            </div>
          </form>

          {/* Desktop Navigation with one gliding hover pill */}
          <nav
            ref={navRef}
            aria-label="Primary"
            onMouseLeave={hidePill}
            className="relative isolate hidden lg:flex items-center gap-0.5 text-[13px] font-semibold text-slate-800 shrink-0"
          >
            <span
              ref={pillRef}
              aria-hidden="true"
              style={{ opacity: 0, visibility: "hidden" }}
              className="absolute left-0 top-0 h-full -z-10 bg-[#EDF1F6] border border-[#B9C3CF]/25 rounded-md"
            />

            {/* Shop by Category Mega Dropdown */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={movePill}
            >
              <button
                type="button"
                onClick={() => {
                  const nextState = !categoriesDropdownOpen;
                  setCategoriesDropdownOpen(nextState);
                  if (nextState) fetchFreshCategories();
                }}
                aria-expanded={categoriesDropdownOpen}
                aria-haspopup="true"
                className={`relative px-3 py-2 rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  categoriesDropdownOpen ? "text-[#353C45] font-bold" : "text-[#121418] hover:text-[#353C45]"
                }`}
              >
                <span>Shop by Category</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    categoriesDropdownOpen ? "rotate-180 text-[#353C45]" : "text-slate-400"
                  }`}
                />
              </button>

              {/* Mega Dropdown Menu */}
              <>
                {megaMenuMounted && (
                  <div
                    ref={megaMenuRef}
                    data-panel
                    className="absolute top-full left-0 w-[640px] bg-white/98 backdrop-blur-lg border border-[#DFE6EE] rounded-lg shadow-[0_20px_50px_-10px_rgba(16,39,66,0.18)] py-3 mt-2 z-50 overflow-hidden"
                  >
                    <div className="px-5 py-2.5 border-b border-slate-100 bg-[#EDF1F6] flex items-center justify-between rounded-t-2xl">
                      <span className="text-xs font-bold text-[#121418] uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#353C45]" /> Complete Catalog Collections
                      </span>
                      <span className="text-[10px] text-[#353C45] font-bold bg-[#EDF1F6] border border-[#B9C3CF]/25 px-2.5 py-0.5 rounded-full">
                        180+ Products Available
                      </span>
                    </div>

                    <div className="max-h-[460px] overflow-y-auto p-4 grid grid-cols-2 gap-3">
                      {(safeCategories.filter((c) => !c.parent).length > 0
                        ? safeCategories.filter((c) => !c.parent)
                        : safeCategories.slice(0, 8)
                      ).map((mainCat) => {
                        const subs = safeCategories.filter((c) => c.parent === mainCat.id);
                        return (
                          <div
                            key={mainCat.id}
                            className="p-3 rounded-md bg-slate-50/80 hover:bg-[#FFFFFF] border border-slate-100 hover:border-[#B9C3CF]/40 hover:shadow-sm transition-all"
                          >
                            <Link
                              href={`/products?category=${mainCat.slug}`}
                              onClick={() => setCategoriesDropdownOpen(false)}
                              className="flex items-center justify-between text-xs font-bold text-[#121418] hover:text-[#353C45] transition-colors mb-1.5 uppercase tracking-wide"
                            >
                              <span className="truncate pr-1">{formatCategoryName(mainCat.name)}</span>
                              <span className="text-[10px] text-slate-500 bg-[#FFFFFF] border border-slate-200 px-1.5 py-0.5 rounded-full shrink-0 font-normal">
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
                                    className="block text-[11px] text-slate-600 hover:text-[#353C45] truncate transition-colors font-medium"
                                  >
                                    {formatCategoryName(sub.name)}
                                  </Link>
                                ))}
                                {subs.length > 3 && (
                                  <Link
                                    href={`/products?category=${mainCat.slug}`}
                                    onClick={() => setCategoriesDropdownOpen(false)}
                                    className="block text-[10px] font-bold text-[#353C45] hover:underline pt-0.5"
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

                    <div className="p-3 border-t border-slate-100 bg-[#EDF1F6] flex items-center justify-between px-5 rounded-b-2xl">
                      <span className="text-xs text-slate-500">
                        Need tailored specifications or GST invoicing?
                      </span>
                      <Link
                        href="/products"
                        onClick={() => setCategoriesDropdownOpen(false)}
                        className="text-xs font-bold text-[#353C45] hover:text-[#2B323B] flex items-center gap-1"
                      >
                        <span>View All Products &rarr;</span>
                      </Link>
                    </div>
                  </div>
                )}
              </>
            </div>

            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={movePill}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-3 py-2 rounded-md whitespace-nowrap transition-colors ${
                    active ? "text-[#2B323B] font-bold" : "text-slate-700 hover:text-[#2B323B]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons (Cart, Account, Request Quote) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 xl:order-last">
            {/* Compact search below xl */}
            <button
              type="button"
              onClick={() => setSearchRowOpen((open) => !open)}
              aria-label="Search products"
              aria-expanded={searchRowOpen}
              className="xl:hidden p-2.5 rounded-md border border-slate-200 hover:border-[#B9C3CF]/60 hover:bg-[#EDF1F6] text-slate-700 hover:text-[#353C45] transition-colors shadow-2xs"
            >
              {searchRowOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            <button
              ref={cartButtonRef}
              type="button"
              onClick={toggleCart}
              className="relative p-2.5 rounded-md border border-slate-200 hover:border-[#B9C3CF]/60 hover:bg-[#EDF1F6] text-slate-700 hover:text-[#353C45] transition-all flex items-center justify-center group shadow-2xs cursor-pointer"
              title="View Cart & Quote List"
              aria-label={mounted && totalItems > 0 ? `View cart, ${totalItems} items` : "View cart"}
            >
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
              {mounted && totalItems > 0 && (
                <span
                  className="anim-scale-in absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 rounded-full bg-[#121418] text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm"
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            {/* Track Orders / Account / Sign In */}
            {isClientLoggedIn ? (
              <div className="relative hidden sm:block" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-1.5 bg-[#EDF1F6] hover:bg-slate-200 text-[#121418] px-3 py-2 rounded-md text-xs font-bold transition-colors cursor-pointer"
                  title="My Account & Orders"
                >
                  <User className="w-3.5 h-3.5 text-[#353C45]" />
                  <span className="max-w-[100px] truncate">
                    {clientUser?.first_name || clientUser?.username || "Account"}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg shadow-xl py-1.5 z-50 text-xs">
                    <div className="px-3.5 py-2.5 border-b border-slate-100 bg-[#EDF1F6]">
                      <p className="font-bold text-[#121418] truncate">
                        {clientUser?.first_name ? `${clientUser.first_name} ${clientUser.last_name || ""}`.trim() : clientUser?.username || "Client"}
                      </p>
                      <p className="text-[10px] text-[#353C45] truncate">{clientUser?.email || ""}</p>
                    </div>
                    <Link
                      href="/orders"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 hover:bg-[#EDF1F6] text-slate-700 hover:text-[#121418] font-medium transition-colors"
                    >
                      <Package className="w-3.5 h-3.5 text-[#353C45]" />
                      <span>My Orders &amp; Chats</span>
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 hover:bg-[#EDF1F6] text-slate-700 hover:text-[#121418] font-medium transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-[#353C45]" />
                      <span>Profile &amp; Settings</span>
                    </Link>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      type="button"
                      onClick={async () => {
                        setAccountMenuOpen(false);
                        await clientLogout();
                        router.push("/account/login");
                      }}
                      className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-red-600 hover:bg-red-50 font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/account/login"
                className="hidden sm:flex items-center gap-1.5 bg-[#EDF1F6] hover:bg-slate-200 text-[#121418] px-3 py-2 rounded-md text-xs font-bold transition-colors"
                title="Client Sign In"
              >
                <User className="w-3.5 h-3.5 text-[#353C45]" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Request a Quote Button with Motion Elevation */}
            <Link
                href="/quote"
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] px-4 py-2.5 rounded-md text-sm font-bold transition-colors whitespace-nowrap cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Request Quote</span>
              </Link>
          </div>
        </div>
      </div>

      {/* Compact search row */}
      {searchRowOpen && (
        <div className="xl:hidden border-t border-slate-100 bg-[#FFFFFF] px-3.5 sm:px-6 py-2.5 anim-fade-in">
          <form onSubmit={handleSearchSubmit} role="search" className="relative max-w-7xl mx-auto">
            <input
              ref={rowSearchRef}
              type="search"
              aria-label="Search products"
              placeholder="Search products, ID cards, lanyards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#B9C3CF] focus:bg-[#FFFFFF] rounded-md pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      )}

      {/* Scroll progress */}
      <div
        ref={progressRef}
        aria-hidden="true"
        style={{ transform: "scaleX(0)" }}
        className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#F26B1D] origin-left"
      />

      {/* 3. MOBILE NAVIGATION DRAWER: portalled because the header's backdrop-filter
          would otherwise become the containing block and collapse this fixed layer. */}
      {drawerMounted && createPortal(
          <div ref={drawerRef} className="fixed inset-0 z-[60] lg:hidden flex">
            {/* Backdrop */}
            <div
              data-backdrop
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#121418]/60 backdrop-blur-xs"
            />

            {/* Drawer */}
            <div
              data-panel
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              tabIndex={-1}
              className="relative w-full max-w-xs sm:max-w-sm bg-[#FFFFFF] h-[100dvh] shadow-2xl flex flex-col z-10 outline-none"
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
                  className="w-9 h-9 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="p-4 border-b border-slate-100">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="search"
                    aria-label="Search products"
                    placeholder="Search products, cards, apparel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-4 py-2 text-xs text-slate-900 outline-none focus:border-[#B9C3CF] focus:bg-[#FFFFFF]"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </form>
              </div>

              {/* Mobile Client Authentication Block */}
              <div className="p-4 border-b border-slate-100 bg-[#EDF1F6]">
                {isClientLoggedIn ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#121418] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {(clientUser?.first_name?.[0] || clientUser?.username?.[0] || "U").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#121418] truncate">
                            {clientUser?.first_name ? `${clientUser.first_name} ${clientUser.last_name || ""}`.trim() : clientUser?.username || "Client"}
                          </p>
                          <p className="text-[10px] text-[#353C45] truncate">{clientUser?.email || ""}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          setMobileMenuOpen(false);
                          await clientLogout();
                          router.push("/account/login");
                        }}
                        className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href="/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#FFFFFF] border border-[#DFE6EE] rounded-md text-xs font-bold text-[#121418] shadow-2xs"
                      >
                        <Package className="w-3.5 h-3.5 text-[#353C45]" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#FFFFFF] border border-[#DFE6EE] rounded-md text-xs font-bold text-[#121418] shadow-2xs"
                      >
                        <User className="w-3.5 h-3.5 text-[#353C45]" />
                        <span>Profile Hub</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/account/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#121418] text-white rounded-md text-xs font-bold shadow-2xs"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/account/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FFFFFF] border border-[#DFE6EE] text-[#121418] rounded-md text-xs font-bold hover:bg-slate-50"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      <span>Register</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1 text-sm font-semibold text-slate-800">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <span>Home</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                {/* Categories Accordion */}
                <div className="border border-slate-100 rounded-md overflow-hidden my-1">
                  <button
                    onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-50/70 text-left font-semibold hover:bg-slate-100 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#353C45]" />
                      <span>Shop by Category</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        mobileCategoriesOpen ? "rotate-180 text-[#353C45]" : ""
                      }`}
                    />
                  </button>
                  {mobileCategoriesOpen && (
                    <div className="p-2 space-y-1 bg-[#FFFFFF] border-t border-slate-100 max-h-56 overflow-y-auto">
                      <Link
                        href="/products"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-1.5 rounded-lg text-xs font-bold text-[#353C45] hover:bg-[#EDF1F6]"
                      >
                        View All 180+ Products
                      </Link>
                      {safeCategories.map((c) => (
                        <Link
                          key={c.id}
                          href={`/products?category=${c.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 hover:text-[#353C45] truncate"
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
                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#353C45]" />
                    <span>Corporate &amp; Bulk Orders</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <span>Custom Printing</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <span>About Us</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/gallery"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <span>Portfolio Gallery</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-slate-50 transition-colors"
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
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] font-semibold text-xs shadow-md"
                >
                  <FileText className="w-4 h-4" />
                  <span>Request Custom Quote</span>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-md bg-[#FFFFFF] border border-slate-200 text-slate-800 text-xs font-semibold hover:bg-slate-100"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#353C45]" />
                    <span>Call Us</span>
                  </a>
                  <a
                    href={`https://wa.me/919741808034`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>,
          document.body
      )}
    </header>
  );
}
