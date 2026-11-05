import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import PageCta from "@/components/PageCta";

export const metadata: Metadata = {
  alternates: { canonical: "https://theprintplanet.co.in/services" },
  title: "Lanyard & ID Card Printing Services in Bengaluru",
  description:
    "Lanyard sublimation and screen printing, RFID card encoding, lens packaging, holographic foil, card die-cutting, lamination and kitting from Bengaluru.",
};

const SERVICES = [
  { title: "Lanyard sublimation", note: "Full colour on both sides. 12, 16, 20 and 25 mm." },
  { title: "Screen-printed lanyards", note: "Spot colours, Pantone matched. Gold and silver inks." },
  { title: "RFID cards and encoding", note: "Mifare, NTAG and EM4100, numbered to your list." },
  { title: "Lens and optical packaging", note: "Boxes, foam inserts, foil logos and pouches." },
  { title: "Holograms and foil", note: "Hologram patches, scratch-off panels, metallic foil." },
  { title: "Card die-cutting", note: "CR-80 cards, key fobs, luggage tags and custom shapes." },
  { title: "Lamination and fusing", note: "Gloss, matte and brushed finishes, 0.3 to 1.2 mm." },
  { title: "Assembly and kitting", note: "Hooks crimped, holders fitted, packed per person." },
];

const STEPS = [
  { title: "Proof", note: "You approve the artwork." },
  { title: "Sample", note: "A pilot piece for large orders." },
  { title: "Print", note: "The full run on our machines." },
  { title: "Dispatch", note: "Checked, packed and shipped." },
];

export default function ServicesPage() {
  return (
    <div>
      <PageHero
        title="Lanyard and ID card printing services"
        lead="Eight production lines under one roof in Bengaluru."
        crumbs={[{ label: "Services" }]}
      />

      <section aria-label="Services" className="max-w-7xl mx-auto px-0 sm:px-6 py-6 sm:py-12">
        <ul className="border-y border-[#DFE6EE] divide-y divide-[#DFE6EE]">
          {SERVICES.map((service) => (
            <li key={service.title} data-reveal>
              <Link
                href={`/quote?service=${encodeURIComponent(service.title)}`}
                className="ink-row grid grid-cols-[1fr_auto] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)_auto] items-center gap-x-6 gap-y-1 px-4 sm:px-6 py-4 sm:py-5"
              >
                <span className="ink-row-title text-lg sm:text-2xl font-bold tracking-tight text-[#22272E]">
                  {service.title}
                </span>
                <span className="ink-row-note row-start-2 md:row-start-auto text-sm text-[#3F4A56]">
                  {service.note}
                </span>
                <ArrowRight className="ink-row-arrow row-span-2 md:row-span-1 w-5 h-5 text-[#36404B]" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="steps-heading" className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <h2 id="steps-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#22272E]">
          How an order runs
        </h2>
        <div className="relative mt-8">
          <div data-scrub-line aria-hidden="true" className="hidden sm:block absolute left-0 right-0 top-[5px] h-0.5 bg-[#F26B1D]" />
          <ol className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STEPS.map((step) => (
              <li key={step.title} className="relative sm:pt-7">
                <span aria-hidden="true" className="hidden sm:block absolute top-0 left-0 w-3 h-3 rounded-full bg-[#22272E] ring-4 ring-white" />
                <h3 className="font-bold text-[#22272E]">{step.title}</h3>
                <p className="text-sm text-[#3F4A56] mt-1">{step.note}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <PageCta title="Have artwork ready?" whatsappText="Hi, I would like to enquire about your printing services." />
    </div>
  );
}
