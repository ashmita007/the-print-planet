import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Category, SiteSettings } from "@/lib/types";

const CDN_LOGO_URL =
  process.env.NEXT_PUBLIC_LOGO_URL ||
  "https://res.cloudinary.com/pmq4rert/image/upload/v1793343181/the_print_planet/brand/logo_webp.webp";

interface FooterProps {
  categories?: Category[];
  settings?: SiteSettings;
}

const SHOP_LINKS = [
  { href: "/categories/machines", label: "ID card machines" },
  { href: "/categories/indian-satin-digital-lanyard-roll", label: "Satin lanyard rolls" },
  { href: "/categories/id-card-holder", label: "ID card holders" },
  { href: "/categories/pvc-id-card-consumable", label: "PVC fusing sheets" },
  { href: "/categories/rfid-cansumables", label: "RFID cards" },
  { href: "/products", label: "All products" },
];

const COMPANY_LINKS = [
  { href: "/corporate", label: "Bulk orders" },
  { href: "/services", label: "Services" },
  { href: "/industries", label: "Industries" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function FooterLinks({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-xs font-bold text-white mb-3.5">{title}</h2>
      <ul className="space-y-2.5 text-sm text-slate-300">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-[#B9C3CF] transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer({ settings }: FooterProps) {
  const businessName = settings?.business_name || "THE PRINT PLANET";
  const tagline = settings?.tagline || "Specialist in PVC Cards | Custom Lanyards | Apparel | Corporate Gifting";
  const phone = settings?.phone || "+91 97418 08034";
  const email = settings?.email || "theprintplanet01@gmail.com";
  const address = settings?.address || "No. 33, 34, Srigandhadakaval, Byraveshwaranagar, Near Hanumanthnagar, Sunkadakatte, Bangalore - 560091, Karnataka, India";
  const gst = settings?.gst_number || "29AAQFT3909B1ZZ";

  return (
    <footer className="bg-[#22272E] text-white pt-12 sm:pt-16 pb-24 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-10 pb-10 border-b border-white/10">
          <div className="col-span-2 lg:col-span-4 space-y-4">
            <div className="bg-[#FFFFFF] px-3 py-2 rounded-md inline-block">
              <Image
                src={CDN_LOGO_URL}
                alt={businessName}
                width={200}
                height={55}
                className="h-9 w-auto object-contain"
                loading="lazy"
                unoptimized
              />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xs">{tagline}</p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/919741808034"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#217A4B] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors"
                title="WhatsApp Support"
                aria-label="WhatsApp Support"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/the-print-planet"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#B9C3CF] text-slate-300 hover:text-[#22272E] border border-white/10 flex items-center justify-center transition-colors"
                title="LinkedIn"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/theprintplanet"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#B9C3CF] text-slate-300 hover:text-[#22272E] border border-white/10 flex items-center justify-center transition-colors"
                title="Instagram"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.indiamart.com/theprintplanet/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 h-8 rounded-lg bg-white/10 hover:bg-[#B9C3CF] text-slate-300 hover:text-[#22272E] border border-white/10 flex items-center justify-center text-[11px] font-semibold transition-colors"
                title="IndiaMART Verified Seller"
              >
                IndiaMART
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <FooterLinks title="Shop" links={SHOP_LINKS} />
          </div>
          <div className="lg:col-span-2">
            <FooterLinks title="Company" links={COMPANY_LINKS} />
          </div>

          <div className="col-span-2 lg:col-span-4 space-y-3 text-sm text-slate-300">
            <h2 className="text-xs font-bold text-white mb-3.5">Reach us</h2>
            <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-center gap-2.5 hover:text-white">
              <Phone className="w-4 h-4 text-[#FF8A3D] shrink-0" />
              {phone}
            </a>
            <a href={`mailto:${email}`} className="flex items-center gap-2.5 hover:text-white break-all">
              <Mail className="w-4 h-4 text-[#FF8A3D] shrink-0" />
              {email}
            </a>
            <p className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#FF8A3D] shrink-0 mt-0.5" />
              <span>{address}</span>
            </p>
            <Link
              href="/quote"
              className="inline-flex items-center justify-center mt-1 py-2.5 px-5 rounded-lg bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#22272E] font-bold transition-colors"
            >
              Get a quote
            </Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} {businessName}. GSTIN {gst}
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
