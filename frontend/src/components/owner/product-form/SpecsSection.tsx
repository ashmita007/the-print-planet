"use client";

import React from "react";
import { Sliders, Plus, Trash2 } from "lucide-react";
import { SPEC_PRESETS } from "./shared";

export interface SpecsSectionProps {
  handleAddSpec: () => void;
  handleApplyPreset: (preset: (typeof SPEC_PRESETS)[0]) => void;
  specsList: { key: string; value: string; }[];
  handleSpecChange: (index: number, field: "key" | "value", val: string) => void;
  handleRemoveSpec: (index: number) => void;
}

export default function SpecsSection({
  handleAddSpec,
  handleApplyPreset,
  specsList,
  handleSpecChange,
  handleRemoveSpec,
}: SpecsSectionProps) {
  return (
    <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-lg border border-[#DFE6EE] shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DFE6EE] pb-3">
        <div>
          <h2 className="text-sm font-bold text-[#121418] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#353C45]" />
            <span>4. Dynamic Technical Specification Key-Values</span>
          </h2>
          <p className="text-[11px] text-[#353C45] mt-0.5">
            Appears in detailed product technical table on public pages.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddSpec}
          className="text-xs font-bold text-[#353C45] hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> Add Attribute
        </button>
      </div>

      {/* Quick Presets Injector */}
      <div className="p-3 bg-[#EDF1F6] border border-[#DFE6EE] rounded-md space-y-1.5">
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.14em] block">
          Quick Industrial Spec Presets (Click to add):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SPEC_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-[11px] font-semibold bg-[#FFFFFF] border border-[#DFE6EE] hover:border-[#121418] hover:text-[#121418] text-[#121418] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-[#353C45]" />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Key-Value Pair Inputs */}
      <div className="space-y-2.5">
        {specsList.map((spec, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <input
              type="text"
              placeholder="Attribute name (e.g. GSM / Voltage)"
                aria-label="Attribute name"
              value={spec.key}
              onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
              className="w-2/5 bg-[#EDF1F6] border border-[#DFE6EE] rounded-lg px-3 py-2 outline-none font-semibold text-[#121418]"
            />
            <input
              type="text"
              placeholder="Specification value (e.g. 180 GSM)"
                aria-label="Attribute value"
              value={spec.value}
              onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
              className="w-3/5 bg-[#EDF1F6] border border-[#DFE6EE] rounded-lg px-3 py-2 outline-none text-[#121418]"
            />
            <button
              type="button"
              onClick={() => handleRemoveSpec(idx)}
              className="text-slate-400 hover:text-red-600 p-1.5 transition-colors shrink-0"
              title="Remove attribute"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
