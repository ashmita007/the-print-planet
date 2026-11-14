"use client";

import React, { useState, useId } from "react";
import { TrendingUp, ArrowRight, ShieldCheck, CheckCircle2, MessageCircle, Sparkles } from "lucide-react";

export default function PrintShopCalculator() {
  const [cardsPerMonth, setCardsPerMonth] = useState<number>(500);
  const [sellingPricePerCard, setSellingPricePerCard] = useState<number>(35);
  const sliderId = useId();

  // The Print Planet direct wholesale cost per card (Dragon Sheet + Overlays + Ink)
  const rawMaterialCostPerCard = 2.10;
  const totalMonthlyCost = Math.round(cardsPerMonth * rawMaterialCostPerCard);
  const totalMonthlyRevenue = Math.round(cardsPerMonth * sellingPricePerCard);
  const totalMonthlyProfit = Math.round(totalMonthlyRevenue - totalMonthlyCost);
  const profitMarginPercent = Math.round(((sellingPricePerCard - rawMaterialCostPerCard) / sellingPricePerCard) * 100);

  const whatsappMessage = encodeURIComponent(
    `Hi The Print Planet, I calculated a monthly volume of ${cardsPerMonth} PVC ID cards on your profit calculator. Please share details and pricing for your ID Card Print Shop Starter Kit (Dragon sheets, fusing machine & die cutter).`
  );

  return (
    <section className="bg-gradient-to-br from-[#121418] to-[#1E293B] text-white rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-[#F26B1D]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#FF8A3D] text-xs font-mono font-bold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Print Shop & Cyber Cafe Growth Tool</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              PVC ID Card Printing Profit & Margin Calculator
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold self-start sm:self-auto">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Over {profitMarginPercent}% Gross Margin</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label htmlFor={sliderId} className="text-sm font-semibold text-slate-200">
                  Cards Printed Per Month
                </label>
                <span className="font-mono text-xl font-bold text-[#FF8A3D]">
                  {cardsPerMonth.toLocaleString("en-IN")} cards
                </span>
              </div>
              <input
                id={sliderId}
                type="range"
                min="100"
                max="5000"
                step="50"
                value={cardsPerMonth}
                onChange={(e) => setCardsPerMonth(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#F26B1D]"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                <span>100 (Small Studio)</span>
                <span>1,000 (CSC / Cyber Cafe)</span>
                <span>5,000 (Commercial Bureau)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Your Retail Price Charged to Customer (Per Card)
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[25, 35, 50].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setSellingPricePerCard(rate)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                      sellingPricePerCard === rate
                        ? "bg-[#F26B1D] text-[#0E2238] border-[#FF8A3D] shadow-md"
                        : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    ₹{rate} / card
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-[#FF8A3D]" />
                Raw Material Unit Economics
              </div>
              <p className="leading-relaxed text-slate-300">
                Using The Print Planet A4 inkjet dragon sheets (50 sets = 500 cards), your raw material cost is only ~₹2.10 per finished CR-80 card (including core sheet, protective overlay, and inkjet ink).
              </p>
            </div>
          </div>

          {/* Profit Breakdown Card */}
          <div className="lg:col-span-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/15 space-y-5">
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300 font-bold border-b border-white/10 pb-3">
              Monthly Earnings Breakdown
            </h3>

            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between items-center text-slate-300">
                <span>Total Customer Billings:</span>
                <span className="font-semibold text-white">₹{totalMonthlyRevenue.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Raw Material Cost (The Print Planet):</span>
                <span className="font-semibold text-rose-300">-₹{totalMonthlyCost.toLocaleString("en-IN")}</span>
              </div>

              <div className="border-t border-white/15 pt-3 flex justify-between items-baseline text-base sm:text-lg font-bold text-white">
                <span>Net Monthly Profit:</span>
                <span className="text-2xl sm:text-3xl text-emerald-400 font-extrabold">
                  ₹{totalMonthlyProfit.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Gross Profit Margin:</span>
                  <span>{profitMarginPercent}% Margin</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-300/80">
                  <span>Estimated Annual Net Profit:</span>
                  <span>~₹{(totalMonthlyProfit * 12).toLocaleString("en-IN")} / year</span>
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
                <span>Get Print Shop Starter Kit Quotation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
