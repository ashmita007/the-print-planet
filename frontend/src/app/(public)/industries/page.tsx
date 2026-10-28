import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  Building2,
  GraduationCap,
  Hospital,
  Glasses,
  Landmark,
  CalendarCheck2,
  Factory,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Briefcase,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Industries & Business Sectors We Serve | The Print Planet",
  description:
    "Tailored commercial printing, ID badge systems, and packaging solutions for Corporate IT, Healthcare, Education, Optical Eyewear, Government, and Events.",
};

const INDUSTRIES = [
  {
    icon: Building2,
    title: "Corporate & IT Tech Parks",
    subtitle: "Enterprise Access Badges & Branded Lanyards",
    description:
      "Comprehensive employee identification solutions for multi-location tech enterprises, corporate headquarters, and co-working hubs. We produce customized Pantone-matched satin lanyards, RFID access cards, and retractable badge reels.",
    deliverables: [
      "Custom PMS-dyed satin lanyards with metal dog hooks",
      "Mifare 1K/4K RFID employee smart access cards",
      "Executive rigid badge holders & thumb-slot sleeves",
      "Visitor management temporary pass sets",
    ],
    highlight: "Trusted by 200+ Corporate Offices in Bengaluru & Pan-India",
  },
  {
    icon: GraduationCap,
    title: "Schools, Colleges & Universities",
    subtitle: "Campus Student Credentials & Library Smart Cards",
    description:
      "High-durability identity cards and accessories engineered to withstand active campus life. Dual-sided photo ID cards with high-clarity color lanyards branded with institutional mottos and logos.",
    deliverables: [
      "Color-coded standard lanyards for students, faculty & staff",
      "High-resolution photographic student ID cards",
      "Contactless RFID library & cafeteria payment cards",
      "Heavy-duty transparent badge protectors",
    ],
    highlight: "Fast Seasonal Turnaround for Annual Academic Intakes",
  },
  {
    icon: Hospital,
    title: "Healthcare & Hospital Networks",
    subtitle: "Staff Credentials & Medical Department Passes",
    description:
      "Hygiene-focused identification hardware for doctors, nurses, paramedics, and hospital administrative staff. Easy-to-sanitize PVC badge holders and high-visibility color coding for emergency response personnel.",
    deliverables: [
      "Anti-microbial and washable polyester lanyard straps",
      "Medical department color-coded badge inserts",
      "Heavy-duty crocodile clips & magnetic attachments",
      "Quick-release safety breakaway lanyards",
    ],
    highlight: "Meets NABH & Institutional Medical Safety Standards",
  },
  {
    icon: Glasses,
    title: "Eyewear & Optical Manufacturers",
    subtitle: "Custom Lens Packaging & Optical Box Manufacturing",
    description:
      "Specialized packaging and branding solutions for eyewear laboratories, spectacle retail chains, and precision optical manufacturers. Custom rigid boxes, protective inner foam inserts, and microfiber pouches.",
    deliverables: [
      "Custom printed lens packaging boxes & sleeves",
      "Die-cut internal shock-absorbing EVA foam trays",
      "Embossed lens guarantee & warranty smart cards",
      "High-density microfiber lens cleaning cloths",
    ],
    highlight: "Custom Structural Box Dies & Foil-Stamped Finishes",
  },
  {
    icon: Landmark,
    title: "Government, Defense & Public Sector",
    subtitle: "High-Security Tamper-Evident Credentials",
    description:
      "High-integrity credential printing incorporating covert UV inks, 2D/3D diffraction optical holograms, encrypted contactless microchips, and micro-text guilloche patterns for official government authentication.",
    deliverables: [
      "Registered optical security holographic overlays",
      "Tamper-evident void destruct badge materials",
      "High-durability polycarbonate laminated ID cards",
      "Secure serialized tracking & QR encrypted badges",
    ],
    highlight: "Strict Anti-Counterfeiting & Quality Benchmarks",
  },
  {
    icon: CalendarCheck2,
    title: "Events, Conferences & Exhibitions",
    subtitle: "Turnkey Delegate Badges & Event Lanyards",
    description:
      "Rapid-turnaround event badge production for trade expos, corporate summits, music festivals, and sports tournaments. Fast dispatch within 24 to 48 hours for urgent delegate rosters and VIP accreditations.",
    deliverables: [
      "Pre-assembled delegate badge & lanyard combo kits",
      "Large format oversized A6 & B6 event passes",
      "Custom printed satin VIP passes with gold foil accents",
      "Barcode & NFC tap-to-network conference badges",
    ],
    highlight: "24-48 Hour Rush Manufacturing Available",
  },
  {
    icon: Factory,
    title: "Manufacturing & Industrial Facilities",
    subtitle: "Rugged Weatherproof Badges & Steel Hardware",
    description:
      "Industrial-grade identification hardware designed for shop floors, chemical plants, and construction zones. Impervious to dust, oils, grease, and mechanical abrasion.",
    deliverables: [
      "Heavy-duty rigid PVC card holders with reinforced slots",
      "Stainless steel crocodile clips & riveted strap fittings",
      "High-tensile woven polyester industrial lanyard straps",
      "High-visibility reflective fluorescent safety lanyards",
    ],
    highlight: "Extreme Mechanical Tensile & Flex Strength",
  },
  {
    icon: CreditCard,
    title: "Banking, Finance & Telecom",
    subtitle: "Smart Chip Card Manufacturing & Magnetic Stripes",
    description:
      "Precision manufacturing and magnetic stripe application for banking institutions, credit unions, and telecommunication providers producing SIM packaging and membership loyalty cards.",
    deliverables: [
      "HiCo (2750 Oe) & LoCo (300 Oe) magnetic stripe cards",
      "Signature panel and scratch-off PIN security foils",
      "Mirror 8K glossy and brushed metallic finishes",
      "SIM card break-out carrier boards & blister packaging",
    ],
    highlight: "ISO 7810 / 7811 Dimensional Precision Compliant",
  },
];

export default function IndustriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-8 sm:space-y-12">
      <Breadcrumbs items={[{ label: "Industries We Serve" }]} />

      {/* Hero */}
      <div className="border-b border-[#E2E8F0] pb-6 sm:pb-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#C25E1F] uppercase tracking-[0.14em]">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Sector-Specific Printing Solutions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#17365D] leading-[1.08]">
            Industries & Business Sectors We Serve
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            Every industry has unique security, branding, and durability requirements. The Print Planet delivers tailored wholesale identification supplies, custom optical packaging, and commercial hardware to India&apos;s leading organizations.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="bg-[#E87832] hover:bg-[#d66b28] text-white px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-2"
            >
              <span>Get Industry-Specific Quotation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/919741808034?text=Hi%2C%20I%20would%20like%20to%20discuss%20bulk%20supplies%20for%20our%20industry."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-slate-50 text-[#17365D] border border-[#DCE3EB] px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-[#E87832]" />
              <span>Talk to Corporate Specialist</span>
            </a>
          </div>
        </div>
      </div>

      {/* Industries Grid */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-3xl font-black text-[#17365D]">
            Specialized Vertical Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-[#687586] mt-1">
            Discover tailored materials, dimensional tolerances, and accessories designed for your sector.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INDUSTRIES.map((ind, idx) => {
            const Icon = ind.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#DCE3EB] p-6 sm:p-8 shadow-xs hover:shadow-md transition-all hover:border-[#17365D]/30 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#17365D] text-white flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#17365D] leading-tight">
                        {ind.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#E87832] mt-0.5">
                        {ind.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#263445] leading-relaxed">
                    {ind.description}
                  </p>

                  <div className="bg-[#F5F7FA] p-3.5 rounded-xl border border-[#DCE3EB]/60">
                    <div className="text-[11px] font-bold text-[#17365D] uppercase tracking-wider mb-2">
                      Key Deliverables & Products:
                    </div>
                    <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-700">
                      {ind.deliverables.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#E87832] shrink-0" />
                    <span>{ind.highlight}</span>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/quote?industry=${encodeURIComponent(ind.title)}`}
                    className="text-xs font-bold text-[#17365D] hover:text-[#E87832] transition-colors flex items-center gap-1"
                  >
                    <span>Request Industry Pricing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/products"
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Browse Catalog &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enterprise Benefits */}
      <div className="bg-[#F5F7FA] border border-[#DCE3EB] rounded-2xl p-6 sm:p-10 space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-[#E87832] uppercase tracking-wider">
            Why Leading Brands Choose Us
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#17365D] mt-1">
            Enterprise Wholesale Standards & Guarantees
          </h2>
          <p className="text-xs sm:text-sm text-[#687586] mt-1">
            We provide structured trade pricing, dedicated relationship managers, and guaranteed consistency across continuous batches.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2">
            <div className="text-base font-bold text-[#17365D]">100% In-House Factory Control</div>
            <p className="text-xs text-[#687586] leading-relaxed">
              No middleman markups. From ribbon slitting to ultrasonic card sealing, every step happens inside our Bengaluru facility.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2">
            <div className="text-base font-bold text-[#17365D]">Verified GST & B2B Billing</div>
            <p className="text-xs text-[#687586] leading-relaxed">
              Full GST input tax credit with verified GSTIN (29AAQFT3909B1ZZ) and standardized e-way bill compliant dispatches.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2">
            <div className="text-base font-bold text-[#17365D]">Recurring Scheduled Logistics</div>
            <p className="text-xs text-[#687586] leading-relaxed">
              Set up monthly recurring stock dispatches for high-turnover institutions with reserved warehouse capacity.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="surface-card p-6 sm:p-10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-bold text-[#17365D]">Have an institutional RFP or bulk tender?</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Our enterprise division provides formal B2B tender quotations, technical specification sheets, and compliance certificates.
          </p>
        </div>
        <Link
          href="/quote"
          className="bg-[#E87832] hover:bg-[#d66b28] text-white px-6 py-3 rounded-lg text-xs sm:text-sm font-bold transition-colors shrink-0 flex items-center gap-2"
        >
          <span>Submit Corporate Tender / RFQ</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
