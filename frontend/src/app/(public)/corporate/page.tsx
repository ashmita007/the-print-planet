import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  Building,
  TrendingDown,
  ShieldCheck,
  Truck,
  FileCheck2,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  Award,
  Users2,
  Clock4,
  Layers,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Bulk & Corporate Printing Orders | The Print Planet",
  description:
    "Direct factory wholesale pricing, volume discount tiers, and ongoing corporate printing agreements for enterprise identity badges, satin lanyards, and custom packaging.",
};

const VOLUME_TIERS = [
  {
    tier: "Tier 1: Commercial Starter",
    volume: "500 – 2,500 Units",
    discount: "Standard Wholesale Rate",
    turnaround: "3 – 4 Business Days",
    features: [
      "Full digital pre-press proofing included",
      "Choice of standard stock colors & widths",
      "Nickel-plated steel dog hook fittings",
      "Standard courier dispatch across India",
    ],
    popular: false,
  },
  {
    tier: "Tier 2: Business Enterprise",
    volume: "2,500 – 10,000 Units",
    discount: "Up to 20% Volume Discount",
    turnaround: "2 – 3 Business Days (Priority)",
    features: [
      "Free physical pre-production pilot sample",
      "Exact Pantone (PMS) yarn color matching",
      "Dedicated Corporate Account Manager",
      "Free custom barcode serialization & sorting",
      "Priority manufacturing slot",
    ],
    popular: true,
  },
  {
    tier: "Tier 3: Institutional Contract",
    volume: "10,000+ Units (Annual Rate)",
    discount: "Maximum Factory Direct Pricing",
    turnaround: "Scheduled Staggered Dispatches",
    features: [
      "Custom tooling & mold die fabrication",
      "Quarterly reserved warehouse buffer stock",
      "Dedicated credit payment terms (pre-approved)",
      "Annual Price Freeze Agreement",
      "Custom branded packaging & kits",
    ],
    popular: false,
  },
];

export default function CorporatePage() {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-8 sm:space-y-12">
      <Breadcrumbs items={[{ label: "Bulk & Corporate Orders" }]} />

      {/* Hero */}
      <div className="bg-[#102742] text-white p-6 sm:p-12 rounded-2xl border-l-4 border-[#E87832] shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#E87832]/20 border border-[#E87832]/40 text-[#E87832] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Building className="w-3.5 h-3.5" />
            <span>Enterprise B2B Division</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Bulk & Corporate Printing Solutions
          </h1>
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
            Eliminate intermediary markups by partnering directly with our Bengaluru manufacturing facility. We support enterprise buyers, HR departments, and institutional procurement teams with volume tiered pricing, SLA guarantees, and recurring dispatch schedules.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/quote?type=corporate_bulk"
              className="bg-[#E87832] hover:bg-[#d66b28] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2"
            >
              <span>Request Corporate Quotation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/919741808034?text=Hi%2C%20I%20am%20looking%20for%20bulk%20corporate%20pricing%20for%20our%20company."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-[#E87832]" />
              <span>Talk to Procurement Desk</span>
            </a>
          </div>
        </div>
      </div>

      {/* Corporate Advantages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2">
          <TrendingDown className="w-8 h-8 text-[#E87832]" />
          <h3 className="font-bold text-sm text-[#17365D]">Direct Factory Pricing</h3>
          <p className="text-xs text-[#687586] leading-relaxed">
            Zero distributor commissions. Factory direct unit rates provide up to 35% cost savings for volume orders.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2">
          <ShieldCheck className="w-8 h-8 text-[#17365D]" />
          <h3 className="font-bold text-sm text-[#17365D]">Free Sample Approval</h3>
          <p className="text-xs text-[#687586] leading-relaxed">
            For orders over 2,500 units, we manufacture and courier physical sample kits for leadership sign-off.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2">
          <Truck className="w-8 h-8 text-[#E87832]" />
          <h3 className="font-bold text-sm text-[#17365D]">Pan-India Logistics</h3>
          <p className="text-xs text-[#687586] leading-relaxed">
            Daily air courier dispatches to tier-1 metros (Mumbai, Delhi, Hyderabad, Chennai) and insured surface transport.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2">
          <FileCheck2 className="w-8 h-8 text-[#17365D]" />
          <h3 className="font-bold text-sm text-[#17365D]">Full GST Tax Invoicing</h3>
          <p className="text-xs text-[#687586] leading-relaxed">
            Claim 100% input tax credit with verified GSTIN (29AAQFT3909B1ZZ) and compliant e-way bills.
          </p>
        </div>
      </div>

      {/* Volume Tiers */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-xs font-bold text-[#E87832] uppercase tracking-wider">
            Transparent Volume Scaling
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-[#17365D]">
            Corporate Order Tiers & Service Levels
          </h2>
          <p className="text-xs sm:text-sm text-[#687586]">
            Select your anticipated order quantity or setup an annual retainer for guaranteed locked-in pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {VOLUME_TIERS.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
                tier.popular
                  ? "bg-white border-2 border-[#E87832] shadow-xl relative"
                  : "bg-white border border-[#DCE3EB] shadow-xs hover:border-[#17365D]/30"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E87832] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
                  Most Popular for Enterprises
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#17365D]">{tier.tier}</h3>
                  <div className="text-2xl font-black text-[#17365D] mt-1">{tier.volume}</div>
                  <div className="text-xs font-semibold text-[#E87832] mt-0.5">{tier.discount}</div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock4 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Lead time: {tier.turnaround}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Package Features:
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <Link
                  href={`/quote?tier=${encodeURIComponent(tier.tier)}`}
                  className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    tier.popular
                      ? "bg-[#E87832] hover:bg-[#d66b28] text-white shadow-md"
                      : "bg-[#17365D] hover:bg-[#102742] text-white"
                  }`}
                >
                  <span>Select {tier.tier.split(":")[0]}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ongoing Corporate Printing Contracts (Retainers) */}
      <div className="bg-[#F5F7FA] border border-[#DCE3EB] rounded-2xl p-6 sm:p-10 space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-[#E87832] uppercase tracking-wider">
            Ongoing Corporate Partnerships
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#17365D] mt-1">
            Need Scheduled Monthly Batches for Onboarding?
          </h2>
          <p className="text-xs sm:text-sm text-[#687586] mt-1">
            We partner with corporate HR & administrative teams to print and dispatch weekly or monthly employee onboarding kits directly to multiple regional branch offices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2">
            <Users2 className="w-6 h-6 text-[#17365D]" />
            <h4 className="font-bold text-sm text-[#17365D]">Zero-Delay Onboarding</h4>
            <p className="text-xs text-[#687586] leading-relaxed">
              Upload your new joiner batch via Excel or CSV. We print, pack, and courier employee kits directly to your desk in 48 hours.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2">
            <Layers className="w-6 h-6 text-[#E87832]" />
            <h4 className="font-bold text-sm text-[#17365D]">Stock Reservation</h4>
            <p className="text-xs text-[#687586] leading-relaxed">
              We hold custom dyed ribbons, pre-molded holders, and clips in our warehouse so you never face out-of-stock delays.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2">
            <Award className="w-6 h-6 text-[#17365D]" />
            <h4 className="font-bold text-sm text-[#17365D]">Dedicated SLA Guarantee</h4>
            <p className="text-xs text-[#687586] leading-relaxed">
              Formal Service Level Agreement guaranteeing strict color tolerances, mechanical durability, and delivery windows.
            </p>
          </div>
        </div>
      </div>

      {/* Direct Contact Banner */}
      <div className="bg-[#17365D] text-white p-6 sm:p-10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-[#E87832]">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-bold">Speak Directly with Our Corporate Accounts Head</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Have questions about custom PMS colors, large-scale annual agreements, or multi-branch logistics? Contact our industrial desk today.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <a
            href="tel:+919741808034"
            className="bg-[#E87832] hover:bg-[#d66b28] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call +91 97418 08034</span>
          </a>
          <Link
            href="/quote"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all"
          >
            Submit Corporate RFQ
          </Link>
        </div>
      </div>
    </div>
  );
}
