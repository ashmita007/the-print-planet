import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PageCta from "@/components/PageCta";
import { getSiteSettings } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: "About Us: ID Card & Lanyard Manufacturer in Bengaluru",
  description:
    "The Print Planet makes and supplies ID card products, lanyards and card machines from Sunkadakatte, Bengaluru, for buyers across India.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About Us: ID Card & Lanyard Manufacturer in Bengaluru | The Print Planet",
    description: "Dedicated B2B production and wholesale distribution facility in Bengaluru, Karnataka.",
    url: `${SITE_URL}/about`,
    siteName: "The Print Planet",
    type: "website",
  },
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const businessName = settings?.business_name || "THE PRINT PLANET";
  const about = settings?.about_data || {};

  const heroTitle = about.hero_title || "About The Print Planet";
  const heroSubtitle = about.hero_subtitle || "Makers of ID card products, lanyards and card machines in Bengaluru.";
  const storyTitle = about.story_title || "Engineering Precision in Identification Systems";
  const storyP1 = about.story_p1 || `At ${businessName}, our operations combine high-capacity polymer molding, ribbon slitting, and ultrasonic tooling to produce uniform badge accessories designed to meet strict institutional requirements.`;
  const storyP2 = about.story_p2 || "Whether fulfilling recurring orders of 20mm Indian Royal Blue satin rolls or delivering heavy-duty DCT4500 automatic card punch cutters, our manufacturing processes prioritize dimensional consistency, burr-free edge finishing, and reliable mechanical tensile strength.";
  
  const stat1Val = about.stat_1_val || "50,000+";
  const stat1Label = about.stat_1_label || "Holders Produced Daily";
  const stat2Val = about.stat_2_val || "10,000+ m";
  const stat2Label = about.stat_2_label || "Daily Satin Ribbon Output";
  const stat3Val = about.stat_3_val || "180+";
  const stat3Label = about.stat_3_label || "Active Commercial SKUs";
  const stat4Val = about.stat_4_val || "500+";
  const stat4Label = about.stat_4_label || "Institutional Clients Across India";

  const standard1Title = about.standard_1_title || "ISO CR-80 Standard Compliance";
  const standard1Desc = about.standard_1_desc || "Holders calibrated specifically for 85.6mm x 54mm proximity and RFID credentials.";
  const standard2Title = about.standard_2_title || "Pure Grade Polyvinyl Chloride (PVC)";
  const standard2Desc = about.standard_2_desc || "High optical clarity, crack resistance under UV exposure, and smooth rounded corners.";
  const standard3Title = about.standard_3_title || "Rigid Hardware Attachments";
  const standard3Desc = about.standard_3_desc || "Nickel-plated dog hooks and zinc alloy side levers tested for over 50N spring tension.";

  const facility1Title = about.facility_1_title || "Modern Bengaluru Facility";
  const facility1Desc = about.facility_1_desc || "Strategically located at Byraveshwaranagar, Sunkadakatte, Bengaluru for expedited pan-India transit and logistics.";
  const facility2Title = about.facility_2_title || "Verified Trade Compliance";
  const facility2Desc = about.facility_2_desc || "Full tax compliance, registered GST billing, and secure electronic trade payment workflows.";
  const facility3Title = about.facility_3_title || "High-Capacity Inventory";
  const facility3Desc = about.facility_3_desc || "Large-scale warehouse buffer with continuous availability of core lanyard rolls and crystal holders.";

  const stats = [
    { value: stat1Val, label: stat1Label },
    { value: stat2Val, label: stat2Label },
    { value: stat3Val, label: stat3Label },
    { value: stat4Val, label: stat4Label },
  ];

  const points = [
    { title: standard1Title, desc: standard1Desc },
    { title: standard2Title, desc: standard2Desc },
    { title: standard3Title, desc: standard3Desc },
    { title: facility1Title, desc: facility1Desc },
    { title: facility2Title, desc: facility2Desc },
    { title: facility3Title, desc: facility3Desc },
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
        name: "About Us",
        item: `${SITE_URL}/about`,
      },
    ],
  };

  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About The Print Planet",
    url: `${SITE_URL}/about`,
    description: "Learn about The Print Planet (theprintplanet.co.in), India's leading B2B factory manufacturer and wholesale distributor of satin lanyard rolls, PVC ID card holders, and card machinery.",
    mainEntity: {
      "@type": "Organization",
      name: "The Print Planet",
      alternateName: ["Print Planet", "The Print Planet India"],
      url: SITE_URL,
      telephone: "+919741808034",
      email: "theprintplanet01@gmail.com",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <PageHero title={heroTitle} lead={heroSubtitle} crumbs={[{ label: "About" }]} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-10">
        <h2 className="md:col-span-5 text-2xl sm:text-4xl font-extrabold tracking-tight text-[#22272E] leading-tight">
          {storyTitle}
        </h2>
        <div data-reveal className="md:col-span-7 space-y-4 text-sm sm:text-base text-[#22272E] leading-relaxed">
          <p>{storyP1}</p>
          <p>{storyP2}</p>
        </div>
      </section>

      <section aria-label="Key numbers" className="bg-[#22272E] text-white">
        <dl className="max-w-7xl mx-auto px-4 sm:px-6 py-9 sm:py-12 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dd data-count className="text-3xl sm:text-5xl font-extrabold tracking-tight tabular-nums">
                {stat.value}
              </dd>
              <dt className="mt-1.5 text-sm text-slate-300">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section aria-label="Standards and facilities" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-7">
          {points.map((point) => (
            <li key={point.title} className="border-t-2 border-[#22272E] pt-3">
              <h3 className="font-bold text-[#22272E]">{point.title}</h3>
              <p className="text-sm text-[#5B6877] mt-1 leading-relaxed">{point.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <PageCta title="Visit the factory or get a price." />
    </div>
  );
}
