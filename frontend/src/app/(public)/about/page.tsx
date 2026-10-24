import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Factory, ShieldCheck, Truck, Users, Award, CheckCircle } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getSiteSettings } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: "About The Print Planet | India's Leading ID Cards & Lanyards Manufacturer",
  description:
    "Learn about The Print Planet (theprintplanet.co.in), based in Sunkadakatte, Bengaluru. Dedicated high-capacity manufacturing facility for satin lanyard rolls, rigid PVC ID card holders, RFID access cards, and card machinery.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About The Print Planet | India's Leading ID Cards & Lanyards Manufacturer",
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

  const heroTag = about.hero_tag || "Industrial Manufacturer & Distributor";
  const heroTitle = about.hero_title || `About ${businessName}`;
  const heroSubtitle = about.hero_subtitle || "Established as a dedicated production and wholesale distribution facility in Bengaluru, Karnataka, specializing in high-capacity ID card identification products, premium satin rolls, lens packaging, hardware fittings, and card fabrication machinery.";
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-8 sm:space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <Breadcrumbs items={[{ label: "About Our Company" }]} />

      {/* Hero */}
      <div className="bg-[#102742] text-white p-5 sm:p-12 rounded-xl sm:rounded-2xl border-l-4 border-[#E87832] shadow-sm">
        <div className="max-w-3xl space-y-2 sm:space-y-3">
          <span className="text-[11px] sm:text-xs font-bold text-[#E87832] uppercase tracking-wider">
            {heroTag}
          </span>
          <h1 className="text-2xl sm:text-5xl font-black tracking-tight">
            {heroTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </div>

      {/* Industrial Mission & Production Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
        <div className="space-y-4 text-xs sm:text-sm text-[#263445] leading-relaxed">
          <h2 className="text-xl sm:text-2xl font-bold text-[#17365D]">
            {storyTitle}
          </h2>
          <p>{storyP1}</p>
          <p>{storyP2}</p>
          <div className="pt-2 grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#DCE3EB]">
              <div className="text-lg font-black text-[#17365D] font-mono">{stat1Val}</div>
              <div className="text-[11px] text-[#687586]">{stat1Label}</div>
            </div>
            <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#DCE3EB]">
              <div className="text-lg font-black text-[#17365D] font-mono">{stat2Val}</div>
              <div className="text-[11px] text-[#687586]">{stat2Label}</div>
            </div>
            <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#DCE3EB]">
              <div className="text-lg font-black text-[#17365D] font-mono">{stat3Val}</div>
              <div className="text-[11px] text-[#687586]">{stat3Label}</div>
            </div>
            <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#DCE3EB]">
              <div className="text-lg font-black text-[#17365D] font-mono">{stat4Val}</div>
              <div className="text-[11px] text-[#687586]">{stat4Label}</div>
            </div>
          </div>
        </div>

        <div className="bg-[#F5F7FA] p-5 sm:p-8 rounded-xl sm:rounded-2xl border border-[#DCE3EB] space-y-4">
          <h3 className="font-bold text-sm text-[#17365D] uppercase tracking-wider">
            Core Production Standards
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-[#217A4B] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#263445]">{standard1Title}:</strong>
                <p className="text-[#687586] mt-0.5">{standard1Desc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-[#217A4B] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#263445]">{standard2Title}:</strong>
                <p className="text-[#687586] mt-0.5">{standard2Desc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-[#217A4B] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#263445]">{standard3Title}:</strong>
                <p className="text-[#687586] mt-0.5">{standard3Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-[#DCE3EB] rounded-xl space-y-2 shadow-2xs">
          <Factory className="w-6 h-6 text-[#17365D]" />
          <h4 className="font-bold text-sm text-[#17365D]">{facility1Title}</h4>
          <p className="text-xs text-[#687586] leading-relaxed">
            {facility1Desc}
          </p>
        </div>
        <div className="p-6 bg-white border border-[#DCE3EB] rounded-xl space-y-2 shadow-2xs">
          <ShieldCheck className="w-6 h-6 text-[#17365D]" />
          <h4 className="font-bold text-sm text-[#17365D]">{facility2Title}</h4>
          <p className="text-xs text-[#687586] leading-relaxed">
            {facility2Desc}
          </p>
        </div>
        <div className="p-6 bg-white border border-[#DCE3EB] rounded-xl space-y-2 shadow-2xs">
          <Truck className="w-6 h-6 text-[#17365D]" />
          <h4 className="font-bold text-sm text-[#17365D]">{facility3Title}</h4>
          <p className="text-xs text-[#687586] leading-relaxed">
            {facility3Desc}
          </p>
        </div>
      </div>
    </div>
  );
}
