"use client";

import React from "react";
import { Printer } from "lucide-react";

export default function PrintTariffButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#0E2238] text-sm font-bold shadow-md hover:shadow-lg transition-all"
      title="Print or Save official PDF tariff for procurement approvals"
    >
      <Printer className="w-4 h-4 text-[#0E2238]" />
      <span>Print / Save PDF Tariff</span>
    </button>
  );
}
