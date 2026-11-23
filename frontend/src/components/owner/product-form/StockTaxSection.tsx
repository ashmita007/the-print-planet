"use client";

import React from "react";
import { Boxes } from "lucide-react";

export interface StockTaxSectionProps {
  stock: string;
  setStock: React.Dispatch<React.SetStateAction<string>>;
  gstRate: string;
  setGstRate: React.Dispatch<React.SetStateAction<string>>;
  hsnCode: string;
  setHsnCode: React.Dispatch<React.SetStateAction<string>>;
}

const INPUT =
  "w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none";

const hsnInvalid = (value: string) => value !== "" && !/^(\d{4}|\d{6}|\d{8})$/.test(value);

export default function StockTaxSection({ stock, setStock, gstRate, setGstRate, hsnCode, setHsnCode }: StockTaxSectionProps) {
  return (
    <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-lg border border-[#DFE6EE] shadow-2xs space-y-4">
      <div className="border-b border-[#DFE6EE] pb-3">
        <h2 className="text-sm font-bold text-[#121418] flex items-center gap-2">
          <Boxes className="w-4 h-4 text-[#353C45]" aria-hidden />
          <span>Stock &amp; GST</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <label htmlFor="field-stock-quantity" className="block font-semibold text-[#121418] mb-1">Stock quantity</label>
          <input id="field-stock-quantity" type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} className={INPUT} aria-describedby="stock-hint" />
          <p id="stock-hint" className="mt-1 text-[11px] text-slate-500">Leave empty to not track stock. 0 shows “Out of stock” and blocks quote requests.</p>
        </div>
        <div>
          <label htmlFor="field-gst-rate" className="block font-semibold text-[#121418] mb-1">GST rate (%)</label>
          <input id="field-gst-rate" type="number" min="0" max="100" step="0.01" value={gstRate} onChange={(e) => setGstRate(e.target.value)} className={INPUT} aria-describedby="gst-hint" />
          <p id="gst-hint" className="mt-1 text-[11px] text-slate-500">Empty uses the default rate from Commerce settings.</p>
        </div>
        <div>
          <label htmlFor="field-hsn-code" className="block font-semibold text-[#121418] mb-1">HSN code</label>
          <input id="field-hsn-code" inputMode="numeric" maxLength={8} value={hsnCode} onChange={(e) => setHsnCode(e.target.value.replace(/\D/g, ""))} aria-invalid={hsnInvalid(hsnCode)} aria-describedby="hsn-hint" className={`${INPUT} font-mono aria-[invalid=true]:border-[#C0392B]`} />
          <p id="hsn-hint" className={`mt-1 text-[11px] ${hsnInvalid(hsnCode) ? "text-[#C0392B] font-semibold" : "text-slate-500"}`}>4, 6 or 8 digits.</p>
        </div>
      </div>
    </div>
  );
}
