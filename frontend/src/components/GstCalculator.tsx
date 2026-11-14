"use client";

import React, { useState, useId } from "react";
import { Calculator, ArrowRight, ShieldCheck, CheckCircle2, MessageCircle } from "lucide-react";

export default function GstCalculator() {
  const [orderAmount, setOrderAmount] = useState<number>(35000);
  const [taxType, setTaxType] = useState<"interstate" | "intrastate">("interstate");
  const amountInputId = useId();

  const gstRate = 0.18;
  const gstAmount = Math.round(orderAmount * gstRate);
  const totalWithGst = orderAmount + gstAmount;

  // Typical unorganized retail/trader markup vs The Print Planet direct factory pricing
  const estimatedTraderPrice = Math.round(orderAmount * 1.35);
  const factoryDirectSavings = Math.round(estimatedTraderPrice - orderAmount);

  const whatsappMessage = encodeURIComponent(
    `Hi The Print Planet, I calculated a B2B order of ₹${orderAmount.toLocaleString("en-IN")} on your wholesale calculator (Total with 18% GST: ₹${totalWithGst.toLocaleString("en-IN")}). Please share an official Proforma Invoice with your bank details.`
  );

  return (
    <section className="bg-gradient-to-br from-[#0E2238] to-[#1A365D] text-white rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-[#F26B1D]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#FF8A3D] text-xs font-mono font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>B2B Input Tax Credit (ITC) Calculator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Calculate Your Factory-Direct GST Savings
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>100% ITC Pass-Through (GSTIN: 29AAQFT3909B1ZZ)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label htmlFor={amountInputId} className="text-sm font-semibold text-slate-200">
                  Estimated Order Value (Excl. Tax)
                </label>
                <span className="font-mono text-xl font-bold text-[#FF8A3D]">
                  ₹{orderAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                id={amountInputId}
                type="range"
                min="5000"
                max="250000"
                step="2500"
                value={orderAmount}
                onChange={(e) => setOrderAmount(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#F26B1D]"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                <span>₹5,000 (Sample/Trial)</span>
                <span>₹1,00,000 (Bulk Batch)</span>
                <span>₹2,50,000+ (Institutional)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Supply Destination
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTaxType("interstate")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                    taxType === "interstate"
                      ? "bg-[#F26B1D] text-[#0E2238] border-[#FF8A3D] shadow-md"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  Pan-India (18% IGST)
                </button>
                <button
                  type="button"
                  onClick={() => setTaxType("intrastate")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                    taxType === "intrastate"
                      ? "bg-[#F26B1D] text-[#0E2238] border-[#FF8A3D] shadow-md"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  Karnataka (9% CGST + 9% SGST)
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-[#FF8A3D]" />
                How Input Tax Credit (ITC) Works for Your Business
              </div>
              <p className="leading-relaxed text-slate-300">
                The 18% GST billed on your order is not a cost. As a registered business or printing shop, you claim 100% of this GST back against your output sales tax. Your net procurement cost remains strictly factory base price.
              </p>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="lg:col-span-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/15 space-y-5">
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300 font-bold border-b border-white/10 pb-3">
              Official Invoice Tax Breakdown
            </h3>

            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between items-center text-slate-300">
                <span>Taxable Value:</span>
                <span className="font-semibold text-white">₹{orderAmount.toLocaleString("en-IN")}</span>
              </div>

              {taxType === "interstate" ? (
                <div className="flex justify-between items-center text-slate-300">
                  <span>Integrated GST (IGST 18%):</span>
                  <span className="font-semibold text-emerald-400">+₹{gstAmount.toLocaleString("en-IN")}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Central GST (CGST 9%):</span>
                    <span className="font-semibold text-emerald-400">+₹{Math.round(gstAmount / 2).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>State GST (SGST 9%):</span>
                    <span className="font-semibold text-emerald-400">+₹{Math.round(gstAmount / 2).toLocaleString("en-IN")}</span>
                  </div>
                </>
              )}

              <div className="border-t border-white/15 pt-3 flex justify-between items-baseline text-base sm:text-lg font-bold text-white">
                <span>Total Invoice Value:</span>
                <span className="text-xl sm:text-2xl text-[#FF8A3D]">₹{totalWithGst.toLocaleString("en-IN")}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Claimable GST Input Credit:</span>
                  <span>-₹{gstAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-300/80">
                  <span>Estimated Savings vs Local Traders:</span>
                  <span>~₹{factoryDirectSavings.toLocaleString("en-IN")} (up to 35%)</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/919741808034?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-[#0E2238] font-bold text-sm transition-all shadow-lg hover:shadow-xl group"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Request Proforma Invoice for ₹{totalWithGst.toLocaleString("en-IN")}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
