import React from "react";
import { Metadata } from "next";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import PageHero from "@/components/PageHero";
import ContactFormClient from "@/components/ContactFormClient";
import { getSiteSettings } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: "Contact Us in Bengaluru",
  description:
    "Contact The Print Planet in Sunkadakatte, Bengaluru. Call or WhatsApp +91 97418 08034 for wholesale prices on ID cards, lanyards and machines.",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: "Contact Us in Bengaluru | The Print Planet",
    description: "Official contact portal of The Print Planet. Factory sales desk, Sunkadakatte, Bengaluru.",
    url: `${SITE_URL}/contact`,
    siteName: "The Print Planet",
    type: "website",
  },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const phone = settings?.phone || "+91 97418 08034";
  const email = settings?.email || "theprintplanet01@gmail.com";
  const address = settings?.address || "No. 33, 34, Srigandhadakaval, Byraveshwaranagar, Near Hanumanthnagar, Sunkadakatte, Bangalore - 560091, Karnataka, India";
  const whatsapp = settings?.whatsapp || "+91 97418 08034";

  const channels = [
    { icon: Phone, label: "Call", value: phone, href: `tel:${phone.replace(/\s+/g, "")}`, external: false },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: whatsapp,
      href: `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello, I am enquiring about bulk products.")}`,
      external: true,
    },
    { icon: Mail, label: "Email", value: email, href: `mailto:${email}`, external: false },
  ];

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
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <PageHero
        title="Contact The Print Planet"
        lead="Monday to Saturday, 10 am to 7 pm."
        crumbs={[{ label: "Contact" }]}
      />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <ul className="border-y border-[#DFE6EE] divide-y divide-[#DFE6EE]">
            {channels.map(({ icon: Icon, label, value, href, external }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="ink-row flex items-center gap-4 px-3 py-4"
                >
                  <Icon className="ink-row-note w-5 h-5 shrink-0 text-[#5B6877]" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="ink-row-note block text-xs text-[#5B6877]">{label}</span>
                    <span className="ink-row-title block font-bold text-[#22272E] break-words">{value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 px-3 flex items-start gap-3 text-sm text-[#5B6877] leading-relaxed">
            <MapPin className="w-5 h-5 shrink-0 text-[#5B6877]" aria-hidden="true" />
            <span>{address}</span>
          </p>
        </div>

        <div className="lg:col-span-7 surface-card p-4 sm:p-8 rounded-lg">
          <h2 className="text-xl font-bold text-[#22272E] mb-5">Send a message</h2>
          <ContactFormClient />
        </div>
      </div>
    </div>
  );
}
