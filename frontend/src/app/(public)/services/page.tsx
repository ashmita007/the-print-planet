import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  Printer,
  Layers,
  Sparkles,
  Cpu,
  Package,
  ShieldCheck,
  Scissors,
  Palette,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Commercial Printing Services & Manufacturing Capabilities | The Print Planet",
  description:
    "Explore our advanced printing capabilities including digital sublimation lanyards, UV flatbed printing, RFID smart card encoding, lens packaging fabrication, and holographic stamping.",
};

const SERVICES = [
  {
    icon: Printer,
    title: "Digital Sublimation Lanyard Printing",
    subtitle: "Full-Color Edge-to-Edge Photographic Transfer",
    desc: "Continuous roll-to-roll heat transfer sublimation on pure micro-weave white satin polyester. Delivers vivid photographic graphics, smooth gradients, and razor-sharp text that will never fade, peel, or wash out.",
    specs: ["12mm, 16mm, 20mm, 25mm widths", "Double-sided full CMYK printing", "Washfast & UV-resistant pigments", "Custom PMS Pantone color matching"],
    badge: "High Volume Flagship",
  },
  {
    icon: Palette,
    title: "Screen Printing on Satin Ribbons",
    subtitle: "Precision Spot Color & Raised Texture",
    desc: "Industrial silk-screen printing tailored for single and multi-spot color corporate branding on solid-dyed satin polyester rolls. Ensures crisp typography and intense color contrast for official corporate straps.",
    specs: ["Pantone matched ink formulations", "High tensile elastic ink bonding", "Single or repeat logo layouts", "Metallic gold & silver ink options"],
    badge: "Fast Dispatch",
  },
  {
    icon: Cpu,
    title: "RFID Smart Card Personalization & Chip Encoding",
    subtitle: "Contactless 13.56MHz Mifare & 125kHz LF Solutions",
    desc: "End-to-end smart card production including thermal re-transfer printing, UID number laser engraving, magnetic stripe encoding (HiCo/LoCo), and internal contactless chip cryptographic data provisioning.",
    specs: ["Mifare 1K/4K, NTAG, Desfire EV1/EV2", "EM4100 / TK4100 125kHz proximity", "Thermal re-transfer photo printing", "Database matched batch serialization"],
    badge: "Enterprise Security",
  },
  {
    icon: Package,
    title: "Lens Packaging & Optical Box Manufacturing",
    subtitle: "Custom Rigid Boxes, Sleeves & Micro-Fiber Envelopes",
    desc: "Specialized packaging solutions engineered specifically for eyewear, lens laboratories, optical retailers, and precision optics. Custom structural box fabrication with protective foam dies and high-grade finishes.",
    specs: ["Custom die-cut internal foam inserts", "Foil stamped optical logos", "Velvet & micro-fiber lens pouches", "Moisture & scratch resistant coatings"],
    badge: "Optical Industry",
  },
  {
    icon: Sparkles,
    title: "Holographic Hot Stamping & Security Overlays",
    subtitle: "Anti-Counterfeit Protection & Metallic Foiling",
    desc: "High-precision hot stamping application of 2D/3D diffraction security holograms, signature tamper-evident panels, and lustrous gold/silver metallic foil accents directly on credentials and luxury cards.",
    specs: ["Registered optical hologram patches", "Scratch-off pin security foils", "Gold, silver, bronze & rainbow foils", "Tamper-evident void destruct patterns"],
    badge: "Security Standard",
  },
  {
    icon: Scissors,
    title: "High-Speed Card Die-Cutting & Punching",
    subtitle: "ISO CR-80 Standard & Bespoke Non-Standard Shapes",
    desc: "Automated hydraulic and servo punching services converting raw printed laminated sheets into smooth-edged CR-80 cards, custom luggage tags, contactless keyfobs, and round parking discs.",
    specs: ["Standard ISO 7810 CR80 (85.6 × 54mm)", "Burr-free hydraulic shearing", "Corner radius R=3.18mm precision", "Custom multi-cavity bespoke dies"],
    badge: "Precision Cutting",
  },
  {
    icon: Layers,
    title: "Industrial Lamination & Fusing Service",
    subtitle: "Thermal Oil Pressure Lamination for Polycarbonate & PVC",
    desc: "Multi-daylight hydraulic hot/cold fusing services for thick multi-layer card sandwiches. Flawless bonding of printed core sheets, RFID inlays, magnetic tapes, and scratch-resistant protective overlays.",
    specs: ["Mirror glossy 8K & frosted matte", "Brushed metal texture finishes", "Layer thicknesses from 0.3mm to 1.2mm", "Bubble-free optical clarity"],
    badge: "Heavy Industrial",
  },
  {
    icon: ShieldCheck,
    title: "Assembly, Fitting Attachment & Kitting",
    subtitle: "Turnkey ID Badge & Hardware Packing",
    desc: "Complete post-print finishing including metal dog hook crimping, breakaway safety clip insertion, clear holder sleeve insertion, lanyard pairing, and individual barcoded retail or corporate bagging.",
    specs: ["Automated metal clamp crimping", "Custom pre-collated employee kits", "Barcode & QR serial labeled packaging", "Bulk carton palletizing ready for logistics"],
    badge: "Turnkey Finishing",
  },
];

export default function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-8 sm:space-y-12">
      <Breadcrumbs items={[{ label: "Commercial Services" }]} />

      {/* Hero Section */}
      <div className="bg-[#102742] text-white p-6 sm:p-12 rounded-2xl border-l-4 border-[#E87832] shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#E87832]/20 border border-[#E87832]/40 text-[#E87832] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Industrial Printing & Fabrication Solutions</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Commercial Printing Capabilities & Value-Added Services
          </h1>
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
            From high-speed roll-to-roll sublimation lanyards to automated smart card chip encoding and specialized optical lens packaging, The Print Planet powers businesses with state-of-the-art machinery and certified quality standards.
          </p>
          <div className="pt-2 flex flex-wrap gap-3 sm:gap-4">
            <Link
              href="/quote"
              className="bg-[#E87832] hover:bg-[#d66b28] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2"
            >
              <span>Request Service Quote</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/919741808034?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20your%20printing%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-[#E87832]" />
              <span>WhatsApp Direct</span>
            </a>
          </div>
        </div>
      </div>

      {/* Production Metrics Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#DCE3EB] shadow-2xs">
          <div className="text-2xl sm:text-3xl font-black text-[#17365D]">50,000+</div>
          <div className="text-xs font-bold text-[#E87832] uppercase tracking-wide mt-1">Cards / Day</div>
          <div className="text-[11px] text-[#687586] mt-0.5">High-speed hydraulic production</div>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#DCE3EB] shadow-2xs">
          <div className="text-2xl sm:text-3xl font-black text-[#17365D]">10,000 m</div>
          <div className="text-xs font-bold text-[#E87832] uppercase tracking-wide mt-1">Lanyard Ribbon</div>
          <div className="text-[11px] text-[#687586] mt-0.5">Sublimation & screen print rolls</div>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#DCE3EB] shadow-2xs">
          <div className="text-2xl sm:text-3xl font-black text-[#17365D]">±0.1 mm</div>
          <div className="text-xs font-bold text-[#E87832] uppercase tracking-wide mt-1">Cutting Precision</div>
          <div className="text-[11px] text-[#687586] mt-0.5">Optical servo mark alignment</div>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#DCE3EB] shadow-2xs">
          <div className="text-2xl sm:text-3xl font-black text-[#17365D]">24-48h</div>
          <div className="text-xs font-bold text-[#E87832] uppercase tracking-wide mt-1">Rush Dispatch</div>
          <div className="text-[11px] text-[#687586] mt-0.5">Rapid turnaround for urgent bulk runs</div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-[#17365D]">
            Comprehensive Printing & Customization Services
          </h2>
          <p className="text-xs sm:text-sm text-[#687586] mt-1">
            Explore our specialized manufacturing lines designed for high-volume corporate buyers, retailers, and institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {SERVICES.map((srv, idx) => {
            const IconComponent = srv.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#DCE3EB] p-5 sm:p-7 shadow-xs hover:shadow-md transition-all hover:border-[#17365D]/30 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#17365D]/10 text-[#17365D] flex items-center justify-center shrink-0">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-[#17365D] px-2.5 py-1 rounded-full border border-slate-200">
                      {srv.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#17365D] leading-snug">
                      {srv.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#E87832] mt-0.5">
                      {srv.subtitle}
                    </p>
                    <p className="text-xs text-[#263445] leading-relaxed mt-2.5">
                      {srv.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Technical Capabilities:
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                      {srv.specs.map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/quote?service=${encodeURIComponent(srv.title)}`}
                    className="text-xs font-bold text-[#17365D] hover:text-[#E87832] transition-colors flex items-center gap-1"
                  >
                    <span>Request Pricing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/products"
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    View Products
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Process Walkthrough */}
      <div className="bg-[#F5F7FA] border border-[#DCE3EB] rounded-2xl p-6 sm:p-10 space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-[#E87832] uppercase tracking-wider">
            Quality Assurance Workflow
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#17365D] mt-1">
            How We Execute Your Bulk Printing Orders
          </h2>
          <p className="text-xs sm:text-sm text-[#687586] mt-1">
            Our disciplined manufacturing workflow ensures color fidelity, mechanical integrity, and on-time shipment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#17365D] text-white flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="font-bold text-sm text-[#17365D]">Digital Pre-Press Proof</h4>
            <p className="text-xs text-[#687586] leading-relaxed">
              We review vector artwork, ensure color safety margins, and provide a digital rendering for client sign-off.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#17365D] text-white flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="font-bold text-sm text-[#17365D]">Physical Sample Run</h4>
            <p className="text-xs text-[#687586] leading-relaxed">
              For volume corporate contracts, we produce and dispatch a physical pilot sample for approval.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#17365D] text-white flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="font-bold text-sm text-[#17365D]">High-Capacity Run</h4>
            <p className="text-xs text-[#687586] leading-relaxed">
              Automated multi-layer hydraulic fusing, continuous heat transfer, and optical servo cutting at scale.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#E87832] text-white flex items-center justify-center font-bold text-xs">
              04
            </div>
            <h4 className="font-bold text-sm text-[#17365D]">QC & Fast Dispatch</h4>
            <p className="text-xs text-[#687586] leading-relaxed">
              100% tensile and visual defect inspection followed by insured pan-India courier or freight dispatch.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="bg-[#17365D] text-white p-6 sm:p-10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-[#E87832]">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-bold">Need a Custom Printing Specification?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Our technical engineers assist with custom mold dies, pantone yarn dyeing, and customized optical packaging dimensions.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <Link
            href="/quote"
            className="bg-[#E87832] hover:bg-[#d66b28] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md"
          >
            Submit Specifications
          </Link>
          <Link
            href="/contact"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all"
          >
            Contact Factory Office
          </Link>
        </div>
      </div>
    </div>
  );
}
