"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Send,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Globe,
} from "lucide-react";
import { Category, SiteSettings } from "@/lib/types";
import { formatCategoryName } from "@/lib/formatters";

const CDN_LOGO_URL =
  process.env.NEXT_PUBLIC_LOGO_URL ||
  "https://res.cloudinary.com/pmq4rert/image/upload/v1793343181/the_print_planet/brand/logo_webp.webp";

interface FooterProps {
  categories?: Category[];
  settings?: SiteSettings;
}

export default function Footer({ categories = [], settings }: FooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes("@")) {
      setSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const businessName = settings?.business_name || "THE PRINT PLANET";
  const tagline = settings?.tagline || "Specialist in PVC Cards | Custom Lanyards | Apparel | Corporate Gifting";
  const phone = settings?.phone || "+91 97418 08034";
  const email = settings?.email || "theprintplanet01@gmail.com";
  const address = settings?.address || "No. 33, 34, Srigandhadakaval, Byraveshwaranagar, Near Hanumanthnagar, Sunkadakatte, Bangalore - 560091, Karnataka, India";
  const gst = settings?.gst_number || "29AAQFT3909B1ZZ";
  const pan = "AAQFT3909B";

  return (
    <footer className="bg-[#0A1128] text-white pt-14 sm:pt-20 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Newsletter & B2B Updates Row */}
        <div className="pb-12 mb-12 border-b border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
              Stay Informed • Factory Updates &amp; Bulk Offers
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Subscribe for Wholesale Catalogues &amp; Pricing Drops
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
              Get notified when new raw materials, lanyard satin rolls, smart cards, and machinery arrive in Bangalore stock.
            </p>
          </div>

          <div className="lg:col-span-6">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md lg:ml-auto">
              <input
                type="email"
                placeholder="Enter your business email..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shrink-0 shadow-md"
              >
                {subscribed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* 4 Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: Brand & Credentials (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white px-3 py-2 rounded-xl inline-block shadow-sm">
              <Image
                src={CDN_LOGO_URL}
                alt={businessName}
                width={200}
                height={55}
                className="h-10 w-auto object-contain"
                loading="lazy"
                unoptimized
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              {tagline}. Leading industrial manufacturer and wholesale distributor of identification infrastructure, custom lanyards, printing raw materials, and enterprise promotional gifts.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>GSTIN:</span>
                <span className="font-mono text-slate-200 font-semibold">{gst}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>PAN:</span>
                <span className="font-mono text-slate-200 font-semibold">{pan}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                <span>Tax Compliance:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 100% ITC Eligible
                </span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/919741808034"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-emerald-600 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition-colors"
                title="WhatsApp Support"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/the-print-planet"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-blue-600 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition-colors"
                title="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/theprintplanet"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-pink-600 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.indiamart.com/theprintplanet/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 h-8 rounded-lg bg-slate-900 hover:bg-blue-600 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center text-[11px] font-semibold transition-colors"
                title="IndiaMART Verified Seller"
              >
                IndiaMART
              </a>
            </div>
          </div>

          {/* Column 2: Product Categories (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Featured Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/products?search=lanyard" className="hover:text-blue-400 transition-colors block">
                  Custom Lanyards &amp; Satin Rolls
                </Link>
              </li>
              <li>
                <Link href="/products?search=card" className="hover:text-blue-400 transition-colors block">
                  PVC &amp; Smart RFID Cards
                </Link>
              </li>
              <li>
                <Link href="/products?search=holder" className="hover:text-blue-400 transition-colors block">
                  Rigid ID Card Holders &amp; Cases
                </Link>
              </li>
              <li>
                <Link href="/products?category=id-card-manufacturing-machines" className="hover:text-blue-400 transition-colors block">
                  Card Machinery &amp; Die Cutters
                </Link>
              </li>
              <li>
                <Link href="/corporate" className="hover:text-blue-400 transition-colors block">
                  Corporate Gifting &amp; Hampers
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-blue-400 transition-colors block">
                  Custom Apparel &amp; Uniforms
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors block pt-1">
                  View All 180+ Products &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Corporate & Quick Links (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/about" className="hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/corporate" className="hover:text-blue-400 transition-colors">
                  Corporate Gifting
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-blue-400 transition-colors">
                  Custom Printing
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-blue-400 transition-colors">
                  Portfolio Gallery
                </Link>
              </li>
              <li>
                <Link href="/industries" className="hover:text-blue-400 transition-colors">
                  Industries We Serve
                </Link>
              </li>
              <li>
                <Link href="/quote" className="hover:text-blue-400 transition-colors">
                  Request a Quote
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition-colors">
                  Contact &amp; Factory Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Factory Location (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Factory Headquarters
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>{address}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-white font-mono font-semibold">
                {phone}
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-white">
                {email}
              </a>
            </div>

            <div className="pt-2">
              <Link
                href="/quote"
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md"
              >
                Request Custom Quotation
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Policies and Copyright Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} {businessName}. All rights reserved. Registered in Karnataka, India.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms &amp; Conditions
            </Link>
            <a
              href="https://theprintplanet.co.in/sitemap.xml"
              className="hover:text-slate-300 transition-colors"
            >
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
