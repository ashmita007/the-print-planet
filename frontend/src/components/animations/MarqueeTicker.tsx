"use client";

import React from "react";
import { motion } from "motion/react";
import { Sparkles, ShieldCheck, Truck, Award, Zap, Layers } from "lucide-react";

const TICKER_ITEMS = [
  { text: "PAN-INDIA EXPRESS DISPATCH", icon: Truck },
  { text: "50,000+ DAILY PRODUCTION CAPACITY", icon: Zap },
  { text: "CR-80 ISO DIE CUTTING PRECISION", icon: ShieldCheck },
  { text: "100% INPUT TAX CREDIT (ITC) PASS-THROUGH", icon: Award },
  { text: "FREE 3D DIGITAL PROOFING", icon: Sparkles },
  { text: "180+ INDUSTRIAL & MERCHANDISE LINES", icon: Layers },
];

export default function MarqueeTicker() {
  return (
    <div className="w-full bg-[#102742] border-y border-white/10 py-3 overflow-hidden select-none relative">
      {/* Edge gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-[#102742] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-[#102742] to-transparent z-10 pointer-events-none" />

      <div className="flex w-max">
        {/* Track 1 */}
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 28,
            ease: "linear",
          }}
          className="flex items-center gap-8 shrink-0 pr-8"
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2.5 text-[11px] sm:text-xs font-mono font-bold tracking-wider text-slate-200 uppercase hover:text-white transition-colors"
              >
                <div className="w-5 h-5 rounded-md bg-[#E87832]/20 text-[#FFA868] flex items-center justify-center shrink-0 border border-[#E87832]/35">
                  <Icon className="w-3 h-3" />
                </div>
                <span>{item.text}</span>
                <span className="text-[#E87832]/70 font-sans ml-4">✦</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
