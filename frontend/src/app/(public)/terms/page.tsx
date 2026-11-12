import React from "react";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms for wholesale orders from The Print Planet, Bengaluru: quotations and GST pricing, minimum order quantities, machinery warranty and dispatch.",
  alternates: { canonical: `${SITE_URL}/terms` },
};
import PageHero from "@/components/PageHero";

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
            Standard ID card holders, satin rolls, and hardware fittings are supplied in designated
            pack sizes (e.g. rolls of 100 meters, holder packs of 50/100 units). Custom Pantone
            dyed rolls and branded sublimation ribbons are subject to negotiated batch thresholds.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#121418]">3. Machinery Warranty & Testing</h2>
          <p>
            Card cutting units (DCT4500, DCT2000), card fusing laminators (DCT150), and lanyard
            printing heat presses undergo operational inspection prior to factory dispatch.
            Warranty terms, spare die availability, and technical setup guidance are specified in
            product documentation.
          </p>
        </section>
      </div>
      </div>
    </div>
  );
}
