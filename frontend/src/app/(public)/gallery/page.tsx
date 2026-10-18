import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
  PhoneCall,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Product Portfolio & Sample Gallery | The Print Planet",
  description:
    "Explore completed production projects, sample deliverables, and high-precision printing runs for lanyards, PVC identity cards, lens packaging, and card manufacturing machinery.",
};

interface GalleryItem {
  id: string;
  title: string;
  category: "lanyards" | "cards" | "packaging" | "machinery";
  categoryLabel: string;
  image: string;
  clientSector: string;
  description: string;
  keySpecs: string[];
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Full-Color Sublimation Lanyards (20mm) with Deluxe Dog Hook",
    category: "lanyards",
    categoryLabel: "Lanyards & Straps",
    image: "/media/products/LAN-ROY-20M.png",
    clientSector: "Corporate IT Park Campus",
    description: "High-density photographic thermal dye sublimation on satin polyester with custom corporate PMS blue and heavy-duty spring dog hooks.",
    keySpecs: ["20mm Width × 900mm Length", "Double-Sided Sublimation", "Deluxe Swivel Dog Hook", "Safety Breakaway Clip"],
  },
  {
    id: "gal-2",
    title: "Crystal Clear Executive PVC Badge Holders (VS-T & C2T)",
    category: "cards",
    categoryLabel: "PVC Badges & Holders",
    image: "/media/products/HLD-VST.png",
    clientSector: "Banking & Financial Services",
    description: "Optically clear, high-durability polycarbonate and PVC badge holders engineered for executive RFID smart cards and security passes.",
    keySpecs: ["Standard CR-80 Fit (85.6 × 54mm)", "100% High-Clarity Transparency", "Dual Slot & Chain Holes", "Anti-Scratch Coating"],
  },
  {
    id: "gal-3",
    title: "Contactless 13.56MHz Mifare 1K Encoded Smart Cards",
    category: "cards",
    categoryLabel: "PVC Badges & Holders",
    image: "/media/products/CRD-MF1K-WHT.png",
    clientSector: "University Campus & Transit",
    description: "Multi-layer thermal laminated contactless RFID smart cards with mirror glossy surface, internal antenna inlay, and high-security chip.",
    keySpecs: ["ISO/IEC 14443 Type A Standard", "1K Byte EEPROM Memory", "Thermal Re-transfer Printable", "Glossy 8K Finish"],
  },
  {
    id: "gal-4",
    title: "WENLIN-New Full Auto 7500Y-10 Card Laminating System",
    category: "machinery",
    categoryLabel: "Industrial Machinery",
    image: "/media/products/MCH-WL-FA7500Y10.jpg",
    clientSector: "National ID & Card Bureau",
    description: "Flagship thermal oil circulation intelligent hydraulic laminator operating in a 10-daylight high-throughput commercial facility.",
    keySpecs: ["600 × 750 mm Platen Format", "10 Hot + 10 Cold Daylights", "8,000 Cards / Hour Output", "±1.0 °C Temperature Accuracy"],
  },
  {
    id: "gal-5",
    title: "High-Speed WL-HSA-3C Automated Servo Card Puncher",
    category: "machinery",
    categoryLabel: "Industrial Machinery",
    image: "/media/products/MCH-WL-HSA3C.jpg",
    clientSector: "Smart Card Manufacturing Bureau",
    description: "A3+ sheet optical sensor punching unit cutting 24-up sheets into CR-80 finished cards with automatic magazine collection.",
    keySpecs: ["20,000 Cards / Hour Speed", "±0.1 mm Optical Precision", "Tungsten Carbide Punch Die", "Automatic Dual Stackers"],
  },
  {
    id: "gal-6",
    title: "Semi-Transparent Frosted PVC ID Holders (HLD-V4 & HLD-H4)",
    category: "cards",
    categoryLabel: "PVC Badges & Holders",
    image: "/media/products/HLD-V4.png",
    clientSector: "Healthcare & Hospital Staff",
    description: "Rigid frosted polymer card holders offering superior flex resistance and seamless insertion for dual RFID credential badges.",
    keySpecs: ["Reinforced Thumb Slot Ejection", "Frosted Anti-Glare Matte Surface", "Universal Clip Mount Slots", "Zero-Crack Polymer Blend"],
  },
  {
    id: "gal-7",
    title: "Frosted Texture Stainless Steel Lamination Plates",
    category: "cards",
    categoryLabel: "PVC Badges & Holders",
    image: "/media/products/CNS-WL-FROST-PLT.jpg",
    clientSector: "Luxury Hotel & Banking Cards",
    description: "Hardened stainless steel lamination plates imparting a fine silk-frosted matte texture on credit cards and VIP passes.",
    keySpecs: ["SUS304 Imported Steel", "HRC 45–48 Hardness", "Over 10,000 Press Lifespan", "Scratch-Resistant Silk Matte"],
  },
  {
    id: "gal-8",
    title: "Heavy-Duty Lanyard Metal Clamps & Dog Hooks (M-Type & D-Type)",
    category: "lanyards",
    categoryLabel: "Lanyards & Straps",
    image: "/media/products/CLP-M16MM.jpg",
    clientSector: "Hardware Distribution Network",
    description: "Industrial nickel-plated stamped steel clamps engineered for permanent crimping on 12mm, 16mm, and 20mm lanyard ribbons.",
    keySpecs: ["High Tensile Holding Force", "Corrosion-Proof Nickel Plating", "Uniform Stamped Edges", "Packed in 1,000-Piece Boxes"],
  },
  {
    id: "gal-9",
    title: "Premium White Satin Sublimation Ribbon Rolls",
    category: "lanyards",
    categoryLabel: "Lanyards & Straps",
    image: "/media/products/LAN-WHI-20M.png",
    clientSector: "Digital Printing & Signage Houses",
    description: "Ultra-smooth dense weave pure white polyester ribbon rolls engineered for high-transfer digital sublimation ink absorption.",
    keySpecs: ["100-Meter Continuous Rolls", "Consistent 20mm Caliber", "Smooth Thermal Transfer Finish", "Zero Web Warping"],
  },
];

export default function GalleryPage() {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-8 sm:space-y-12">
      <Breadcrumbs items={[{ label: "Portfolio & Gallery" }]} />

      {/* Hero */}
      <div className="bg-[#102742] text-white p-6 sm:p-12 rounded-2xl border-l-4 border-[#E87832] shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#E87832]/20 border border-[#E87832]/40 text-[#E87832] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Proof of Craftsmanship & Quality</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Our Portfolio & Product Sample Gallery
          </h1>
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
            Browse through completed batch runs, high-definition sublimation lanyard prints, precision RFID smart cards, optical packaging, and industrial machinery installed across leading institutions.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="bg-[#E87832] hover:bg-[#d66b28] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2"
            >
              <span>Request Custom Sample Kit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/products"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-[#E87832]" />
              <span>Explore Full Catalogue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#17365D]">
              Featured Production Deliverables
            </h2>
            <p className="text-xs text-[#687586] mt-0.5">
              Verified samples manufactured at our Bengaluru industrial facility.
            </p>
          </div>
          <span className="text-xs font-bold text-[#E87832] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full w-fit">
            Showing {GALLERY_ITEMS.length} Certified Showcases
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERY_ITEMS.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#DCE3EB] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 hover:border-[#17365D]/40 flex flex-col group"
            >
              {/* Product Image Frame */}
              <div className="relative h-56 bg-slate-50 border-b border-slate-100 flex items-center justify-center p-6 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={320}
                  height={220}
                  className="max-h-48 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                  unoptimized
                />
                <div className="absolute top-3 left-3 bg-[#17365D]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase">
                  {item.categoryLabel}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-[#E87832]">
                    Delivered to: {item.clientSector}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-[#17365D] leading-snug group-hover:text-[#E87832] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#263445] leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Production Specs:
                    </div>
                    <ul className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                      {item.keySpecs.map((spec, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/quote?product=${encodeURIComponent(item.title)}`}
                    className="text-xs font-bold text-[#17365D] hover:text-[#E87832] transition-colors flex items-center gap-1"
                  >
                    <span>Request Sample / Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <a
                    href={`https://wa.me/919741808034?text=Hi%2C%20I%20am%20interested%20in%20samples%20of%20${encodeURIComponent(item.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-emerald-600 transition-colors"
                    title="Ask on WhatsApp"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Free Sample Policy Callout */}
      <div className="bg-gradient-to-r from-[#17365D] to-[#102742] text-white p-6 sm:p-10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-[#E87832]">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-[#E87832] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Guaranteed Production Match</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">Want to inspect physical samples before ordering?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            We dispatch verified physical sample kits with satin lanyard swatches, acrylic and PVC badge holders, and metal hook fittings directly to your corporate address.
          </p>
        </div>
        <Link
          href="/quote?type=sample_kit"
          className="bg-[#E87832] hover:bg-[#d66b28] text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg shrink-0 flex items-center gap-2"
        >
          <span>Order Physical Sample Kit</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
