import React from "react";
import { Phone, Mail, MapPin, ShieldCheck, Clock, MessageSquare } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactFormClient from "@/components/ContactFormClient";
import { getSiteSettings } from "@/lib/api";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const businessName = settings?.business_name || "The Print Planet";
  const phone = settings?.phone || "+91 98980 61569";
  const email = settings?.email || "sales@theprintplanet.in";
  const address = settings?.address || "Plot 42, Industrial Area Phase II, Ahmedabad, Gujarat, India - 380004";
  const gst = settings?.gst_number || "24AWOPP8281E1Z4";
  const whatsapp = settings?.whatsapp || "+91 98980 61569";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-10">
      <Breadcrumbs items={[{ label: "Contact Us & Quotations" }]} />

      {/* Hero */}
      <div className="bg-[#102742] text-white p-8 sm:p-12 rounded-2xl border-l-4 border-[#E87832]">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-[#E87832] uppercase tracking-wider">
            Industrial Sales & Trade Desk
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Contact & Bulk Quotation Enquiry
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Connect with our sales engineering team for volume pricing, custom Pantone roll dyeing,
            and machine demonstrations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Direct Info (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#F5F7FA] p-6 rounded-2xl border border-[#DCE3EB] space-y-5 text-xs">
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
              </div>
            </div>
          </div>

          {/* Quick WhatsApp Action Card */}
          <div className="bg-[#217A4B] text-white p-6 rounded-2xl space-y-3 shadow-md">
            <h3 className="font-bold text-sm">Need Instant Quotation via WhatsApp?</h3>
            <p className="text-xs text-white/90 leading-relaxed">
              Send your roll quantities and holder requirements directly to our on-duty trade manager.
            </p>
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=Hello%2C%20I%20am%20enquiring%20about%20bulk%20ID%20card%20products%20from%20The%20Print%20Planet.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-[#217A4B] font-bold text-xs py-2.5 px-4 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Start WhatsApp Trade Chat &rarr;
            </a>
          </div>
        </div>

        {/* Right Column: Interactive Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#DCE3EB] shadow-xs">
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
