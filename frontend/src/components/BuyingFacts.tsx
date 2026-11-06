import React from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { ColorBar } from "./animations/PrintMarks";

const FACTS = [
  { value: "24-48h", label: "Pan-India dispatch" },
  { value: "GST", label: "Invoice and e-way bill" },
  { value: "Live video", label: "Machine demo before you pay" },
  { value: "Sample kit", label: "Test before bulk" },
];

const WHATSAPP = "https://wa.me/919741808034?text=Hi%20The%20Print%20Planet%2C%20I%20would%20like%20a%20quotation.";

export default function BuyingFacts() {
  return (
    <section className="relative bg-[#0E2238] text-white overflow-hidden">
      <div aria-hidden="true" className="page-hero-dots absolute inset-0 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <ColorBar className="mb-6" />
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 border-b border-white/15 pb-8">
          {FACTS.map((fact) => (
            <div key={fact.value}>
              <dd className="font-hero text-2xl sm:text-3xl font-extrabold">{fact.value}</dd>
              <dt className="text-sm text-slate-300 mt-1">{fact.label}</dt>
            </div>
          ))}
        </dl>

        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="font-hero text-2xl sm:text-3xl font-extrabold">Ordering in bulk?</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/corporate"
              data-magnetic
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] font-bold text-sm transition-colors"
            >
              <span>Start a bulk order</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md border border-white/30 hover:bg-white/10 font-bold text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
