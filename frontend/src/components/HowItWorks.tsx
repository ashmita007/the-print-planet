"use client";

import React, { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    step: "01",
    title: "Choose Your Product",
    desc: "Browse 180+ verified industrial and merchandise products, select materials, dimensions, and order quantities.",
  },
  {
    step: "02",
    title: "Upload Your Design",
    desc: "Submit your vector logos, CDR, AI, or high-res artwork files via our online upload portal or WhatsApp.",
  },
  {
    step: "03",
    title: "Confirm the configuration",
    desc: "Select fitting hooks, Pantone color codes, RFID frequencies, fabric weaves, and printing finishes.",
  },
  {
    step: "04",
    title: "Approve the proof",
    desc: "We send a digital proof or a live video demonstration. Production starts once you sign off.",
  },
  {
    step: "05",
    title: "Receive your dispatch",
    desc: "Factory-direct packaging and insured courier dispatch to your doorstep anywhere across India in 24–48 hours.",
  },
];

export default function HowItWorks() {
  const stepsRef = useRef<HTMLDivElement>(null);

  // Desktop only: the pipeline line fills with scroll and lights each step as it arrives.
  useGSAP(
    () => {
      if (prefersReducedMotion() || !window.matchMedia("(min-width: 1024px)").matches) return;

      const nodes = gsap.utils.toArray<HTMLElement>("[data-step-node]");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stepsRef.current,
          start: "top 78%",
          end: "top 28%",
          scrub: 0.6,
        },
      });

      tl.fromTo("[data-step-line]", { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);
      nodes.forEach((node, i) => {
        tl.fromTo(
          node,
          { backgroundColor: "#FFFFFF", borderColor: "#D8DEE5", color: "#566373" },
          { backgroundColor: "#D9601A", borderColor: "#D9601A", color: "#FFFFFF", duration: 0.08 },
          i / Math.max(1, nodes.length - 1) - 0.04 * (i === 0 ? 0 : 1)
        );
      });
    },
    { scope: stepsRef }
  );

  return (
    <section className="py-14 sm:py-20 bg-[#F3F5F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-2xl mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#16324F] tracking-tight leading-[1.08]">
            From artwork to doorstep in five steps
          </h2>
          <p className="text-sm text-[#475565] mt-3 leading-relaxed">
            Nothing goes to production until you have approved the proof.
          </p>
        </div>

        {/* Steps Grid */}
        <div ref={stepsRef} className="relative lg:pt-12">
          {/* Pipeline line runs from the first step's node to the last */}
          <div className="hidden lg:block absolute top-[1.0625rem] left-[1.125rem] right-[calc(20%-1.5rem)] h-0.5 bg-[#D8DEE5] rounded-full overflow-hidden">
            <div data-step-line className="h-full w-full bg-[#D9601A] origin-left" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
          {STEPS.map((item) => {
            return (
              <div
                key={item.step}
                className="relative border-t-2 border-[#16324F] lg:border-t-0 pt-4 lg:pt-0"
              >
                <span
                  data-step-node
                  aria-hidden="true"
                  className="hidden lg:flex absolute -top-[3.1rem] left-0 w-9 h-9 rounded-full border-2 border-[#D8DEE5] bg-white text-[#566373] text-xs font-mono font-bold items-center justify-center"
                >
                  {item.step}
                </span>
                <div>
                  <span className="lg:hidden font-mono text-xs text-[#B94E12]">{item.step}</span>
                  <h3 className="font-bold text-base text-[#16324F]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#475565] mt-1.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-12 pt-6 border-t border-[#D8DEE5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#16324F]">
              Have a job ready to go?
            </h3>
            <p className="text-sm text-[#475565]">
              Send your specification for a GST quotation and a free digital proof.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/quote"
              className="px-5 py-2.5 rounded-md bg-[#D9601A] hover:bg-[#B94E12] active:scale-98 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Request a quote</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
