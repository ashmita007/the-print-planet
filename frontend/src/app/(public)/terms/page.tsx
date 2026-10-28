import React from "react";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <Breadcrumbs items={[{ label: "Terms & Conditions" }]} />

      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17365D]">
          Commercial Terms & Conditions
        </h1>
        <p className="text-xs text-slate-500">Effective: October 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-[#263445] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#17365D]">1. Quotations and Pricing</h2>
          <p>
            All listed prices and quotations provided by The Print Planet are ex-factory wholesale
            rates in Indian Rupees (INR) unless expressly stated otherwise in formal proforma invoices.
            Applicable GST and transit freight charges are calculated at final checkout.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#17365D]">2. Minimum Order Quantities (MOQ)</h2>
          <p>
            Standard ID card holders, satin rolls, and hardware fittings are supplied in designated
            pack sizes (e.g. rolls of 100 meters, holder packs of 50/100 units). Custom Pantone
            dyed rolls and branded sublimation ribbons are subject to negotiated batch thresholds.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#17365D]">3. Machinery Warranty & Testing</h2>
          <p>
            Card cutting units (DCT4500, DCT2000), card fusing laminators (DCT150), and lanyard
            printing heat presses undergo operational inspection prior to factory dispatch.
            Warranty terms, spare die availability, and technical setup guidance are specified in
            product documentation.
          </p>
        </section>
      </div>
    </div>
  );
}
