"use client";

import React from "react";
import { motion } from "motion/react";
import {
  PackageCheck,
  UploadCloud,
  Sliders,
  CheckCircle2,
  Truck,
  ArrowRight,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    step: "01",
    title: "Choose Your Product",
    desc: "Browse 180+ verified industrial and merchandise products, select materials, dimensions, and order quantities.",
    icon: PackageCheck,
  },
  {
    step: "02",
    title: "Upload Your Design",
    desc: "Submit your vector logos, CDR, AI, or high-res artwork files via our online upload portal or WhatsApp.",
    icon: UploadCloud,
  },
  {
    step: "03",
    title: "Customize & Configure",
    desc: "Select fitting hooks, Pantone color codes, RFID frequencies, fabric weaves, and printing finishes.",
    icon: Sliders,
  },
  {
    step: "04",
    title: "Approve 3D Preview",
    desc: "Our production specialists send you a digital proof or live video demonstration for 100% precision approval.",
    icon: CheckCircle2,
  },
  {
    step: "05",
    title: "Receive Fast Dispatch",
    desc: "Factory-direct packaging and insured courier dispatch to your doorstep anywhere across India in 24–48 hours.",
    icon: Truck,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>Seamless Production Process</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Custom Ordering Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            From design upload to nationwide dispatch, experience effortless procurement engineered for enterprise quality and speed.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative">
          {STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.35 }}
                className="bg-slate-50/70 hover:bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-blue-400 hover:shadow-lg transition-all duration-300 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-blue-600 font-mono tracking-widest bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                      STEP {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 group-hover:border-blue-500 group-hover:bg-blue-600 group-hover:text-white text-slate-700 flex items-center justify-center transition-colors shadow-2xs">
                      <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                    </div>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center text-[11px] font-semibold text-blue-600">
                  <span>Guaranteed Accuracy</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0A1128] to-[#0F172A] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg sm:text-xl font-bold text-white">
              Ready to start your custom printing order?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              Submit your specifications now for an official GST quotation and free digital preview.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/quote"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Get Instant Quote</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
