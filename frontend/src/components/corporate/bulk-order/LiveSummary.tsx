"use client";

import React from "react";
import { Check, MessageCircle, Phone } from "lucide-react";
import { type ProductLine, type VolumeTier } from "../orderData";
import { WHATSAPP } from "./shared";

export interface LiveSummaryProps {
  product: ProductLine;
  chosenSpecs: string[];
  quantityCounterRef: React.RefObject<HTMLSpanElement | null>;
  tier: VolumeTier;
}

export default function LiveSummary({
  product,
  chosenSpecs,
  quantityCounterRef,
  tier,
}: LiveSummaryProps) {
  return (
    <aside data-desk aria-label="Order summary" className="lg:col-span-4 lg:sticky lg:top-20 bg-[#0E2238] text-white">
      <div className="p-5 sm:p-6">
        <p className="font-mono text-xs text-slate-300">Your order</p>
        <p className="mt-1 text-lg font-bold">{product.label}</p>
        {chosenSpecs.length > 0 && <p className="text-sm text-slate-300 mt-0.5">{chosenSpecs.join(" · ")}</p>}

        <p className="mt-5 font-heading text-4xl font-extrabold tabular-nums tracking-tight">
          <span ref={quantityCounterRef}>2,500</span>
          <span className="ml-2 font-sans text-sm font-medium text-slate-300">units</span>
        </p>

        <div className="mt-5 pt-5 border-t border-white/15">
          <p data-tier-swap className="text-[15px] font-bold text-[#FF8A3D]">{tier.discount}</p>
          <p data-tier-swap className="text-sm text-slate-300 mt-0.5">
            {tier.name} · {tier.turnaround}
          </p>
          <ul className="mt-4 space-y-2">
            {tier.features.map((feature) => (
              <li data-tier-swap key={`${tier.id}-${feature}`} className="flex items-start gap-2 text-sm text-slate-200">
                <Check className="w-4 h-4 text-[#FF8A3D] shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-white/15 text-sm font-semibold">
        <a
          href={`${WHATSAPP}?text=${encodeURIComponent("Hi, I would like to discuss a bulk order.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3.5 hover:bg-white/10 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp</span>
        </a>
        <a href="tel:+919741808034" className="flex items-center justify-center gap-2 py-3.5 border-l border-white/15 hover:bg-white/10 transition-colors">
          <Phone className="w-4 h-4" />
          <span>Call us</span>
        </a>
      </div>
    </aside>
  );
}
