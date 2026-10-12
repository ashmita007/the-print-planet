import React from "react";
import Link from "next/link";
import { Factory, ShieldCheck, Truck, Users, Award, CheckCircle } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getSiteSettings } from "@/lib/api";

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const businessName = settings?.business_name || "THE PRINT PLANET";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-12">
      <Breadcrumbs items={[{ label: "About Our Company" }]} />

      {/* Hero */}
      <div className="bg-[#102742] text-white p-8 sm:p-12 rounded-2xl border-l-4 border-[#E87832]">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold text-[#E87832] uppercase tracking-wider">
            Industrial Manufacturer & Distributor
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            About {businessName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Established as a dedicated production and wholesale distribution facility in Bengaluru, Karnataka,
            specializing in high-capacity ID card identification products, premium satin rolls,
            lens packaging, hardware fittings, and card fabrication machinery.
          </p>
        </div>
      </div>

      {/* Industrial Mission & Production Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4 text-xs sm:text-sm text-[#263445] leading-relaxed">
          <h2 className="text-xl sm:text-2xl font-bold text-[#17365D]">
            Engineering Precision in Identification Systems
          </h2>
          <p>
            At {businessName}, our operations combine high-capacity polymer molding, ribbon slitting,
            and ultrasonic tooling to produce uniform badge accessories designed to meet strict institutional requirements.
          </p>
          <p>
            Whether fulfilling recurring orders of 20mm Indian Royal Blue satin rolls or delivering
            heavy-duty DCT4500 automatic card punch cutters, our manufacturing processes prioritize
            dimensional consistency, burr-free edge finishing, and reliable mechanical tensile strength.
          </p>
          <div className="pt-2 grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#DCE3EB]">
              <div className="text-lg font-black text-[#17365D]">50,000+</div>
              <div className="text-[11px] text-[#687586]">Holders Produced Daily</div>
            </div>
            <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#DCE3EB]">
              <div className="text-lg font-black text-[#17365D]">10,000+ m</div>
              <div className="text-[11px] text-[#687586]">Daily Satin Ribbon Output</div>
            </div>
          </div>
        </div>

        <div className="bg-[#F5F7FA] p-6 sm:p-8 rounded-2xl border border-[#DCE3EB] space-y-4">
          <h3 className="font-bold text-sm text-[#17365D] uppercase tracking-wider">
            Core Production Standards
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-[#217A4B] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#263445]">ISO CR-80 Standard Compliance:</strong>
                <p className="text-[#687586] mt-0.5">Holders calibrated specifically for 85.6mm x 54mm proximity and RFID credentials.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-[#217A4B] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#263445]">Pure Grade Polyvinyl Chloride (PVC):</strong>
                <p className="text-[#687586] mt-0.5">High optical clarity, crack resistance under UV exposure, and smooth rounded corners.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-[#217A4B] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#263445]">Rigid Hardware Attachments:</strong>
                <p className="text-[#687586] mt-0.5">Nickel-plated dog hooks and zinc alloy side levers tested for over 50N spring tension.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-[#DCE3EB] rounded-xl space-y-2">
          <Factory className="w-6 h-6 text-[#17365D]" />
          <h4 className="font-bold text-sm text-[#17365D]">Modern Bengaluru Facility</h4>
          <p className="text-xs text-[#687586]">
            Strategically located in Rajajinagar Industrial Town, Bengaluru for expedited pan-India transit and logistics.
          </p>
        </div>
        <div className="p-6 bg-white border border-[#DCE3EB] rounded-xl space-y-2">
          <ShieldCheck className="w-6 h-6 text-[#17365D]" />
          <h4 className="font-bold text-sm text-[#17365D]">Verified Trade Compliance</h4>
          <p className="text-xs text-[#687586]">
            Full tax compliance, registered GST billing, and secure electronic trade payment workflows.
          </p>
        </div>
        <div className="p-6 bg-white border border-[#DCE3EB] rounded-xl space-y-2">
          <Truck className="w-6 h-6 text-[#17365D]" />
          <h4 className="font-bold text-sm text-[#17365D]">High-Capacity Inventory</h4>
          <p className="text-xs text-[#687586]">
            Large-scale warehouse buffer with continuous availability of core lanyard rolls and crystal holders.
          </p>
        </div>
      </div>
    </div>
  );
}
