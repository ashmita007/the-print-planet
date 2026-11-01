import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  CreditCard,
  Factory,
  Glasses,
  GraduationCap,
  Hospital,
  Landmark,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import PageCta from "@/components/PageCta";

export const metadata: Metadata = {
  alternates: { canonical: "https://theprintplanet.co.in/industries" },
  title: "ID Cards & Lanyards for Schools, Offices and Hospitals",
  description:
    "ID badges, lanyards, RFID cards and packaging for offices, schools, hospitals, optical makers, government, events, factories and banks.",
};

const INDUSTRIES = [
  { icon: Building2, title: "Offices and IT parks", note: "Access cards, lanyards, badge reels, visitor passes" },
  { icon: GraduationCap, title: "Schools and colleges", note: "Student ID cards, colour-coded lanyards, library cards" },
  { icon: Hospital, title: "Hospitals", note: "Staff badges, breakaway lanyards, department colour coding" },
  { icon: Glasses, title: "Optical and eyewear", note: "Lens boxes, foam trays, warranty cards, cleaning cloths" },
  { icon: Landmark, title: "Government", note: "Holographic overlays, tamper-evident cards, serial numbering" },
  { icon: CalendarCheck2, title: "Events", note: "Delegate kits, oversized passes, barcode badges" },
  { icon: Factory, title: "Factories", note: "Rigid holders, steel clips, reflective safety lanyards" },
  { icon: CreditCard, title: "Banks and telecom", note: "Magnetic stripe cards, scratch-off foils, SIM carriers" },
];

export default function IndustriesPage() {
  return (
    <div>
      <PageHero
        title="ID cards and lanyards for every industry"
        lead="Find your sector and we'll price what it usually needs."
        crumbs={[{ label: "Industries" }]}
      />

      <section aria-label="Industries" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#D8DEE5] border border-[#D8DEE5] rounded-lg overflow-hidden">
          {INDUSTRIES.map(({ icon: Icon, title, note }) => (
            <li key={title} className="bg-white">
              <Link
                href={`/quote?industry=${encodeURIComponent(title)}`}
                className="ink-row flex items-center gap-4 p-5 sm:p-6 h-full"
              >
                <Icon className="ink-row-note w-7 h-7 shrink-0 text-[#16324F]" aria-hidden="true" />
                <span className="flex-1 min-w-0">
                  <span className="ink-row-title block text-lg font-bold tracking-tight text-[#16324F]">{title}</span>
                  <span className="ink-row-note block text-sm text-[#566373] mt-0.5">{note}</span>
                </span>
                <ArrowRight className="ink-row-arrow w-5 h-5 shrink-0 text-[#B94E12]" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <PageCta title="Buying for an institution?" whatsappText="Hi, I would like to discuss bulk supplies for our organisation." />
    </div>
  );
}
