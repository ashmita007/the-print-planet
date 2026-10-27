import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Lock, ExternalLink } from "lucide-react";
import { Category, SiteSettings } from "@/lib/types";
import { formatCategoryName } from "@/lib/formatters";

interface FooterProps {
  categories?: Category[];
  settings?: SiteSettings;
}

export default function Footer({ categories = [], settings }: FooterProps) {
  const businessName = settings?.business_name || "THE PRINT PLANET";
  const tagline = settings?.tagline || "Specialist in PVC Cards | Lens Packaging & Cleaning | Commercial Printing | Bulk ID Solutions";
  const phone = settings?.phone || "+91 97418 08034";
  const email = settings?.email || "theprintplanet01@gmail.com";
  const address = settings?.address || "No. 33, 34, Srigandhadakaval, Byraveshwaranagar, Near Hanumanthnagar, Sunkadakatte, Bangalore - 560091, Karnataka, India";
  const gst = settings?.gst_number || "29AAQFT3909B1ZZ";
  const pan = "AAQFT3909B";
  const footerText = settings?.footer_text || `THE PRINT PLANET — ${tagline}. ✱ Your Vision is Our Focus ✱. GSTIN: ${gst} | PAN: ${pan}.`;

  return (
    <footer className="bg-[#102742] text-white pt-12 sm:pt-16 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pb-8 sm:pb-12 border-b border-white/15">
          {/* Column 1: Company Profile */}
          <div className="space-y-4">
            <div className="bg-white px-4 py-2.5 rounded-xl inline-block shadow-sm">
              <Image
                src="/logo.png"
                alt={businessName}
                width={220}
                height={60}
                className="h-11 sm:h-13 w-auto object-contain"
              />
            </div>
            <p className="text-xs font-medium text-slate-400 leading-relaxed tracking-wide">
              {tagline}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              {footerText}
            </p>
            <div className="pt-1 space-y-1 text-[11px] text-slate-400">
              <p>GSTIN <span className="text-slate-200">{gst}</span></p>
              <p>PAN <span className="text-slate-200">{pan}</span></p>
            </div>

            {/* Verified B2B Marketplace Outbound Citations */}
            <div className="pt-1">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.14em] block mb-2">
                Marketplace profiles
              </span>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <a
                  href="https://www.indiamart.com/theprintplanet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                  title="The Print Planet on IndiaMART"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  <span>IndiaMART</span>
                </a>
                <a
                  href="https://www.justdial.com/Bangalore/The-Print-Planet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                  title="The Print Planet on Justdial"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  <span>Justdial</span>
                </a>
                <a
                  href="https://www.tradeindia.com/Seller-19717145-The-Print-Planet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                  title="The Print Planet on TradeIndia"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  <span>TradeIndia</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Key Product Categories */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-4">
              Catalogue
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {categories.slice(0, 7).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/categories/${c.slug}`}
                    className="hover:text-white transition-colors block truncate"
                  >
                    {formatCategoryName(c.name)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/products"
                  className="text-slate-400 hover:text-white transition-colors block pt-1"
                >
                  View All Products &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation (9 Core Sections) */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-4">
              Explore
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5 text-xs text-slate-300">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Products & Catalogue
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Printing Services
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  Portfolio & Gallery
                </Link>
              </li>
              <li>
                <Link href="/industries" className="hover:text-white transition-colors">
                  Industries We Serve
                </Link>
              </li>
              <li>
                <Link href="/corporate" className="hover:text-white transition-colors">
                  Bulk & Corporate Orders
                </Link>
              </li>
              <li>
                <Link href="/quote" className="text-slate-400 hover:text-white transition-colors">
                  Request a Quote
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Factory Headquarters */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-4">
              Contact
            </h3>
            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>{address}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Phone className="w-4 h-4 text-slate-500 shrink-0" />
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-white transition-colors">
                {phone}
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Mail className="w-4 h-4 text-slate-500 shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                {email}
              </a>
            </div>

            <div className="pt-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center w-full bg-[#E87832] hover:bg-[#d66b28] text-white py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors"
              >
                Request Custom Quotation
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p suppressHydrationWarning>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link
              href="/owner/login"
              className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Owner Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
