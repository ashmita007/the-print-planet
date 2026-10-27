import React from "react";
import { Metadata } from "next";
import { Phone, Mail, MapPin, ShieldCheck, Clock, MessageSquare } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactFormClient from "@/components/ContactFormClient";
import { getSiteSettings } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: "Contact The Print Planet Bengaluru | Sales Desk & Factory Quotation",
  description:
    "Contact The Print Planet sales and technical support in Sunkadakatte, Bengaluru. Call +91 97418 08034 or email theprintplanet01@gmail.com for wholesale pricing, factory visits, and bulk quotations.",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: "Contact The Print Planet Bengaluru | Sales Desk & Factory Quotation",
    description: "Official contact portal of The Print Planet. Factory sales desk, Sunkadakatte, Bengaluru.",
    url: `${SITE_URL}/contact`,
    siteName: "The Print Planet",
    type: "website",
  },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const businessName = settings?.business_name || "THE PRINT PLANET";
  const phone = settings?.phone || "+91 97418 08034";
  const email = settings?.email || "theprintplanet01@gmail.com";
  const address = settings?.address || "No. 33, 34, Srigandhadakaval, Byraveshwaranagar, Near Hanumanthnagar, Sunkadakatte, Bangalore - 560091, Karnataka, India";
  const gst = settings?.gst_number || "29AAQFT3909B1ZZ";
  const pan = "AAQFT3909B";
  const whatsapp = settings?.whatsapp || "+91 97418 08034";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Contact Us",
        item: `${SITE_URL}/contact`,
      },
    ],
  };

  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact The Print Planet",
    url: `${SITE_URL}/contact`,
    mainEntity: {
      "@type": "LocalBusiness",
      name: "The Print Planet",
      alternateName: ["Print Planet", "The Print Planet India"],
      telephone: phone,
      email: email,
      address: {
        "@type": "PostalAddress",
        streetAddress: "No. 33, 34, Srigandhadakaval, Byraveshwaranagar, Near Hanumanthnagar, Sunkadakatte",
        addressLocality: "Bengaluru",
        addressRegion: "Karnataka",
        postalCode: "560091",
        addressCountry: "IN",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: phone,
        contactType: "sales",
        email: email,
        areaServed: "IN",
        availableLanguage: ["English", "Hindi", "Kannada"],
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <Breadcrumbs items={[{ label: "Contact Us & Quotations" }]} />

      {/* Hero */}
      <div className="border-b border-[#E2E8F0] pb-6 sm:pb-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-[11px] font-medium text-[#C25E1F] uppercase tracking-[0.14em]">
            Industrial Sales & Trade Desk
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#17365D]">
            Contact & Bulk Quotation Enquiry
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            Connect with our sales engineering team for volume pricing, custom Pantone roll dyeing,
            and machine demonstrations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Left Column: Direct Info (5 Cols) */}
        <div className="lg:col-span-5 space-y-5 sm:space-y-6">
          <div className="bg-[#F5F7FA] p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#DCE3EB] space-y-4 sm:space-y-5 text-xs">
            <h2 className="text-base font-bold text-[#17365D] border-b border-[#DCE3EB] pb-3">
              Industrial Headquarters
            </h2>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#E87832] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#263445] text-xs block mb-0.5">Manufacturing & Distribution Address</strong>
                <p className="text-[#687586] leading-relaxed">{address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#E87832] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#263445] text-xs block mb-0.5">Direct Trade Line</strong>
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="text-[#17365D] font-bold hover:underline">
                  {phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#E87832] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#263445] text-xs block mb-0.5">Commercial RFQ Email</strong>
                <a href={`mailto:${email}`} className="text-[#17365D] font-bold hover:underline">
                  {email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#E87832] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#263445] text-xs block mb-0.5">Working Hours</strong>
                <p className="text-[#687586]">Monday – Saturday: 10:00 AM – 7:00 PM (IST)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#217A4B] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#263445] text-xs block mb-0.5">Verified Tax Details</strong>
                <p className="text-[#687586]">GST Registration: <strong className="text-[#263445]">{gst}</strong></p>
                <p className="text-[#687586]">PAN: <strong className="text-[#263445]">{pan}</strong></p>
              </div>
            </div>
          </div>

          {/* Quick WhatsApp Action Card */}
          <div className="surface-card p-5 rounded-2xl space-y-3">
            <h3 className="font-semibold text-sm text-[#17365D]">Need a quote on WhatsApp?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Send your roll quantities and holder requirements directly to our on-duty trade manager.
            </p>
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=Hello%2C%20I%20am%20enquiring%20about%20bulk%20ID%20card%20products%20from%20THE%20PRINT%20PLANET.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-[#217A4B] hover:bg-[#1b6540] text-white font-medium text-xs py-2.5 px-4 rounded-lg transition-colors"
            >
              Start WhatsApp chat &rarr;
            </a>
          </div>
        </div>

        {/* Right Column: Interactive Form (7 Cols) */}
        <div className="lg:col-span-7 surface-card p-4 sm:p-8 rounded-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#17365D]">Submit Commercial Enquiry / RFQ</h2>
            <p className="text-xs text-[#687586] mt-1">
              Please furnish complete quantity and specification details. Formal quotations are issued within 2 hours.
            </p>
          </div>
          <ContactFormClient />
        </div>
      </div>
    </div>
  );
}
