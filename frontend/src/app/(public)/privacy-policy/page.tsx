import React from "react";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <Breadcrumbs items={[{ label: "Privacy Policy" }]} />

      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17365D]">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-[#263445] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#17365D]">1. Information We Collect</h2>
          <p>
            When you request quotations, submit enquiries, or communicate with our trade desk,
            we collect your name, business email address, company name, telephone number, and
            specific product requirements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#17365D]">2. How We Use Commercial Information</h2>
          <p>
            Information collected through The Print Planet is used solely to generate itemized proforma
            invoices, calculate freight costs, provide dispatch tracking, and address technical queries
            regarding ID accessories and machinery. We do not sell or rent commercial buyer information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#17365D]">3. Data Security & Storage</h2>
          <p>
            Customer submissions are stored on protected PostgreSQL databases in compliance with
            industry security protocols. Owner authentication relies on salted password hashing and
            restricted token authentication.
          </p>
        </section>
      </div>
    </div>
  );
}
