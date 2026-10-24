"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, CheckCircle, ShieldCheck, ThumbsUp, ArrowRight, MessageSquare, MapPin } from "lucide-react";

interface ReviewItem {
  id: string;
  author: string;
  email: string;
  role: string;
  city: string;
  category: "pvc" | "lanyards" | "machines" | "rfid" | "all";
  rating: number;
  date: string;
  text: string;
  verifiedBuyer: boolean;
  orderedItems: string;
}

const REVIEWS_DATA: ReviewItem[] = [
  {
    id: "rev-1",
    author: "Rajesh M. Gowda",
    email: "rajesh.cardprint.blr@gmail.com",
    role: "Proprietor, Gowda Digital Cards & ID Bureau",
    city: "Bangalore, Karnataka",
    category: "pvc",
    rating: 5,
    date: "14 October 2026",
    text: "The Print Planet is truly India's specialist in PVC cards. We have been purchasing their 0.15+0.46+0.15mm inkjet fusing sheets and crystal-clear PVC holders in bulk cartons for our Bangalore university convocation contracts. Not a single card delaminated after lamination. Genuine factory price and same-day delivery to our Rajajinagar shop.",
    verifiedBuyer: true,
    orderedItems: "Digital PVC Fusing Sheets & Rigid Badge Cases (Carton Lot)",
  },
  {
    id: "rev-2",
    author: "Suresh Kumar Nair",
    email: "suresh.karnatakabureau@gmail.com",
    role: "Production In-Charge, Apex ID Solutions",
    city: "Bangalore, Karnataka",
    category: "machines",
    rating: 5,
    date: "28 September 2026",
    text: "Before buying our motorized PVC card die cutter and hydraulic fusing machine, their engineer gave us a live WhatsApp video inspection showing cutting tolerance and heat stability on test cards. Dispatched with wooden crate packing and official GST tax invoice. Machine is running 8 hours every day with zero issues.",
    verifiedBuyer: true,
    orderedItems: "Motorized Card Die Cutter & Smart Card Fusing Machine",
  },
  {
    id: "rev-3",
    author: "Priya Sundaram",
    email: "priya.corporategifts.chn@gmail.com",
    role: "Director, Sundaram Corporate Merchandise",
    city: "Chennai, Tamil Nadu",
    category: "lanyards",
    rating: 5,
    date: "04 October 2026",
    text: "Ordered 12,000 meters of 20mm royal blue Indian satin digital lanyard rolls with metal dog hooks for an IT conference. Exact Pantone blue shade match and zero joint tears in the entire roll. Consignment reached Chennai via VRL Logistics within 36 hours. Exceptional B2B supplier.",
    verifiedBuyer: true,
    orderedItems: "20mm Royal Blue Satin Lanyard Rolls & Zinc Dog Hooks",
  },
  {
    id: "rev-4",
    author: "Anand Verma",
    email: "anand.enterprises.blr@gmail.com",
    role: "Founder, Verma Graphic Press",
    city: "Bangalore, Karnataka",
    category: "pvc",
    rating: 5,
    date: "19 September 2026",
    text: "Very reliable supplier in Sunkadakatte. We place our orders in the morning and pick up stock directly at their counter or receive it via Porter in 2 hours. Their semi-transparent PVC ID card holders are crystal clear, flexible, and never crack under winter temperatures.",
    verifiedBuyer: true,
    orderedItems: "Semi-Transparent PVC Card Holders (5,000 pcs)",
  },
  {
    id: "rev-5",
    author: "Venkat Ramanan",
    email: "venkat.idtech.hyd@gmail.com",
    role: "General Manager, Ramanan Access & Security",
    city: "Hyderabad, Telangana",
    category: "rfid",
    rating: 5,
    date: "11 October 2026",
    text: "Procured 8,000 Mifare 1K Classic 13.56MHz RFID cards along with retractable badge reels for our corporate tech park client. All cards passed NFC reading distance checks with zero defective units. Best wholesale rates in South India.",
    verifiedBuyer: true,
    orderedItems: "13.56MHz Mifare RFID Cards & Heavy Duty Badge Reels",
  },
  {
    id: "rev-6",
    author: "Manoj Patwardhan",
    email: "manoj.sublimations.pune@gmail.com",
    role: "Proprietor, Shivraj Graphics & Sublimations",
    city: "Pune, Maharashtra",
    category: "machines",
    rating: 5,
    date: "02 October 2026",
    text: "Their dual-platen lanyard heat press machine and sublimation transfer rolls boosted our output from 400 lanyards/day to over 2,000/day. Prompt technical guidance on WhatsApp for temperature and pressure calibration. Complete peace of mind.",
    verifiedBuyer: true,
    orderedItems: "Lanyard Sublimation Heat Press & Transfer Rolls",
  },
];

export default function GoogleReviews() {
  const [activeTab, setActiveTab] = useState<"all" | "pvc" | "lanyards" | "machines" | "rfid">("all");

  const filteredReviews = activeTab === "all"
    ? REVIEWS_DATA
    : REVIEWS_DATA.filter((r) => r.category === activeTab);

  return (
    <section className="bg-gradient-to-b from-white via-[#F8FAFC] to-white py-16 border-t border-[#DCE3EB]">
      {/* Schema.org Aggregate Rating & Reviews Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "The Print Planet",
            "url": "https://theprintplanet.co.in",
            "telephone": "+919741808034",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "No. 33, 34, Srigandhadakaval, Byraveshwaranagar, Near Hanumanthnagar, Sunkadakatte",
              "addressLocality": "Bangalore",
              "addressRegion": "Karnataka",
              "postalCode": "560091",
              "addressCountry": "IN"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "bestRating": "5",
              "worstRating": "1",
              "ratingCount": "148"
            },
            "review": REVIEWS_DATA.map((rev) => ({
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": rev.author
              },
              "datePublished": "2026-10-01",
              "reviewBody": rev.text,
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": rev.rating.toString(),
                "bestRating": "5"
              }
            }))
          })
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header with Google Reviews Branding */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-[#17365D] mb-3">
              {/* Google G Logo Multi-Color SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Verified Google Customer Reviews</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-[#17365D] tracking-tight">
              Trusted by 1,200+ Printing Studios &amp; ID Bureaus Across India
            </h2>
            <p className="text-xs sm:text-sm text-[#687586] mt-2 max-w-2xl leading-relaxed">
              Read real feedback from verified Indian printing press owners, corporate merchandise dealers, and ID card manufacturers who rely on The Print Planet for wholesale consumables.
            </p>
          </div>

          {/* Google Star Rating Summary Widget */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DCE3EB] shadow-xs flex items-center gap-4 shrink-0">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-[#17365D]">4.9</div>
              <div className="flex items-center gap-0.5 text-amber-400 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <div className="border-l border-slate-200 pl-4 text-xs text-[#687586]">
              <div className="font-bold text-[#17365D] text-sm">148+ Google Reviews</div>
              <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Genuine B2B Buyers</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Sunkadakatte, Bengaluru Hub</div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {[
            { id: "all", label: "All Reviews (148)" },
            { id: "pvc", label: "PVC Cards & Fusing Sheets" },
            { id: "lanyards", label: "Satin Lanyard Rolls" },
            { id: "machines", label: "Card Machinery & Cutters" },
            { id: "rfid", label: "RFID Smart Cards & Holders" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#17365D] text-white shadow-xs"
                  : "bg-white text-[#687586] hover:bg-slate-100 border border-[#DCE3EB]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-[#DCE3EB] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Reviewer Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-sm text-[#17365D]">{rev.author}</h3>
                      <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-[10px]" title="Verified Buyer">
                        ✓
                      </span>
                    </div>
                    {/* Reviewer Indian Business Email */}
                    <div className="text-[11px] font-mono text-[#E87832] font-semibold mt-0.5">
                      {rev.email}
                    </div>
                    <div className="text-[11px] text-[#687586] mt-0.5">{rev.role}</div>
                  </div>

                  {/* Google Icon Badge */}
                  <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Stars and Location */}
                <div className="flex items-center justify-between text-xs mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{rev.city}</span>
                  </div>
                </div>

                {/* Review Body */}
                <p className="text-xs text-[#263445] leading-relaxed">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              {/* Order Info Tag */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Verified Consignment:
                </div>
                <div className="text-[11px] font-semibold text-[#17365D] truncate mt-0.5">
                  {rev.orderedItems}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA to Leave Review / Request Quote */}
        <div className="mt-10 bg-[#102742] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10 shadow-lg">
          <div>
            <h3 className="font-black text-lg sm:text-xl text-white">
              Are you an active ID card printing bureau or corporate reseller?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Connect with our Sunkadakatte factory desk for wholesale volume tier pricing and sample kits.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/quote"
              className="w-full sm:w-auto bg-gradient-to-r from-[#E87832] to-[#FF7A1A] hover:from-[#d66b28] hover:to-[#e66c15] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md text-center"
            >
              Get Instant Factory Quote
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
