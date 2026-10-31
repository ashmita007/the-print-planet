"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  Users,
  Award,
  Truck,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowRight,
  FileText,
  BadgePercent,
  Clock,
  Phone,
} from "lucide-react";

export default function CorporateAndWhyChooseUs() {
  const whyChooseUsPillars = [
    {
      title: "Quality Printing & Materials",
      desc: "Industrial-grade optical-white PVC, scratch-proof laminated overlays, high-tensile satin polyester ribbons, and zinc alloy hardware.",
      icon: Award,
    },
    {
      title: "Bulk Order Support & Pricing",
      desc: "Tiered wholesale slab pricing with heavy-volume discounts and formal GST invoicing with full Input Tax Credit (ITC) pass-through.",
      icon: BadgePercent,
    },
    {
      title: "100% Bespoke Customization",
      desc: "Complete flexibility in ribbon widths (12–25mm), Pantone color matching, QR/barcode encoding, and custom logo printing.",
      icon: Sparkles,
    },
    {
      title: "Fast, Reliable Delivery",
      desc: "Daily automated dispatches with express courier partners (DTDC, Blue Dart, VRL) reaching clients nationwide within 24–48 hours.",
      icon: Truck,
    },
    {
      title: "Enterprise Account Management",
      desc: "Dedicated relationship managers providing sample kit proofs, priority queue scheduling, and customized tender quotation support.",
      icon: ShieldCheck,
    },
  ];

  const corporateSectors = [
    {
      title: "Corporates & Tech Parks",
      desc: "High-security RFID access badges, executive lanyards, employee onboarding welcome kits, and luxury desk accessories.",
      icon: Building2,
      badge: "Enterprise Kits",
      highlights: ["Mifare 1K / 13.56 MHz Cards", "Satin Heat-Transfer Lanyards", "Custom Welcome Hampers"],
    },
    {
      title: "Schools & Universities",
      desc: "Durable student ID cards, color-coded house lanyards, library barcode cards, and annual event merchandise.",
      icon: GraduationCap,
      badge: "Bulk Campus Tenders",
      highlights: ["Unbreakable PVC Card Holders", "Safe Breakaway Safety Clasps", "Annual Student Batch Rates"],
    },
    {
      title: "Events & Exhibitions",
      desc: "Rapid turnaround badge credentials, VIP satin lanyards, delegate kit bags, printed conference tees, and badges.",
      icon: Users,
      badge: "48h Rush Dispatch",
      highlights: ["Pre-assembled Badge Sets", "High-Speed Onsite Issuance", "Custom Delegate Bags"],
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-14 sm:py-20 bg-slate-50/50">
      {/* 1. WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E87832] mb-2">
            <ShieldCheck className="w-4 h-4 text-[#E87832]" />
            <span>The Print Planet Advantage</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#17365D] tracking-tight">
            Why Leading Brands &amp; Print Studios Choose Us
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Combining direct manufacturing capabilities with obsessive quality control, we empower businesses with reliable merchandise and identity infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {whyChooseUsPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06, duration: 0.3 }}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#E87832]/60 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7F2] text-[#E87832] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-[#E87832]" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#17365D] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 2. CORPORATE SOLUTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#102742] rounded-3xl p-6 sm:p-12 text-white border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Background aura */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E87832]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 relative z-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFA868] block mb-2">
                Enterprise &amp; Institutional Solutions
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Tailored Procurement for Organizations of All Sizes
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Whether equipping 10,000 students, onboarding 500 corporate employees, or stocking regional print shops, we deliver custom contract terms and seamless execution.
              </p>
            </div>

            <Link
              href="/corporate"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#E87832] hover:bg-[#d66b28] text-white font-bold text-xs sm:text-sm shadow-md transition-colors shrink-0"
            >
              <span>Explore Corporate Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {corporateSectors.map((sector) => {
              const Icon = sector.icon;
              return (
                <div
                  key={sector.title}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 hover:border-[#E87832]/50 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#E87832]/20 text-[#FFA868] flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFA868] bg-[#E87832]/15 border border-[#E87832]/30 px-2 py-0.5 rounded">
                        {sector.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {sector.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                        {sector.desc}
                      </p>
                    </div>

                    <ul className="space-y-1.5 pt-2 border-t border-white/10 text-xs text-slate-300">
                      {sector.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FFA868] shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href="/quote"
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFA868] hover:text-white transition-colors"
                  >
                    <span>Request Institutional Tender Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
