"use client";

import React from "react";
import { VOLUME_TIERS, type VolumeTier } from "../orderData";
import { Check } from "lucide-react";

export interface SlabComparisonProps {
  tier: VolumeTier;
  startWithTier: (sampleQty: number) => void;
  orderNumber: string | null;
}

export default function SlabComparison({
  tier,
  startWithTier,
  orderNumber,
}: SlabComparisonProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-[#121418] tracking-tight leading-[1.08]">
        Larger orders earn better terms
      </h2>
      <p className="mt-3 text-[15px] text-[#2B323B] max-w-xl">
        Your final price depends on the product and specification, and is confirmed in your formal GST quotation.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 border-t-2 border-[#121418] md:divide-x divide-[#DFE6EE]">
        {VOLUME_TIERS.map((item) => {
          const active = item.id === tier.id;
          return (
            <div
              key={item.id}
              className={`flex flex-col p-5 sm:p-6 border-b md:border-b-0 border-[#DFE6EE] transition-colors duration-300 ${
                active ? "bg-[#EDF1F6]" : ""
              }`}
            >
              <p className="text-sm font-semibold text-[#2B323B]">{item.name}</p>
              <p className="mt-1 font-heading text-2xl font-extrabold text-[#121418] tabular-nums">{item.volume}</p>
              <p className="text-[13px] text-[#353C45]">units</p>
              <p className="mt-3 text-[15px] font-bold text-[#2B323B]">{item.discount}</p>
              <p className="text-sm text-[#2B323B]">{item.turnaround}</p>
              <ul className="mt-4 mb-5 space-y-1.5 flex-1">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-[#121418]">
                    <Check className="w-4 h-4 text-[#217A4B] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => startWithTier(item.sampleQty)}
                disabled={orderNumber !== null}
                className={`w-full py-3 rounded-md font-bold text-sm transition-colors disabled:opacity-50 ${
                  active
                    ? "bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418]"
                    : "border border-[#121418] text-[#121418] hover:bg-[#121418] hover:text-white"
                }`}
              >
                {active ? "Your current slab" : `Start with ${item.sampleQty.toLocaleString("en-IN")} units`}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
