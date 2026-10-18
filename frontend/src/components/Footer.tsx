import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ShieldCheck, Lock, ExternalLink } from "lucide-react";
import { Category, SiteSettings } from "@/lib/types";

interface FooterProps {
  categories?: Category[];
  settings?: SiteSettings;
}

export default function Footer({ categories = [], settings }: FooterProps) {
  const businessName = settings?.business_name || "THE PRINT PLANET";
  const tagline = settings?.tagline || "Delivering Excellence in PVC Cards | Lens Packaging | Commercial Printing Solutions";
  const phone = settings?.phone || "+91 97418 08034";
  const email = settings?.email || "theprintplanet01@gmail.com";
  const address = settings?.address || "No.17, Ground Floor, 7th Main, 13th Cross Rd, Agrahara Dasarahalli, Rajajinagar Industrial Town, Bengaluru (Bangalore) Urban, Bengaluru - 560079, Karnataka, India";
  const gst = settings?.gst_number || "29AAQFT3909B1ZZ";
  const pan = "AAQFT3909B";
  const footerText = settings?.footer_text || "Delivering Excellence in PVC Cards | Lens Packaging | Commercial Printing Solutions. ✱ Your Vision is Our Focus ✱";

  return (
    <footer className="bg-[#17365D] text-white pt-10 sm:pt-16 pb-8 sm:pb-12 border-t-4 border-[#E87832]">
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
            <p className="text-xs font-semibold text-[#E87832] tracking-wide">
              ✱ Your Vision is Our Focus ✱
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              {footerText}
            </p>
            <div className="pt-2 space-y-1.5">
              <div className="inline-flex items-center gap-1.5 bg-[#102742] text-xs px-3 py-1.5 rounded text-slate-200 border border-white/10 w-full">
                <ShieldCheck className="w-4 h-4 text-[#E87832] shrink-0" />
                <span>GSTIN: <strong className="text-white">{gst}</strong></span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-[#102742] text-xs px-3 py-1.5 rounded text-slate-200 border border-white/10 w-full">
                <ShieldCheck className="w-4 h-4 text-[#E87832] shrink-0" />
                <span>PAN: <strong className="text-white">{pan}</strong></span>
              </div>
            </div>
          </div>

          {/* Column 2: Key Product Categories */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E87832] rounded-full inline-block" />
              Catalogue Categories
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {categories.slice(0, 7).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/categories/${c.slug}`}
                    className="hover:text-[#E87832] hover:underline transition-colors block truncate"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/products"
                  className="text-[#E87832] font-semibold hover:underline block pt-1"
                >
                  View All Products &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation (9 Core Sections) */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E87832] rounded-full inline-block" />
              Main Sections
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5 text-xs text-slate-300">
              <li>
                <Link href="/" className="hover:text-[#E87832] transition-colors">
                  1. Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#E87832] transition-colors">
                  2. About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#E87832] transition-colors">
                  3. Products & Catalogue
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#E87832] transition-colors">
                  4. Printing Services
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#E87832] transition-colors">
                  5. Portfolio & Gallery
                </Link>
              </li>
              <li>
                <Link href="/industries" className="hover:text-[#E87832] transition-colors">
                  6. Industries We Serve
                </Link>
              </li>
              <li>
                <Link href="/corporate" className="hover:text-[#E87832] transition-colors">
                  7. Bulk & Corporate Orders
                </Link>
              </li>
              <li>
                <Link href="/quote" className="text-[#E87832] font-bold hover:underline">
                  8. Request a Quote &rarr;
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#E87832] transition-colors">
                  9. Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Factory Headquarters */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E87832] rounded-full inline-block" />
              Industrial Sales Office
            </h3>
            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-[#E87832] shrink-0 mt-0.5" />
              <span>{address}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Phone className="w-4 h-4 text-[#E87832] shrink-0" />
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-white transition-colors">
                {phone}
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Mail className="w-4 h-4 text-[#E87832] shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                {email}
              </a>
            </div>

            <div className="pt-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center w-full bg-[#E87832] hover:bg-[#d66b28] text-white py-2 px-3 rounded-lg text-xs font-bold transition-colors shadow-sm"
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
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            >
              <Lock className="w-3 h-3 text-[#E87832]" />
              <span>Owner Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
