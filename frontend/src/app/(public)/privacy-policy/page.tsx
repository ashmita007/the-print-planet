import React from "react";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How The Print Planet, Bengaluru collects, uses and protects the details you share when you request quotes, place orders or contact our trade desk.",
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
};
import PageHero from "@/components/PageHero";

export default function PrivacyPolicyPage() {
  return (
    <div>
      <PageHero title="Privacy policy" lead="Last updated: October 2026" crumbs={[{ label: "Privacy" }]} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="space-y-7 text-sm text-[#121418] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#121418]">1. Information We Collect</h2>
          <p>
            When you request quotations, submit enquiries, or communicate with our trade desk,
            we collect your name, business email address, company name, telephone number, and
            specific product requirements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#121418]">2. How We Use Commercial Information</h2>
          <p>
            Information collected through The Print Planet is used solely to generate itemized proforma
            invoices, calculate freight costs, provide dispatch tracking, and address technical queries
            regarding ID accessories and machinery. We do not sell or rent commercial buyer information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#121418]">3. Data Security & Storage</h2>
          <p>
            Customer submissions are stored on protected PostgreSQL databases in compliance with
            industry security protocols. Owner authentication relies on salted password hashing and
            restricted token authentication.
          </p>
        </section>
      </div>
      </div>
    </div>
  );
}
