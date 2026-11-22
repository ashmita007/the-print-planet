"use client";

import React from "react";
import { Sparkles, Box, Shield } from "lucide-react";
import { type Category } from "@/lib/types";

export interface LivePreviewProps {
  primaryPreviewImg: string;
  name: string;
  isFeatured: boolean;
  sku: string;
  activeCategory: Category | null;
  material: string;
  dimensions: string;
  priceVisibility: boolean;
  priceDisplay: string;
  price: string;
  moq: string;
  specsList: { key: string; value: string; }[];
  images: { url: string; isPrimary: boolean; }[];
}

export default function LivePreview({
  primaryPreviewImg,
  name,
  isFeatured,
  sku,
  activeCategory,
  material,
  dimensions,
  priceVisibility,
  priceDisplay,
  price,
  moq,
  specsList,
  images,
}: LivePreviewProps) {
  return (
    <div className="lg:col-span-4 sticky top-24 space-y-4">
      <div className="bg-[#121418] text-white p-4 rounded-lg shadow-md space-y-3 border border-white/10">
        <div className="flex items-center justify-between border-b border-white/15 pb-2">
          <span className="text-[11px] font-bold text-[#353C45] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real-Time Public Preview</span>
          </span>
          <span className="text-[10px] text-slate-400">Catalogue Card</span>
        </div>

        <p className="text-[11px] text-slate-300 leading-snug">
          This shows exactly how customers see this item in the public store grid.
        </p>

        {/* Live Rendered Product Card */}
        <div className="bg-[#FFFFFF] rounded-md overflow-hidden shadow-lg border border-slate-200 text-[#121418]">
          {/* Image Stage */}
          <div className="relative w-full pt-[100%] bg-[#EDF1F6] border-b border-[#DFE6EE]">
            {primaryPreviewImg ? (
              <img
                src={primaryPreviewImg}
                alt={name || "Product Preview"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-product.svg";
                }}
                className="absolute inset-0 w-full h-full object-contain p-3"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-slate-400">
                <Box className="w-10 h-10 stroke-[1.5] mb-1 text-slate-300" />
                <span className="text-[10px] font-semibold text-slate-400">
                  Asset Preview
                </span>
              </div>
            )}

            {/* Featured Badge */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isFeatured && (
                <span className="bg-[#121418] text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-2xs">
                  Featured
                </span>
              )}
              <span className="bg-[#217A4B] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> Verified
              </span>
            </div>

            {/* SKU Pill */}
            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs border border-slate-200 text-[#121418] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-2xs max-w-[85%] truncate">
              {sku || "SKU-AUTO"}
            </div>
          </div>

          {/* Content details */}
          <div className="p-3 space-y-2">
            <div>
              <span className="text-[9px] font-semibold text-[#353C45] block truncate">
                {activeCategory?.name || "Uncategorized"}
              </span>
              <h3 className="text-xs font-bold text-[#121418] line-clamp-2 leading-snug min-h-[2rem]">
                {name || "Untitled Product"}
              </h3>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1">
              {material && (
                <span className="text-[9px] bg-[#EDF1F6] text-[#121418] border border-[#DFE6EE] px-1.5 py-0.5 rounded font-medium truncate max-w-full">
                  {material}
                </span>
              )}
              {dimensions && (
                <span className="text-[9px] bg-[#EDF1F6] text-[#121418] border border-[#DFE6EE] px-1.5 py-0.5 rounded font-medium truncate max-w-full">
                  {dimensions}
                </span>
              )}
            </div>

            {/* Pricing */}
            <div className="pt-2 border-t border-[#EDF1F6] flex items-baseline justify-between">
              <div>
                <span className="text-[8px] uppercase font-bold text-[#353C45] block">
                  B2B Trade Price
                </span>
                <span className="text-xs font-extrabold text-[#121418] block truncate">
                  {!priceVisibility
                    ? "Price on Request"
                    : priceDisplay ||
                      (price ? `₹ ${Number(price).toLocaleString("en-IN")}` : "Price on Request")}
                </span>
              </div>

              {moq && (
                <span className="text-[9px] text-slate-500 font-semibold">
                  MOQ: {moq}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <span className="text-[10px] font-semibold py-1 rounded-md border border-[#DFE6EE] text-[#121418] text-center bg-[#EDF1F6]">
                Details
              </span>
              <span className="text-[10px] font-bold py-1 rounded-md bg-[#121418] text-white text-center shadow-2xs">
                Quote
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Summary Stats */}
        <div className="pt-2 border-t border-white/10 text-[11px] text-slate-300 space-y-1">
          <div className="flex justify-between">
            <span>Custom Attributes:</span>
            <strong className="text-white">
              {specsList.filter((s) => s.key && s.value).length}
            </strong>
          </div>
          <div className="flex justify-between">
            <span>Gallery Images:</span>
            <strong className="text-white">{images.length}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
