"use client";

import React from "react";
import { DollarSign } from "lucide-react";

export interface PricingSectionProps {
  price: string;
  setPrice: React.Dispatch<React.SetStateAction<string>>;
  autoSuggestPriceDisplay: () => void;
  priceDisplay: string;
  setPriceDisplay: React.Dispatch<React.SetStateAction<string>>;
  moq: string;
  setMoq: React.Dispatch<React.SetStateAction<string>>;
  setPriceVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  priceVisibility: boolean;
}

export default function PricingSection({
  price,
  setPrice,
  autoSuggestPriceDisplay,
  priceDisplay,
  setPriceDisplay,
  moq,
  setMoq,
  setPriceVisibility,
  priceVisibility,
}: PricingSectionProps) {
  return (
    <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-lg border border-[#DFE6EE] shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-[#DFE6EE] pb-3">
        <h2 className="text-sm font-bold text-[#121418] flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#353C45]" />
          <span>2. Commercial Pricing & Minimum Order Quantity</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <label htmlFor="field-numeric-price-inr" className="block font-semibold text-[#121418] mb-1">
            Numeric Price (INR)
          </label>
          <input id="field-numeric-price-inr"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 225.00"
            className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none font-bold text-[#121418]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-[#121418]">Price Display Tag</label>
            <button
              type="button"
              onClick={autoSuggestPriceDisplay}
              className="text-[10px] font-bold text-[#353C45] hover:underline"
              title="Auto-format display price"
            >
              Auto-Format
            </button>
          </div>
          <input
            type="text"
            value={priceDisplay}
            onChange={(e) => setPriceDisplay(e.target.value)}
            placeholder="e.g. ₹ 225 / Roll"
                aria-label="Price label"
            className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none"
          />
        </div>

        <div>
          <label htmlFor="field-minimum-order-moq" className="block font-semibold text-[#121418] mb-1">
            Minimum Order (MOQ)
          </label>
          <input id="field-minimum-order-moq"
            type="number"
            value={moq}
            onChange={(e) => setMoq(e.target.value)}
            placeholder="e.g. 50"
            className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none"
          />
        </div>
      </div>

      {/* Visibility Mode */}
      <div className="pt-2 text-xs">
        <label className="block font-semibold text-[#121418] mb-1.5">
          B2B Price Display Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPriceVisibility(true)}
            className={`p-2 rounded-lg border text-center font-semibold transition-all ${
              priceVisibility
                ? "bg-[#121418] text-white border-[#121418]"
                : "bg-[#EDF1F6] text-[#353C45] border-[#DFE6EE] hover:bg-slate-200"
            }`}
          >
            Show Live B2B Price
          </button>
          <button
            type="button"
            onClick={() => setPriceVisibility(false)}
            className={`p-2 rounded-lg border text-center font-semibold transition-all ${
              !priceVisibility
                ? "bg-[#121418] text-white border-[#121418]"
                : "bg-[#EDF1F6] text-[#353C45] border-[#DFE6EE] hover:bg-slate-200"
            }`}
          >
            Price on Request (Hide Live Rate)
          </button>
        </div>
      </div>
    </div>
  );
}
