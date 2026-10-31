"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, Layers } from "lucide-react";
import TextReveal from "./animations/TextReveal";
import KineticHighlight from "./animations/KineticHighlight";

interface CategoryCard {
  id: string;
  name: string;
  subtitle: string;
  itemCount: string;
  href: string;
  image: string;
  badge?: string;
}

const FEATURED_CATEGORIES: CategoryCard[] = [
  {
    id: "lanyards",
    name: "Custom Lanyards",
    subtitle: "Multicolour satin, heat-transfer, sublimation rolls & tubular cords",
    itemCount: "40+ Variants",
    href: "/products?search=lanyard",
    image: "/media/products/LAN-ROY-20M.png",
    badge: "Best Seller",
  },
  {
    id: "id-cards",
    name: "PVC & RFID ID Cards",
    subtitle: "CR-80 ISO cards, inkjet fusing sheets, 1K RFID & smart inlays",
    itemCount: "35+ Variants",
    href: "/products?search=card",
    image: "/media/products/CRD-MF1K-WHT.png",
    badge: "Factory Direct",
  },
  {
    id: "apparel",
    name: "Custom T-Shirts & Apparel",
    subtitle: "Corporate polo, dry-fit event tees, hoodies & institutional uniforms",
    itemCount: "Made to Order",
    href: "/services",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    badge: "Custom Branding",
  },
  {
    id: "business-cards",
    name: "Business Cards & Stationery",
    subtitle: "Frosted metal cards, matte PVC cards, letterheads & envelopes",
    itemCount: "25+ Formats",
    href: "/products?search=frosted",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80",
    badge: "Executive Grade",
  },
  {
    id: "corporate-gifts",
    name: "Corporate Gifts & Kits",
    subtitle: "Executive onboarding kits, premium drinkware, diaries & awards",
    itemCount: "Enterprise Hampers",
    href: "/corporate",
    image: "/media/products/HLD-EHT.png",
    badge: "Bulk Tiers",
  },
  {
    id: "merchandise",
    name: "Promotional Merchandise",
    subtitle: "Branded ceramic mugs, sipper bottles, metal badges & keychains",
    itemCount: "Wholesale MOQ",
    href: "/products?search=sublimation",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    badge: "High Retention",
  },
  {
    id: "packaging",
    name: "Custom Packaging",
    subtitle: "Optical lens packaging envelopes, rigid sleeves & mailer boxes",
    itemCount: "Precision Cut",
    href: "/products?search=holder",
    image: "/media/products/HLD-VST.png",
    badge: "Proprietary",
  },
  {
    id: "machinery",
    name: "Manufacturing Machinery",
    subtitle: "Hydraulic card die cutters, laminators, heat presses & spare dies",
    itemCount: "22+ Machines",
    href: "/products?category=id-card-manufacturing-machines",
    image: "/media/products/MCH-DCT2000.png",
    badge: "1-Yr Warranty",
  },
];

export default function ShopByCategories() {
  return (
    <section className="py-14 sm:py-20 bg-slate-50/60 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Core Product Categories</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
              Engineered for Every{" "}
              <KineticHighlight>
                <span className="text-blue-600">Printing &amp; Branding Need</span>
              </KineticHighlight>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
              Explore our factory-direct manufacturing categories. From high-throughput industrial ID equipment to bespoke promotional apparel and executive gifting.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group shrink-0"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 8 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {FEATURED_CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.35 }}
            >
              <Link
                href={cat.href}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-4 sm:p-5 flex flex-col justify-between h-full shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
              >
                {/* Image Stage */}
                <div className="relative aspect-square w-full rounded-xl bg-slate-50 overflow-hidden mb-4 p-4 border border-slate-100 flex items-center justify-center">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-contain p-2 group-hover:scale-108 transition-transform duration-500 ease-out"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />

                  {/* Badge */}
                  {cat.badge && (
                    <span className="absolute top-2.5 left-2.5 bg-[#0A1128] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                      {cat.badge}
                    </span>
                  )}

                  {/* Item Count */}
                  <span className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-xs text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                    {cat.itemCount}
                  </span>
                </div>

                {/* Text & Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                    <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-colors shrink-0">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {cat.subtitle}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
