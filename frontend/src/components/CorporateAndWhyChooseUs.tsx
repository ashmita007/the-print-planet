"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const REASONS = [
  {
    title: "Materials you can verify",
    desc: "Optical-white PVC, scratch-proof overlays, high-tensile satin polyester and zinc alloy hardware. Ask for a sample kit before you commit to cartons.",
  },
  {
    title: "Slab pricing with GST billing",
    desc: "Tiered wholesale rates that drop with volume, billed on a formal GST invoice so your Input Tax Credit passes through in full.",
  },
  {
    title: "Made to your specification",
    desc: "Ribbon widths from 12 to 25mm, Pantone matching, QR and barcode encoding, and your logo printed on the job.",
  },
  {
    title: "Dispatch in 24 to 48 hours",
    desc: "Daily pickups with DTDC, Blue Dart and VRL, with same-day counter collection from Sunkadakatte for local studios.",
  },
  {
    title: "One person handling your account",
    desc: "A named contact for sample proofs, priority production slots and tender quotations.",
  },
];

const SECTORS = [
  {
    title: "Corporates & tech parks",
    desc: "RFID access badges, executive lanyards and employee onboarding kits.",
    items: ["Mifare 1K / 13.56 MHz cards", "Satin heat-transfer lanyards", "Custom welcome hampers"],
  },
  {
    title: "Schools & universities",
    desc: "Student ID cards, colour-coded house lanyards and library barcode cards.",
    items: ["Unbreakable PVC card holders", "Breakaway safety clasps", "Annual student batch rates"],
  },
  {
    title: "Events & exhibitions",
    desc: "Delegate credentials, VIP lanyards, kit bags and printed conference tees.",
    items: ["Pre-assembled badge sets", "48-hour rush dispatch", "Custom delegate bags"],
  },
];

export default function CorporateAndWhyChooseUs() {
  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        <div className="lg:col-span-4 lg:sticky lg:top-24 self-start">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#16324F] tracking-tight leading-[1.08]">
            Why print studios keep reordering from us
          </h2>
          <p className="text-sm text-[#475565] mt-3 leading-relaxed">
            We manufacture what we sell, so pricing, stock and quality all sit with one factory in Bengaluru.
          </p>
        </div>

        <ol className="lg:col-span-8">
          {REASONS.map((reason, index) => (
            <li
              key={reason.title}
              data-reveal
              className="grid grid-cols-[2.5rem_1fr] sm:grid-cols-[3.5rem_16rem_1fr] gap-x-4 gap-y-1 py-5 border-t border-[#D8DEE5] first:border-t-2 first:border-[#16324F]"
            >
              <span className="font-mono text-xs text-[#B94E12] pt-0.5">0{index + 1}</span>
              <h3 className="text-base font-bold text-[#16324F] leading-snug">{reason.title}</h3>
              <p className="col-start-2 sm:col-start-3 text-sm text-[#475565] leading-relaxed">{reason.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative overflow-hidden bg-[#0E2238] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-[1.08]">
                Supplying 500 employees or 10,000 students
              </h2>
              <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                Contract rates, sample approval and scheduled dispatch for institutions and regional print shops.
              </p>
            </div>
            <Link
              href="/corporate"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-[#D9601A] hover:bg-[#B94E12] text-white font-bold text-sm transition-colors shrink-0 self-start lg:self-auto"
            >
              <span>Corporate &amp; bulk enquiries</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x divide-white/15 border-t border-white/15">
            {SECTORS.map((sector) => (
              <div key={sector.title} className="py-6 md:px-6 md:first:pl-0 md:last:pr-0 border-b md:border-b-0 border-white/15 last:border-b-0">
                <h3 className="text-lg font-bold text-white">{sector.title}</h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">{sector.desc}</p>
                <ul className="mt-4 space-y-1.5 font-mono text-xs text-slate-300">
                  {sector.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link
                  href="/quote"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#F4A36B] hover:text-white transition-colors"
                >
                  <span>Request a tender quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
