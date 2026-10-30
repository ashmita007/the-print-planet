"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  Layers,
  FileText,
  Clock,
  Sparkles,
  Lock,
  UserCheck,
  Send,
  Upload,
  PhoneCall,
  Info,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { clientSubmitBulkOrder, clientLogin, clientRegister } from "@/lib/api";

export default function BulkOrdersPage() {
  const router = useRouter();

  // Mode: school vs corporate tab
  const [orgType, setOrgType] = useState<"school" | "corporate">("school");

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form fields
  const [orgName, setOrgName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Bangalore");
  const [state, setState] = useState("Karnataka");
  const [gstNumber, setGstNumber] = useState("");
  const [categoryType, setCategoryType] = useState("school_lanyards");
  const [quantity, setQuantity] = useState(1000);
  const [requirements, setRequirements] = useState("");
  const [password, setPassword] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successOrder, setSuccessOrder] = useState<any>(null);

  // Check login status on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("client_token") || localStorage.getItem("owner_token");
      const userStr = localStorage.getItem("client_user") || localStorage.getItem("owner_user");
      if (token && userStr) {
        try {
          const u = JSON.parse(userStr);
          setIsLoggedIn(true);
          setCurrentUser(u);
          if (u.email) setEmail(u.email);
          if (u.first_name) setContactPerson(`${u.first_name} ${u.last_name || ""}`.trim());
        } catch {}
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!orgName.trim() || !contactPerson.trim() || !email.trim() || !phone.trim() || !requirements.trim()) {
      setErrorMsg("Please fill in all mandatory fields to initiate bulk order quotation.");
      setLoading(false);
      return;
    }

    if (!isLoggedIn && !password.trim()) {
      setErrorMsg("Please enter an account password so your conversation and tracking dashboard are securely registered.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("organization_type", orgType);
    formData.append("organization_name", orgName);
    formData.append("contact_person", contactPerson);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("city", city);
    formData.append("state", state);
    if (gstNumber) formData.append("gst_number", gstNumber);
    formData.append("category_type", categoryType);
    formData.append("estimated_quantity", quantity.toString());
    formData.append("requirements", requirements);
    if (!isLoggedIn && password) {
      formData.append("password", password);
    }
    if (attachment) {
      formData.append("attachment", attachment);
    }

    const res = await clientSubmitBulkOrder(formData);
    setLoading(false);

    if (res.success) {
      setSuccessOrder(res.order);
      setIsLoggedIn(true);
    } else {
      setErrorMsg(res.error || "Failed to submit bulk order.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 space-y-10 sm:space-y-14">
      <Breadcrumbs items={[{ label: "Bulk & Corporate Orders" }]} />

      {/* Header Section */}
      <div className="border-b border-[#E2E8F0] pb-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold text-[#E87832] uppercase tracking-[0.14em] bg-[#FFF5EE] px-3 py-1 rounded-full border border-[#E87832]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dedicated Institutional &amp; Enterprise Division</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#17365D] tracking-tight leading-tight">
            Bulk Orders for Schools &amp; Corporate Companies
          </h1>
          <p className="text-sm sm:text-base text-[#687586] leading-relaxed">
            Eliminate dealer markups. Partner directly with India’s verified manufacturer for school ID cards, house color satin lanyards, RFID campus smart cards, corporate badge holders, and high-volume commercial printing.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 bg-[#17365D] hover:bg-[#102742] text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-2xs"
            >
              <UserCheck className="w-4 h-4 text-[#E87832]" />
              <span>{isLoggedIn ? "Track My Orders & Messages" : "Client Portal / Order Login"}</span>
            </Link>
            <a
              href="https://wa.me/919741808034?text=Hi%2C%20I%20am%20looking%20for%20bulk%20orders%20for%20our%20school%2Fcompany."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-[#17365D] border border-[#DCE3EB] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all"
            >
              <PhoneCall className="w-4 h-4 text-[#E87832]" />
              <span>Talk to Wholesale Desk</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sector Selection Tabs (School vs Corporate) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => {
            setOrgType("school");
            setCategoryType("school_lanyards");
          }}
          className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            orgType === "school"
              ? "bg-[#17365D] text-white border-[#17365D] shadow-xl ring-2 ring-[#E87832]"
              : "bg-white text-[#263445] border-[#DCE3EB] hover:border-slate-400"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${orgType === "school" ? "bg-white/10 text-white" : "bg-[#FFF5EE] text-[#E87832]"}`}>
                <GraduationCap className="w-7 h-7" />
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${orgType === "school" ? "bg-[#E87832] text-white" : "bg-slate-100 text-slate-600"}`}>
                Schools &amp; Colleges
              </span>
            </div>
            <h3 className="text-xl font-bold">Educational Institutions</h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${orgType === "school" ? "text-slate-200" : "text-[#687586]"}`}>
              Specialized annual packages for student ID cards, house color custom woven lanyards, teacher badges, breakaway safety hooks, and library RFID smart cards.
            </p>
          </div>
          <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between text-xs font-semibold">
            <span>Standard MOQ: 500+ pieces</span>
            <span className="flex items-center gap-1 text-[#E87832]">Select School Tier &rarr;</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setOrgType("corporate");
            setCategoryType("corporate_lanyards");
          }}
          className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            orgType === "corporate"
              ? "bg-[#17365D] text-white border-[#17365D] shadow-xl ring-2 ring-[#E87832]"
              : "bg-white text-[#263445] border-[#DCE3EB] hover:border-slate-400"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${orgType === "corporate" ? "bg-white/10 text-white" : "bg-[#FFF5EE] text-[#E87832]"}`}>
                <Building2 className="w-7 h-7" />
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${orgType === "corporate" ? "bg-[#E87832] text-white" : "bg-slate-100 text-slate-600"}`}>
                Enterprises &amp; MNCs
              </span>
            </div>
            <h3 className="text-xl font-bold">Corporate Companies</h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${orgType === "corporate" ? "text-slate-200" : "text-[#687586]"}`}>
              Pantone-matched digital satin lanyards, executive acrylic &amp; metal card holders, 13.56MHz Mifare RFID access cards, GST tax invoicing, and nationwide branch dispatches.
            </p>
          </div>
          <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between text-xs font-semibold">
            <span>Standard MOQ: 500 – 100,000+ pieces</span>
            <span className="flex items-center gap-1 text-[#E87832]">Select Corporate Tier &rarr;</span>
          </div>
        </button>
      </div>

      {/* Main Order & Registration Section */}
      {successOrder ? (
        <div className="bg-white border-2 border-[#2ECC71] rounded-2xl p-6 sm:p-10 text-center space-y-4 shadow-lg anim-scale-in">
          <div className="w-16 h-16 bg-[#E8F8F5] text-[#2ECC71] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#17365D]">
            Bulk Inquiry #{successOrder.order_number} Registered!
          </h2>
          <p className="text-sm text-[#687586] max-w-xl mx-auto leading-relaxed">
            Your bulk order inquiry for <strong>{successOrder.organization_name}</strong> has been logged in our factory system and your conversation thread has been opened.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/orders/${successOrder.order_number}`}
              className="bg-[#E87832] hover:bg-[#d66b28] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2"
            >
              <span>Open Conversation &amp; Track Order</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/orders"
              className="bg-[#17365D] hover:bg-[#102742] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all"
            >
              <span>View All My Orders</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Order Request & Account Form */}
          <div className="lg:col-span-8 bg-white border border-[#DCE3EB] rounded-2xl p-5 sm:p-8 shadow-2xs space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#17365D]">
                Bulk Order Request &amp; Account Registration
              </h2>
              <p className="text-xs sm:text-sm text-[#687586] mt-1">
                Enter your institution specifications below. Your account is automatically created to preserve all messages, quotations, and dispatch tracking in your dashboard.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-[#FDEDEC] border border-[#F5B7B1] text-[#C0392B] p-4 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#263445] mb-1">
                    {orgType === "school" ? "School / College Name *" : "Company / Enterprise Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={orgType === "school" ? "e.g. St. Joseph Public School" : "e.g. Infosys / Tech Solutions Pvt Ltd"}
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#263445] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#263445] mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Administrator / Procurement Manager"
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#263445] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#263445] mb-1">
                    Official Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="procurement@school.edu.in"
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#263445] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#263445] mb-1">
                    Contact / WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#263445] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#263445] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#263445] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#263445] mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#263445] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#263445] mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="29XXXXX..."
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#263445] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#263445] mb-1">
                    Primary Product Category *
                  </label>
                  <select
                    value={categoryType}
                    onChange={(e) => setCategoryType(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#263445] outline-none"
                  >
                    {orgType === "school" ? (
                      <>
                        <option value="school_lanyards">School Satin Lanyard Rolls &amp; Printing</option>
                        <option value="student_pvc_cards">Student PVC Identity Cards (CR-80)</option>
                        <option value="school_holders">Rigid PVC Badge &amp; ID Holders</option>
                        <option value="rfid_school">RFID Smart Cards (Attendance &amp; Library)</option>
                        <option value="breakaway_hooks">Breakaway Safety Hooks &amp; Clips</option>
                      </>
                    ) : (
                      <>
                        <option value="corporate_lanyards">Custom Brand Printed Satin Lanyards</option>
                        <option value="corporate_holders">Executive PVC &amp; Acrylic Badge Holders</option>
                        <option value="rfid_corporate">13.56MHz Mifare Access &amp; Turnstile Cards</option>
                        <option value="die_cutters">In-house Industrial ID Card Machinery</option>
                        <option value="commercial_printing">Commercial Printing &amp; Lens Packaging</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#263445] mb-1">
                    Estimated Quantity (Units) *
                  </label>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 500)}
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#263445] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#263445] mb-1">
                  Specific Requirements &amp; Artwork Instructions *
                </label>
                <textarea
                  rows={4}
                  required
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Describe your size (12mm/16mm/20mm), colors, fitting hook requirements, expected delivery timeline, and packaging needs..."
                  className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl p-3 text-xs sm:text-sm text-[#263445] outline-none leading-relaxed"
                />
              </div>

              {/* Artwork / Logo Upload */}
              <div>
                <label className="block text-xs font-bold text-[#263445] mb-1">
                  Upload School Crest / Corporate Logo / Spec Sheet (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-[#F5F7FA] hover:bg-slate-200 text-[#17365D] border border-[#DCE3EB] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors">
                    <Upload className="w-4 h-4 text-[#E87832]" />
                    <span>{attachment ? attachment.name : "Choose File (PDF, PNG, JPG, AI, CDR)"}</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAttachment(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {attachment && (
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="text-xs text-rose-500 font-semibold hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Password Registration (If not logged in) */}
              {!isLoggedIn && (
                <div className="bg-[#FFF5EE] border border-[#E87832]/30 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#17365D]">
                    <Lock className="w-4 h-4 text-[#E87832]" />
                    <span>Create Account Password for Conversation &amp; Tracking *</span>
                  </div>
                  <p className="text-[11px] text-[#687586]">
                    Set a secure password. You will use this password and your email to view quotes, reply to messages, and download invoices in your client dashboard.
                  </p>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter at least 6 characters..."
                    className="w-full bg-white border border-[#DCE3EB] focus:border-[#17365D] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#263445] outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E87832] hover:bg-[#d66b28] text-white py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting &amp; Registering Account...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Bulk Order Inquiry &amp; Open Conversation</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Summary Column: Factory SLAs & Guarantee */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#17365D] text-white p-6 rounded-2xl space-y-4 shadow-md">
              <div className="flex items-center gap-2 text-[#E87832] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Direct Factory Advantage</span>
              </div>
              <h3 className="text-xl font-bold">Why Institutions Choose Print Planet</h3>
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero middlemen:</strong> Save up to 35% compared to local printing shop brokers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Free pre-production proof:</strong> Physical sample approvals before full run dispatch.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Conversation audit trail:</strong> Complete record of colors, specs, and quotes saved in your portal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Full GST compliance:</strong> Official e-way bills and input tax credit invoices issued promptly.</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#F8FAFC] border border-[#DCE3EB] p-5 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#17365D] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#E87832]" />
                <span>Turnaround Timelines</span>
              </h4>
              <div className="space-y-2 text-xs text-[#687586]">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Standard 1,000–5,000 rolls</span>
                  <strong className="text-[#17365D]">2 – 3 Days</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Large 10,000+ units</span>
                  <strong className="text-[#17365D]">4 – 6 Days</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Pan-India Transit</span>
                  <strong className="text-[#17365D]">24 – 48 Hours</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
