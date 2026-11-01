import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import BulkOrderDesk from "@/components/corporate/BulkOrderDesk";
import FaqAccordion, { FaqItem } from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "Corporate & Bulk Orders",
  description:
    "Order lanyards, ID cards, holders and RFID cards in bulk, direct from our Bengaluru factory. Volume slabs, GST invoicing and pan-India dispatch for companies, schools and print shops.",
  alternates: { canonical: "/corporate" },
};

const QUESTIONS: FaqItem[] = [
  {
    question: "How long does a bulk order take?",
    answer:
      "Pilot samples take 24 to 48 hours. A bulk run of 1,000 to 10,000 units takes 2 to 4 days, and pan-India courier dispatch takes a further 24 to 48 hours.",
  },
  {
    question: "Will I see a sample before production?",
    answer:
      "Every order includes a digital proof. For orders over 2,500 pieces we also make and courier a physical pilot sample for sign-off before the full run.",
  },
  {
    question: "Do you provide a GST invoice?",
    answer:
      "Yes. Every order is billed from GSTIN 29AAQFT3909B1ZZ with e-way bills, so you can claim full input tax credit.",
  },
  {
    question: "Can you supply new-joiner kits every month?",
    answer:
      "Yes. HR teams send a new-joiner batch by Excel, and we print, pack and courier employee kits within 48 hours. We can ship to several branch offices, and we hold your custom ribbons, holders and clips in reserve so a repeat batch is not delayed.",
  },
  {
    question: "Do you offer service level agreements?",
    answer:
      "Yes, for ongoing contracts. A formal SLA covers colour tolerance, mechanical durability and delivery windows.",
  },
  {
    question: "Why do I need an account?",
    answer:
      "It keeps your quotation, proofs and every message with our team in one place. Your order number and history stay there for repeat orders.",
  },
];

export default function CorporatePage() {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: "Corporate & Bulk Orders" }]} />
        <Link
          href="/orders"
          className="shrink-0 text-[13px] font-semibold text-[#16324F] underline decoration-[#C9D1DA] underline-offset-4 hover:decoration-[#D9601A] transition-colors"
        >
          Track my orders
        </Link>
      </div>

      <BulkOrderDesk />

      <section className="bg-[#F3F5F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#16324F] tracking-tight leading-[1.08]">
              Good to know
            </h2>
          </div>
          <div data-no-reveal className="lg:col-span-8">
            <FaqAccordion items={QUESTIONS} />
          </div>
        </div>
      </section>
    </>
  );
}
