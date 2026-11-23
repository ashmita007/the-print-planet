import React from "react";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms for wholesale orders from The Print Planet, Bengaluru: quotations and GST pricing, minimum order quantities and dispatch.",
  alternates: { canonical: `${SITE_URL}/terms` },
};
import PageHero from "@/components/storefront/PageHero";

export default function TermsPage() {
  return (
    <div>
      <PageHero title="Terms and conditions" lead="Effective: October 2026" crumbs={[{ label: "Terms" }]} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="space-y-7 text-sm text-[#121418] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#121418]">1. Quotations and Pricing</h2>
          <p>
            All listed prices and quotations provided by The Print Planet are ex-factory wholesale
            rates in Indian Rupees (INR) unless expressly stated otherwise in formal proforma invoices.
            Applicable GST and transit freight charges are calculated at final checkout.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#121418]">2. Minimum Order Quantities (MOQ)</h2>
          <p>
            Standard ID card holders and accessories are supplied in designated pack sizes
            (e.g. holder packs of 50/100 units). Custom printed lanyards are subject to negotiated
            batch thresholds.
          </p>
        </section>
      </div>
      </div>
    </div>
  );
}
