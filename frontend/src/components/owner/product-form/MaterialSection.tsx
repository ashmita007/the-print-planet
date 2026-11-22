"use client";

import React from "react";
import { Box } from "lucide-react";

export interface MaterialSectionProps {
  material: string;
  setMaterial: React.Dispatch<React.SetStateAction<string>>;
  dimensions: string;
  setDimensions: React.Dispatch<React.SetStateAction<string>>;
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
}

export default function MaterialSection({
  material,
  setMaterial,
  dimensions,
  setDimensions,
  color,
  setColor,
}: MaterialSectionProps) {
  return (
    <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-lg border border-[#DFE6EE] shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-[#DFE6EE] pb-3">
        <h2 className="text-sm font-bold text-[#121418] flex items-center gap-2">
          <Box className="w-4 h-4 text-[#353C45]" />
          <span>3. Physical Specifications & Dimensions</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <label htmlFor="field-primary-material" className="block font-semibold text-[#121418] mb-1">Primary Material</label>
          <input id="field-primary-material"
            type="text"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="e.g. Polyester / Satin"
            className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none"
          />
        </div>

        <div>
          <label htmlFor="field-dimensions-gauge" className="block font-semibold text-[#121418] mb-1">Dimensions / Gauge</label>
          <input id="field-dimensions-gauge"
            type="text"
            value={dimensions}
            onChange={(e) => setDimensions(e.target.value)}
            placeholder="e.g. 20 mm x 100 m"
            className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none"
          />
        </div>

        <div>
          <label htmlFor="field-color-finish" className="block font-semibold text-[#121418] mb-1">Color / Finish</label>
          <input id="field-color-finish"
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="e.g. Royal Blue"
            className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
