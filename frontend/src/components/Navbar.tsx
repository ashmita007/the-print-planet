"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  Search,
  Menu,
  X,
  ChevronDown,
  Layers,
  ShieldCheck,
  User,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Category, SiteSettings } from "@/lib/types";

interface NavbarProps {
  categories?: Category[];
  settings?: SiteSettings;
}

export default function Navbar({ categories = [], settings }: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOwnerLoggedIn(!!localStorage.getItem("owner_token"));
    }
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
    <header className="w-full border-b border-[#DCE3EB] bg-white sticky top-0 z-50">
      {/* Top Utility Contact Strip */}
      <div className="bg-[#102742] text-white text-[11px] sm:text-xs py-1 sm:py-2 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 text-slate-300 min-w-0">
            <span className="flex items-center gap-1 font-medium text-white truncate">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E87832] shrink-0" />
              <span className="hidden sm:inline">Verified Industrial Manufacturer & Wholesaler</span>
              <span className="sm:hidden truncate">Verified Manufacturer</span>
            </span>
            <span className="hidden sm:inline-block text-slate-400">|</span>
            <span className="hidden md:inline-block text-slate-300">Bengaluru, Karnataka</span>
            {settings?.gst_number && (
              <>
                <span className="hidden lg:inline-block text-slate-400">|</span>
                <span className="hidden lg:inline-block text-slate-300">
                  GST: <span className="font-semibold text-white">{settings.gst_number}</span>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs font-medium shrink-0">
            <a
              href={`mailto:${email}`}
              className="hidden lg:flex items-center gap-1 text-slate-200 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#E87832]" />
              <span>{email}</span>
            </a>
            <span className="hidden lg:inline text-slate-500">|</span>
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="flex items-center gap-1 text-slate-200 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E87832]" />
              <span className="hidden xs:inline">{phone}</span>
              <span className="xs:hidden">Call</span>
            </a>
            <span className="text-slate-500">|</span>
            <Link
              href="/contact"
              className="bg-[#E87832] hover:bg-[#d66b28] text-white px-2 sm:px-2.5 py-0.5 rounded font-semibold text-[10px] sm:text-[11px] tracking-wide transition-colors"
            >
              Quote
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-3">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group py-1">
            <Image
              src="/logo.png"
              alt="The Print Planet"
              width={200}
              height={55}
              className="h-9 sm:h-12 w-auto object-contain hover:opacity-95 transition-opacity"
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
                className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg pl-10 pr-10 py-2 text-sm text-[#263445] placeholder-[#687586] transition-all outline-none"
              />
              <Search className="w-4 h-4 text-[#687586] absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold bg-[#17365D] text-white px-2 py-0.5 rounded hover:bg-[#102742]"
                >
                  Go
                </button>
              )}
            </div>
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[#263445]">
            <Link href="/" className="hover:text-[#E87832] transition-colors">
              Home
            </Link>

            {/* Products & Services Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="flex items-center gap-1.5 py-2 hover:text-[#E87832] transition-colors focus:outline-none"
              >
                <Layers className="w-4 h-4 text-[#17365D]" />
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Mega Dropdown Menu */}
              {categoriesDropdownOpen && (
                <div className="absolute top-full left-0 w-80 bg-white border border-[#DCE3EB] rounded-lg shadow-xl py-2 mt-1 z-50">
                  <div className="px-4 py-2 border-b border-[#F5F7FA] bg-[#F5F7FA]">
                    <span className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
                      Product Catalogue
                    </span>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto py-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/categories/${cat.slug}`}
                        onClick={() => setCategoriesDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-2 text-xs hover:bg-[#F5F7FA] hover:text-[#E87832] transition-colors border-b border-slate-50 last:border-b-0"
                      >
                        <span className="font-medium text-[#263445]">{cat.name}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {cat.products_count}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="p-2 border-t border-[#DCE3EB] bg-[#F8FAFC]">
                    <Link
                      href="/products"
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="block text-center text-xs font-bold text-[#17365D] hover:text-[#E87832] py-1"
                    >
                      View All Products &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/products" className="hover:text-[#E87832] transition-colors">
              Full Catalogue
            </Link>
            <Link href="/about" className="hover:text-[#E87832] transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="hover:text-[#E87832] transition-colors">
              Contact & RFQ
            </Link>

            {/* Owner Portal Link */}
            <div suppressHydrationWarning className="flex items-center">
              {isOwnerLoggedIn ? (
                <Link
                  href="/owner/dashboard"
                  className="flex items-center gap-1.5 bg-[#17365D] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#102742] transition-colors shadow-sm"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Owner Dashboard</span>
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

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
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
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg pl-8 pr-7 py-2 text-base sm:text-xs text-[#263445] placeholder-[#687586] outline-none transition-all"
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
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 right-0 w-[84vw] max-w-xs bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#DCE3EB] flex items-center justify-between bg-[#102742] text-white">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="bg-white px-2 py-1 rounded-lg inline-block">
                <Image
                  src="/logo.png"
                  alt="The Print Planet"
                  width={140}
                  height={38}
                  className="h-7 w-auto object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Nav Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md font-semibold text-sm text-[#263445] hover:bg-[#F5F7FA]"
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md font-semibold text-sm text-[#263445] hover:bg-[#F5F7FA]"
                >
                  Full Product Catalogue
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md font-semibold text-sm text-[#263445] hover:bg-[#F5F7FA]"
                >
                  About Company
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md font-semibold text-sm text-[#263445] hover:bg-[#F5F7FA]"
                >
                  Request Quote & Contact
                </Link>
              </div>

              {/* Categories Section */}
              <div className="pt-2 border-t border-[#DCE3EB]">
                <p className="px-3 text-xs font-bold text-[#17365D] uppercase tracking-wider mb-2">
                  Categories
                </p>
                <div className="space-y-0.5">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/categories/${c.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded text-xs text-[#263445] hover:bg-[#F5F7FA] hover:text-[#E87832]"
                    >
                      <span className="truncate pr-2">{c.name}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {c.products_count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Owner Portal Link */}
              <div suppressHydrationWarning className="pt-4 border-t border-[#DCE3EB]">
                {isOwnerLoggedIn ? (
                  <Link
                    href="/owner/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#17365D] text-white text-xs font-bold shadow-sm"
                  >
                    <User className="w-4 h-4" />
                    Owner Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/owner/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-[#DCE3EB] text-[#17365D] text-xs font-semibold hover:bg-[#F5F7FA]"
                  >
                    <User className="w-4 h-4" />
                    Owner Portal Login
                  </Link>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#DCE3EB] bg-[#F5F7FA] space-y-2">
              <a
                href={`mailto:${email}`}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-[#DCE3EB] bg-white text-[#17365D] text-xs font-bold"
              >
                <Mail className="w-3.5 h-3.5 text-[#E87832]" />
                {email}
              </a>
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-[#102742] text-white text-xs font-bold"
              >
                <Phone className="w-3.5 h-3.5 text-[#E87832]" />
                Call {phone}
              </a>
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=Hello%2C%20I%20am%20enquiring%20about%20ID%20card%20products.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-[#217A4B] text-white text-xs font-bold"
              >
                WhatsApp Instant Enquiry
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
