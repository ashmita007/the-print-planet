import React from "react";
import { MessageSquareText, FileCheck2, Printer, Truck } from "lucide-react";

// Timings come from the order desk and corporate FAQ, so they stay in step with them.
const STEPS = [
  {
    icon: MessageSquareText,
    title: "Ask for a quote",
    detail: "Send the product, quantity and artwork. A quotation comes back within 2 to 4 business hours.",
    time: "2–4 hours",
    ink: "#22272E",
  },
  {
    icon: FileCheck2,
    title: "Approve the proof",
    detail: "You get a digital proof first. Orders over 2,500 pieces also get a physical pilot sample.",
    time: "Before printing",
    ink: "#5B6877",
  },
  {
    icon: Printer,
    title: "We print",
    detail: "Your run is printed, punched and packed on our own floor in Sunkadakatte, Bengaluru.",
    time: "2–4 days",
    ink: "#B9C3CF",
  },
  {
    icon: Truck,
    title: "Dispatch",
    detail: "Courier or cargo to any state in India, with a GST invoice and e-way bill.",
    time: "24–48 hours",
    ink: "#DFE6EE",
  },
];

/** Four steps from quote to delivery; the connecting line draws in with the scroll. */
export default function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="max-w-2xl">
        <p className="eyebrow text-[#5B6877]">How ordering works</p>
        <h2 id="how-heading" className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#22272E]">
          From quote to your door in four steps
        </h2>
      </div>

      <ol className="relative mt-12 grid gap-10 lg:gap-6 lg:grid-cols-4">
        {/* The line runs behind the step markers on wide screens. */}
        <div aria-hidden="true" className="hidden lg:block absolute left-6 right-6 top-6 h-0.5 bg-[#DFE6EE]">
          <div data-scrub-line className="h-full w-full bg-gradient-to-r from-[#22272E] via-[#5B6877] to-[#B9C3CF]" />
        </div>

        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const lightInk = step.ink === "#B9C3CF" || step.ink === "#DFE6EE";
          return (
            <li key={step.title} className="relative flex lg:block gap-5">
              <span
                className="relative z-10 shrink-0 w-12 h-12 rounded-full flex items-center justify-center ring-8 ring-[#FAFBFD]"
                style={{ background: step.ink, color: lightInk ? "#22272E" : "#FFFFFF" }}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <div className="lg:mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#5B6877]">
                  Step {i + 1} · {step.time}
                </p>
                <h3 className="mt-1.5 text-lg font-extrabold text-[#22272E]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4E5A67] max-w-xs">{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
