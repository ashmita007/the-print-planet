"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Clock4,
  Award,
  Users2,
  Layers,
  FileCheck2,
  PhoneCall,
  Sparkles,
  Lock,
  UserCheck,
  Send,
  Upload,
  Info,
  LogIn,
  KeyRound,
  Check,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { clientSubmitBulkOrder, clientLogin, clientRegister } from "@/lib/api";

const VOLUME_TIERS = [
  {
    tier: "Tier 1: Commercial Starter",
    volume: "500 – 2,500 Units",
    discount: "Standard Wholesale Rate",
    turnaround: "3 – 4 Business Days",
    features: [
      "Full digital pre-press proofing included",
      "Choice of standard stock colors & widths",
      "Nickel-plated steel dog hook fittings",
      "Standard courier dispatch across India",
    ],
    popular: false,
    recommendedQty: 1000,
  },
  {
    tier: "Tier 2: Business Enterprise",
    volume: "2,500 – 10,000 Units",
    discount: "Up to 20% Volume Discount",
    turnaround: "2 – 3 Business Days (Priority)",
    features: [
      "Free physical pre-production pilot sample",
      "Exact Pantone (PMS) yarn color matching",
      "Dedicated Corporate Account Manager",
      "Free custom barcode serialization & sorting",
      "Priority manufacturing slot",
    ],
    popular: true,
    recommendedQty: 5000,
  },
  {
    tier: "Tier 3: Institutional Contract",
    volume: "10,000+ Units (Annual Rate)",
    discount: "Maximum Factory Direct Pricing",
    turnaround: "Scheduled Staggered Dispatches",
    features: [
      "Custom tooling & mold die fabrication",
      "Quarterly reserved warehouse buffer stock",
      "Dedicated credit payment terms (pre-approved)",
      "Annual Price Freeze Agreement",
      "Custom branded packaging & kits",
    ],
    popular: false,
    recommendedQty: 15000,
  },
];

export default function CorporatePage() {
  const router = useRouter();

  // Active sector tab: corporate vs school
  const [orgType, setOrgType] = useState<"corporate" | "school">("corporate");

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Quick Inline Login modal or toggle if user already has an account
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Bulk Order Form fields
  const [orgName, setOrgName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Bangalore");
  const [state, setState] = useState("Karnataka");
  const [gstNumber, setGstNumber] = useState("");
  const [categoryType, setCategoryType] = useState("corporate_lanyards");
  const [quantity, setQuantity] = useState(2500);
  const [selectedTier, setSelectedTier] = useState("Tier 2: Business Enterprise");
  const [requirements, setRequirements] = useState("");
  const [password, setPassword] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successOrder, setSuccessOrder] = useState<any>(null);

  const formRef = useRef<HTMLDivElement>(null);

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

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    const res = await clientLogin({ username: loginEmail, password: loginPassword });
    setLoginLoading(false);

    if (res.success) {
      setIsLoggedIn(true);
      setCurrentUser(res.user);
      if (res.user?.email) setEmail(res.user.email);
      if (res.user?.first_name) setContactPerson(`${res.user.first_name} ${res.user.last_name || ""}`.trim());
      setAuthMode("register"); // back to form
    } else {
      setLoginError(res.error || "Invalid email or password.");
    }
  };

  const handleSelectTier = (tier: (typeof VOLUME_TIERS)[0]) => {
    setSelectedTier(tier.tier);
    setQuantity(tier.recommendedQty);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!orgName.trim() || !contactPerson.trim() || !email.trim() || !phone.trim() || !requirements.trim()) {
      setErrorMsg("Please fill in all required company/institution fields to submit your bulk order.");
      setLoading(false);
      return;
    }

    if (!isLoggedIn && !password.trim()) {
      setErrorMsg("Please set an account password so your bulk order, conversation, and quotes are securely saved.");
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
    formData.append(
      "requirements",
      `[Selected Slab: ${selectedTier}]\n\n${requirements}`
    );
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
      if (res.requires_login) {
        setAuthMode("login");
        setLoginEmail(email);
        setErrorMsg("An account with this email already exists. Please log in below to submit your order.");
      } else {
        setErrorMsg(res.error || "Failed to submit bulk order.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 space-y-10 sm:space-y-14">
      <Breadcrumbs items={[{ label: "Bulk & Corporate Orders" }]} />

      {/* Hero Header */}
      <div className="border-b border-[#E2E8F0] pb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3.5">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold text-[#E87832] uppercase tracking-[0.14em] bg-[#FFF5EE] px-3.5 py-1 rounded-full border border-[#E87832]/20">
              <Building2 className="w-3.5 h-3.5" />
              <span>Direct Factory Wholesale &amp; Institutional Supply</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#17365D] tracking-tight leading-tight">
              Corporate &amp; School Bulk Printing Orders
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-[#687586] leading-relaxed max-w-2xl">
              Eliminate distributor commissions and intermediary markups. Partner directly with our Sunkadakatte, Bengaluru manufacturing facility for corporate badges, satin lanyard rolls, school uniform identity cards, and scheduled recurring employee dispatches.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="bg-[#E87832] hover:bg-[#d66b28] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
              >
                <span>Place Bulk Order / Register</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/orders"
                className="bg-[#17365D] hover:bg-[#102742] text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-2xs flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-[#FFA868]" />
                <span>{isLoggedIn ? "Track My Orders & Messages" : "Client Portal Login"}</span>
              </Link>

              <a
                href="https://wa.me/919741808034?text=Hi%2C%20I%20am%20looking%20for%20bulk%20orders%20for%20our%20company%2Fschool."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-[#F8FAFC] text-[#17365D] border border-[#DCE3EB] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-[#E87832]" />
                <span>Wholesale Desk (+91 97418 08034)</span>
              </a>
            </div>
          </div>

          {/* User Account Pill Banner */}
          <div className="bg-[#F8FAFC] border border-[#DCE3EB] p-5 rounded-2xl lg:w-80 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Account Status</span>
              {isLoggedIn ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Logged In
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Guest Buyer
                </span>
              )}
            </div>

            {isLoggedIn ? (
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#17365D] truncate">
                  {currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name || ""}` : currentUser?.username}
                </div>
                <div className="text-[11px] text-slate-500 truncate">{currentUser?.email}</div>
                <div className="pt-2">
                  <Link href="/orders" className="text-xs font-bold text-[#E87832] hover:underline flex items-center gap-1">
                    <span>Open My Orders &amp; Chat &rarr;</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[#687586]">
                  Already have a registered corporate or school account?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    formRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full bg-[#17365D] hover:bg-[#102742] text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#FFA868]" />
                  <span>Log in to your account</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Corporate Advantages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-[#FFF5EE] text-[#E87832] flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#17365D]">Direct Factory Pricing</h3>
          <p className="text-xs text-[#687586] leading-relaxed">
            Zero broker fees. Factory direct production saves up to 35% on high volume ID materials, ribbons, and card holders.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-[#F0F4F8] text-[#17365D] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#17365D]">Free Sample Proofs</h3>
          <p className="text-xs text-[#687586] leading-relaxed">
            For orders over 2,500 pieces, we manufacture and express-courier physical pilot sample proofs for executive sign-off.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-[#FFF5EE] text-[#E87832] flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#17365D]">Pan-India Logistics</h3>
          <p className="text-xs text-[#687586] leading-relaxed">
            Daily air courier to major metros (Mumbai, Delhi, Hyderabad, Chennai) and surface logistics with live AWB consignment tracking.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-[#F0F4F8] text-[#17365D] flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#17365D]">Full GST Tax Invoicing</h3>
          <p className="text-xs text-[#687586] leading-relaxed">
            Claim 100% input tax credit with verified GSTIN (29AAQFT3909B1ZZ), e-way bills, and compliant corporate billing.
          </p>
        </div>
      </div>

      {/* Volume Tiers (Transparent Pricing Slabs) */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-xs font-bold text-[#E87832] uppercase tracking-wider">
            Volume Discount Slabs
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#17365D]">
            Corporate Order Tiers &amp; Service Levels
          </h2>
          <p className="text-xs sm:text-sm text-[#687586]">
            Select your anticipated order quantity below to prefill your inquiry specifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {VOLUME_TIERS.map((tier, idx) => {
            const isSelected = selectedTier === tier.tier;
            return (
              <div
                key={idx}
                className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all ${
                  isSelected
                    ? "bg-white border-2 border-[#E87832] shadow-xl ring-2 ring-[#E87832]/30 relative"
                    : tier.popular
                    ? "bg-white border-2 border-[#17365D] shadow-md relative"
                    : "bg-white border border-[#DCE3EB] shadow-xs hover:border-[#17365D]/30"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E87832] text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full tracking-wider shadow-xs">
                    Most Popular for Enterprises
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#17365D]">{tier.tier}</h3>
                    <div className="text-2xl font-black text-[#17365D] mt-1">{tier.volume}</div>
                    <div className="text-xs font-semibold text-[#E87832] mt-0.5">{tier.discount}</div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock4 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Lead time: {tier.turnaround}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Included In Tier:
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {tier.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleSelectTier(tier)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#E87832] text-white shadow-md"
                        : "bg-[#17365D] hover:bg-[#102742] text-white"
                    }`}
                  >
                    <span>{isSelected ? "Selected Slab" : `Choose ${tier.tier.split(":")[0]}`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Order & Registration Section */}
      <div ref={formRef} className="scroll-mt-24 space-y-6">
        <div className="border-t border-[#E2E8F0] pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-bold text-[#E87832] uppercase tracking-wider">
                Direct Submission Desk
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#17365D]">
                Place Your Bulk Order &amp; Register Account
              </h2>
              <p className="text-xs sm:text-sm text-[#687586] mt-0.5">
                Every bulk order automatically creates a verified client account so you can track quotes, download proofs, and chat with the factory team.
              </p>
            </div>

            {/* Sector Tabs: Corporate vs School */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F5F7FA] border border-[#DCE3EB] rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => {
                  setOrgType("corporate");
                  setCategoryType("corporate_lanyards");
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  orgType === "corporate"
                    ? "bg-[#17365D] text-white shadow-2xs"
                    : "text-[#263445] hover:bg-white"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Corporate Company</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOrgType("school");
                  setCategoryType("school_lanyards");
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  orgType === "school"
                    ? "bg-[#17365D] text-white shadow-2xs"
                    : "text-[#263445] hover:bg-white"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>School / College</span>
              </button>
            </div>
          </div>
        </div>

        {/* Successful Submission View */}
        {successOrder ? (
          <div className="bg-white border-2 border-[#2ECC71] rounded-2xl p-6 sm:p-10 text-center space-y-4 shadow-lg anim-scale-in">
            <div className="w-16 h-16 bg-[#E8F8F5] text-[#2ECC71] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#17365D]">
              Bulk Order #{successOrder.order_number} Registered!
            </h2>
            <p className="text-sm text-[#687586] max-w-xl mx-auto leading-relaxed">
              Your inquiry for <strong>{successOrder.organization_name}</strong> has been logged in our factory queue. Your account is active and your direct conversation thread is ready.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
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
                <span>Go to Client Orders Dashboard</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Cols: Form or Login */}
            <div className="lg:col-span-8 bg-white border border-[#DCE3EB] rounded-2xl p-5 sm:p-8 shadow-2xs space-y-6">
              {/* If user clicked Login */}
              {authMode === "login" && !isLoggedIn ? (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#17365D]">Sign In to Your Account</h3>
                      <p className="text-xs text-slate-500">Log in to link this bulk order to your existing company account.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAuthMode("register")}
                      className="text-xs font-bold text-[#E87832] hover:underline"
                    >
                      &larr; Back to Order Form
                    </button>
                  </div>

                  {loginError && (
                    <div className="bg-[#FDEDEC] border border-[#F5B7B1] text-[#C0392B] p-3 rounded-xl text-xs font-semibold">
                      {loginError}
                    </div>
                  )}

                  <form onSubmit={handleInlineLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#263445] mb-1">Email or Username</label>
                      <input
                        type="text"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#263445] outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-[#263445]">Password</label>
                        <Link href="/account/forgot-password" className="text-[11px] text-[#E87832] font-semibold hover:underline">
                          Forgot Password?
                        </Link>
                      </div>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#263445] outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full bg-[#17365D] hover:bg-[#102742] text-white py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md"
                    >
                      {loginLoading ? "Signing in..." : "Sign In & Continue Order"}
                    </button>
                  </form>
                </div>
              ) : (
                /* Registration & Order Submission Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMsg && (
                    <div className="bg-[#FDEDEC] border border-[#F5B7B1] text-[#C0392B] p-4 rounded-xl text-xs font-semibold">
                      {errorMsg}
                    </div>
                  )}

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
                        placeholder={orgType === "school" ? "e.g. Greenwood High School" : "e.g. Wipro / Tech Corp Pvt Ltd"}
                        className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#263445] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#263445] mb-1">
                        Contact Person &amp; Designation *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="e.g. Priya Sharma (HR / Procurement)"
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
                        placeholder="procurement@company.com"
                        className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#263445] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#263445] mb-1">
                        Phone / WhatsApp Number *
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
                      <label className="block text-xs font-bold text-[#263445] mb-1">GSTIN (For 100% Tax Credit)</label>
                      <input
                        type="text"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        placeholder="29AAAAA0000A1Z5"
                        className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#263445] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#263445] mb-1">
                        Product Line / Material *
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
                            <option value="school_holders">Rigid PVC Badge &amp; ID Card Holders</option>
                            <option value="rfid_school">RFID Smart Cards (Attendance &amp; Library)</option>
                            <option value="breakaway_hooks">Breakaway Safety Hooks &amp; Fittings</option>
                          </>
                        ) : (
                          <>
                            <option value="corporate_lanyards">Custom Brand Printed Satin Lanyards (16mm/20mm)</option>
                            <option value="corporate_holders">Executive PVC &amp; Acrylic Badge Holders</option>
                            <option value="rfid_corporate">13.56MHz Mifare Access &amp; Turnstile Cards</option>
                            <option value="die_cutters">In-house Industrial ID Card Cutters &amp; Fusing Units</option>
                            <option value="commercial_printing">Commercial Printing &amp; Lens Packaging Solutions</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#263445] mb-1">
                        Estimated Order Quantity *
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
                      Specifications &amp; Custom Branding Requirements *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="Specify lanyard width (12/16/20mm), hook types, Pantone colors, delivery deadlines, single vs multi-branch shipping requirements..."
                      className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl p-3 text-xs sm:text-sm text-[#263445] outline-none leading-relaxed"
                    />
                  </div>

                  {/* Artwork / Spec Sheet Attachment */}
                  <div>
                    <label className="block text-xs font-bold text-[#263445] mb-1">
                      Upload Logo / Artwork / Spec Sheet (Optional)
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

                  {/* Password registration for guest users */}
                  {!isLoggedIn && (
                    <div className="bg-[#FFF5EE] border border-[#E87832]/30 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#17365D]">
                          <Lock className="w-4 h-4 text-[#E87832]" />
                          <span>Create Password to Register Account *</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAuthMode("login")}
                          className="text-[11px] font-bold text-[#E87832] hover:underline"
                        >
                          Already have an account? Log In
                        </button>
                      </div>
                      <p className="text-[11px] text-[#687586]">
                        Your account will allow you to track your bulk order quotation, review digital sample proofs, and chat directly with our technical production team.
                      </p>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Set account password (min. 6 characters)..."
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
                      <span>Registering &amp; Submitting Order...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Bulk Order Inquiry &amp; Register Account</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right 4 Cols: Factory Assurances */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#17365D] text-white p-6 rounded-2xl space-y-4 shadow-md">
                <div className="flex items-center gap-2 text-[#FFA868] text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#E87832]" />
                  <span>Institutional Assurance</span>
                </div>
                <h3 className="text-xl font-bold">The Print Planet Direct Standard</h3>
                <ul className="space-y-3 text-xs text-slate-200">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Volume Slabs:</strong> Locked-in wholesale prices with zero middleman commissions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Pre-production Sample:</strong> Physical approval prior to bulk manufacturing run.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Permanent Thread History:</strong> Every spec, proof, and message is preserved in your portal.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Instant GST Invoicing:</strong> Clean corporate credit documentation with e-way bills.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#F8FAFC] border border-[#DCE3EB] p-5 rounded-2xl space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#17365D] flex items-center gap-1.5">
                  <Clock4 className="w-4 h-4 text-[#E87832]" />
                  <span>Production Turnaround</span>
                </h4>
                <div className="space-y-2 text-xs text-[#687586]">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Pilot Samples (Pre-run)</span>
                    <strong className="text-[#17365D]">24 – 48 Hours</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Bulk Run (1k–10k Units)</span>
                    <strong className="text-[#17365D]">2 – 4 Days</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Pan-India Courier Dispatch</span>
                    <strong className="text-[#17365D]">24 – 48 Hours</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ongoing Corporate Retainers */}
      <div className="bg-[#F5F7FA] border border-[#DCE3EB] rounded-2xl p-6 sm:p-10 space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-[#E87832] uppercase tracking-wider">
            Ongoing Corporate Retainers
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#17365D] mt-1">
            Scheduled Monthly Batches for Employee Onboarding
          </h2>
          <p className="text-xs sm:text-sm text-[#687586] mt-1">
            We partner with corporate HR &amp; administration teams to print and dispatch weekly or monthly employee onboarding kits directly to multiple regional branch offices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2 shadow-2xs">
            <Users2 className="w-6 h-6 text-[#17365D]" />
            <h4 className="font-bold text-sm text-[#17365D]">Zero-Delay Onboarding</h4>
            <p className="text-xs text-[#687586] leading-relaxed">
              Upload your new joiner batch via Excel. We print, pack, and courier employee kits directly to your desk in 48 hours.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2 shadow-2xs">
            <Layers className="w-6 h-6 text-[#E87832]" />
            <h4 className="font-bold text-sm text-[#17365D]">Stock Buffer Reservation</h4>
            <p className="text-xs text-[#687586] leading-relaxed">
              We hold custom dyed ribbons, pre-molded holders, and clips in our warehouse so you never face out-of-stock delays.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] space-y-2 shadow-2xs">
            <Award className="w-6 h-6 text-[#17365D]" />
            <h4 className="font-bold text-sm text-[#17365D]">Dedicated SLA Guarantee</h4>
            <p className="text-xs text-[#687586] leading-relaxed">
              Formal Service Level Agreement guaranteeing strict color tolerances, mechanical durability, and delivery windows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
