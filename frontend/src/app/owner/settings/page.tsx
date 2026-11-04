"use client";

import { ColorBar } from "@/components/animations/PrintMarks";
import { HERO_DEFAULTS, HERO_LIMITS, heroCopy, heroHeadlineClass } from "@/lib/hero";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Settings,
  Save,
  CheckCircle,
  AlertCircle,
  Building2,
  Lock,
  Globe,
  Database,
  Mail,
  Download,
  Loader2,
  FileSpreadsheet,
  CloudUpload,
  CloudDownload,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2,
  Phone,
  MessageSquare,
  Award,
  Factory,
  Truck,
} from "lucide-react";
import {
  getSiteSettings,
  ownerUpdateSettings,
  getApiUrl,
  ownerTriggerDatabaseBackupEmail,
  ownerDownloadDatabaseBackup,
  ownerDownloadCatalogExcel,
  ownerSyncCloudDatabase,
  ownerGetEmailDiagnostics,
  ownerSendTestEmail,
} from "@/lib/api";
import { SiteSettings } from "@/lib/types";

type TabKey = "hero" | "about" | "identity" | "database" | "security";

type EmailDiagnostics = {
  config?: {
    provider?: string;
    preferred_provider?: string;
    brevo_key_configured?: boolean;
    brevo_key_preview?: string;
    brevo_sender_email?: string;
    resend_key_configured?: boolean;
    resend_key_preview?: string;
    resend_from_email?: string;
    active_sender_email?: string;
    owner_recipient?: string;
    smtp_backend?: string;
  };
  account?: { email?: string; company_name?: string; plan?: string };
  senders?: { email?: string; name?: string; active?: boolean }[];
  sender_verified?: boolean;
  brevo_sender_verified?: boolean;
  resend_sender_verified?: boolean;
  resend?: {
    key_valid?: boolean;
    sender_domain?: string;
    sandbox?: boolean;
    sender_verified?: boolean;
    note?: string;
    domains?: { name?: string; status?: string }[];
  } | null;
  problems?: string[];
};

function OwnerSettingsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = (searchParams.get("tab") as TabKey) || "hero";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Sync tab with URL
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as TabKey;
    if (tabFromUrl && ["hero", "about", "identity", "database", "security"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    router.replace(`/owner/settings?tab=${tab}`);
  };

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Identity & Contact
  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [footerText, setFooterText] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // 2. Homepage Hero
  const [heroBadge, setHeroBadge] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroCaption, setHeroCaption] = useState("");

  // 3. Dynamic About Us CMS
  const [aboutHeroTag, setAboutHeroTag] = useState("");
  const [aboutHeroTitle, setAboutHeroTitle] = useState("");
  const [aboutHeroSubtitle, setAboutHeroSubtitle] = useState("");
  const [aboutStoryTitle, setAboutStoryTitle] = useState("");
  const [aboutStoryP1, setAboutStoryP1] = useState("");
  const [aboutStoryP2, setAboutStoryP2] = useState("");
  const [stat1Val, setStat1Val] = useState("");
  const [stat1Label, setStat1Label] = useState("");
  const [stat2Val, setStat2Val] = useState("");
  const [stat2Label, setStat2Label] = useState("");
  const [stat3Val, setStat3Val] = useState("");
  const [stat3Label, setStat3Label] = useState("");
  const [stat4Val, setStat4Val] = useState("");
  const [stat4Label, setStat4Label] = useState("");

  const [standard1Title, setStandard1Title] = useState("");
  const [standard1Desc, setStandard1Desc] = useState("");
  const [standard2Title, setStandard2Title] = useState("");
  const [standard2Desc, setStandard2Desc] = useState("");
  const [standard3Title, setStandard3Title] = useState("");
  const [standard3Desc, setStandard3Desc] = useState("");

  const [facility1Title, setFacility1Title] = useState("");
  const [facility1Desc, setFacility1Desc] = useState("");
  const [facility2Title, setFacility2Title] = useState("");
  const [facility2Desc, setFacility2Desc] = useState("");
  const [facility3Title, setFacility3Title] = useState("");
  const [facility3Desc, setFacility3Desc] = useState("");

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passSubmitting, setPassSubmitting] = useState(false);
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");

  // Database backup states
  const [backupEmailLoading, setBackupEmailLoading] = useState(false);
  const [backupDownloadLoading, setBackupDownloadLoading] = useState(false);
  const [exportCatalogLoading, setExportCatalogLoading] = useState(false);
  const [cloudSyncLoading, setCloudSyncLoading] = useState(false);
  const [cloudRestoreLoading, setCloudRestoreLoading] = useState(false);
  const [backupNotice, setBackupNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Email delivery diagnostics
  const [emailTestLoading, setEmailTestLoading] = useState(false);
  const [emailDiagnostics, setEmailDiagnostics] = useState<EmailDiagnostics | null>(null);
  const [emailTestNotice, setEmailTestNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getSiteSettings().then((s) => {
      setSettings(s);
      setBusinessName(s.business_name || "THE PRINT PLANET");
      setTagline(s.tagline || "Specialist in PVC Cards | Lens Packaging & Cleaning | Commercial Printing | Bulk ID Solutions");
      setEmail(s.email || "theprintplanet01@gmail.com");
      setPhone(s.phone || "+91 97418 08034");
      setWhatsapp(s.whatsapp || "+91 97418 08034");
      setAddress(s.address || "");
      setGstNumber(s.gst_number || "29AAQFT3909B1ZZ");
      setFooterText(s.footer_text || "THE PRINT PLANET — Specialist in PVC Cards | Lens Packaging & Cleaning | Commercial Printing | Bulk ID Solutions. ✱ Your Vision is Our Focus ✱. GSTIN: 29AAQFT3909B1ZZ | PAN: AAQFT3909B.");
      setLogoUrl(s.logo_url || "");

      // Hero
      setHeroBadge(s.hero_badge || HERO_DEFAULTS.badge);
      setHeroTitle(s.hero_title || HERO_DEFAULTS.title);
      setHeroSubtitle(s.hero_subtitle || HERO_DEFAULTS.subtitle);
      setHeroCaption(s.hero_caption || HERO_DEFAULTS.caption);

      // About
      const about = s.about_data || {};
      setAboutHeroTag(about.hero_tag || "Industrial Manufacturer & Distributor");
      setAboutHeroTitle(about.hero_title || `About ${s.business_name || "THE PRINT PLANET"}`);
      setAboutHeroSubtitle(
        about.hero_subtitle ||
          "Established as a dedicated production and wholesale distribution facility in Bengaluru, Karnataka, specializing in high-capacity ID card identification products, premium satin rolls, lens packaging, hardware fittings, and card fabrication machinery."
      );
      setAboutStoryTitle(about.story_title || "Engineering Precision in Identification Systems");
      setAboutStoryP1(
        about.story_p1 ||
          `At ${s.business_name || "THE PRINT PLANET"}, our operations combine high-capacity polymer molding, ribbon slitting, and ultrasonic tooling to produce uniform badge accessories designed to meet strict institutional requirements.`
      );
      setAboutStoryP2(
        about.story_p2 ||
          "Whether fulfilling recurring orders of 20mm Indian Royal Blue satin rolls or delivering heavy-duty DCT4500 automatic card punch cutters, our manufacturing processes prioritize dimensional consistency, burr-free edge finishing, and reliable mechanical tensile strength."
      );
      setStat1Val(about.stat_1_val || "50,000+");
      setStat1Label(about.stat_1_label || "Holders Produced Daily");
      setStat2Val(about.stat_2_val || "10,000+ m");
      setStat2Label(about.stat_2_label || "Daily Satin Ribbon Output");
      setStat3Val(about.stat_3_val || "180+");
      setStat3Label(about.stat_3_label || "Active Commercial SKUs");
      setStat4Val(about.stat_4_val || "500+");
      setStat4Label(about.stat_4_label || "Institutional Clients Across India");

      setStandard1Title(about.standard_1_title || "ISO CR-80 Standard Compliance");
      setStandard1Desc(about.standard_1_desc || "Holders calibrated specifically for 85.6mm x 54mm proximity and RFID credentials.");
      setStandard2Title(about.standard_2_title || "Pure Grade Polyvinyl Chloride (PVC)");
      setStandard2Desc(about.standard_2_desc || "High optical clarity, crack resistance under UV exposure, and smooth rounded corners.");
      setStandard3Title(about.standard_3_title || "Rigid Hardware Attachments");
      setStandard3Desc(about.standard_3_desc || "Nickel-plated dog hooks and zinc alloy side levers tested for over 50N spring tension.");

      setFacility1Title(about.facility_1_title || "Modern Bengaluru Facility");
      setFacility1Desc(about.facility_1_desc || "Strategically located at Byraveshwaranagar, Sunkadakatte, Bengaluru for expedited pan-India transit and logistics.");
      setFacility2Title(about.facility_2_title || "Verified Trade Compliance");
      setFacility2Desc(about.facility_2_desc || "Full tax compliance, registered GST billing, and secure electronic trade payment workflows.");
      setFacility3Title(about.facility_3_title || "High-Capacity Inventory");
      setFacility3Desc(about.facility_3_desc || "Large-scale warehouse buffer with continuous availability of core lanyard rolls and crystal holders.");

      setLoading(false);
    });
  }, []);

  const handleSaveHero = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const res = await ownerUpdateSettings({
      hero_badge: heroBadge.trim(),
      hero_title: heroTitle.trim(),
      hero_subtitle: heroSubtitle.trim(),
      hero_caption: heroCaption.trim(),
    });

    setSaving(false);
    if (res.success) {
      setSuccessMsg("Homepage Hero banner & captions saved successfully! Live now on the homepage.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setErrorMsg(res.error || "Failed to update Homepage Hero.");
    }
  };

  const handleSaveAbout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const updatedAboutData = {
      hero_tag: aboutHeroTag,
      hero_title: aboutHeroTitle,
      hero_subtitle: aboutHeroSubtitle,
      story_title: aboutStoryTitle,
      story_p1: aboutStoryP1,
      story_p2: aboutStoryP2,
      stat_1_val: stat1Val,
      stat_1_label: stat1Label,
      stat_2_val: stat2Val,
      stat_2_label: stat2Label,
      stat_3_val: stat3Val,
      stat_3_label: stat3Label,
      stat_4_val: stat4Val,
      stat_4_label: stat4Label,
      standard_1_title: standard1Title,
      standard_1_desc: standard1Desc,
      standard_2_title: standard2Title,
      standard_2_desc: standard2Desc,
      standard_3_title: standard3Title,
      standard_3_desc: standard3Desc,
      facility_1_title: facility1Title,
      facility_1_desc: facility1Desc,
      facility_2_title: facility2Title,
      facility_2_desc: facility2Desc,
      facility_3_title: facility3Title,
      facility_3_desc: facility3Desc,
    };

    const res = await ownerUpdateSettings({
      about_data: updatedAboutData,
    });

    setSaving(false);
    if (res.success) {
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("settingsUpdated"));
      router.refresh();
      setSuccessMsg("About Us CMS saved successfully! Live now on /about.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setErrorMsg(res.error || "Failed to update About Us content.");
    }
  };

  const handleSaveIdentity = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const res = await ownerUpdateSettings({
      business_name: businessName,
      tagline,
      email,
      phone,
      whatsapp,
      address,
      gst_number: gstNumber,
      footer_text: footerText,
      logo_url: logoUrl.trim() || "/logo.png",
    });

    setSaving(false);
    if (res.success) {
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("settingsUpdated"));
      router.refresh();
      setSuccessMsg("Store Identity and Contact details saved successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setErrorMsg(res.error || "Failed to update store identity.");
    }
  };

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const updatedAboutData = {
      hero_tag: aboutHeroTag,
      hero_title: aboutHeroTitle,
      hero_subtitle: aboutHeroSubtitle,
      story_title: aboutStoryTitle,
      story_p1: aboutStoryP1,
      story_p2: aboutStoryP2,
      stat_1_val: stat1Val,
      stat_1_label: stat1Label,
      stat_2_val: stat2Val,
      stat_2_label: stat2Label,
      stat_3_val: stat3Val,
      stat_3_label: stat3Label,
      stat_4_val: stat4Val,
      stat_4_label: stat4Label,
      standard_1_title: standard1Title,
      standard_1_desc: standard1Desc,
      standard_2_title: standard2Title,
      standard_2_desc: standard2Desc,
      standard_3_title: standard3Title,
      standard_3_desc: standard3Desc,
      facility_1_title: facility1Title,
      facility_1_desc: facility1Desc,
      facility_2_title: facility2Title,
      facility_2_desc: facility2Desc,
      facility_3_title: facility3Title,
      facility_3_desc: facility3Desc,
    };

    const res = await ownerUpdateSettings({
      business_name: businessName,
      tagline,
      email,
      phone,
      whatsapp,
      address,
      gst_number: gstNumber,
      footer_text: footerText,
      logo_url: logoUrl.trim() || "/logo.png",
      hero_badge: heroBadge.trim(),
      hero_title: heroTitle.trim(),
      hero_subtitle: heroSubtitle.trim(),
      hero_caption: heroCaption.trim(),
      about_data: updatedAboutData,
    });

    setSaving(false);
    if (res.success) {
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("settingsUpdated"));
      router.refresh();
      setSuccessMsg("Configuration saved successfully! All updates are now active across the public website.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setErrorMsg(res.error || "Failed to update configuration.");
    }
  };

  const handleCloudSync = async (action: "backup" | "restore") => {
    if (action === "restore") {
      const confirmed = window.confirm(
        "Are you sure you want to restore the database from cloud storage? This will sync your database with the latest cloud snapshot."
      );
      if (!confirmed) return;
    }
    if (action === "backup") setCloudSyncLoading(true);
    else setCloudRestoreLoading(true);
    setBackupNotice(null);

    const res = await ownerSyncCloudDatabase(action);
    if (action === "backup") setCloudSyncLoading(false);
    else setCloudRestoreLoading(false);

    if (res.success) {
      setBackupNotice({
        type: "success",
        text:
          res.message ||
          (action === "backup"
            ? "Database successfully backed up to Cloudinary cloud storage."
            : "Database successfully restored from cloud storage."),
      });
      setTimeout(() => setBackupNotice(null), 6000);
    } else {
      setBackupNotice({
        type: "error",
        text: res.error || `Failed to ${action} database to cloud.`,
      });
    }
  };

  const handleEmailBackup = async () => {
    setBackupEmailLoading(true);
    setBackupNotice(null);
    const res = await ownerTriggerDatabaseBackupEmail();
    setBackupEmailLoading(false);
    if (res.success) {
      setBackupNotice({
        type: "success",
        text: `Full database backup successfully emailed to ${res.recipient} (${res.file_size_kb} KB).`,
      });
      setTimeout(() => setBackupNotice(null), 6000);
    } else {
      setBackupNotice({
        type: "error",
        text: res.error || "Failed to dispatch email backup.",
      });
    }
  };

  const handleTestEmail = async () => {
    setEmailTestLoading(true);
    setEmailTestNotice(null);
    const diagnostics = await ownerGetEmailDiagnostics();
    if (diagnostics.success) {
      setEmailDiagnostics(diagnostics.data as EmailDiagnostics);
    }
    const test = await ownerSendTestEmail();
    setEmailTestLoading(false);

    if (test.ok) {
      setEmailTestNotice({
        type: "success",
        text: `Test email accepted by ${test.provider || "provider"} for ${test.recipient || email}. Check the inbox and spam folder.`,
      });
      return;
    }

    const firstProblem = (diagnostics.data as EmailDiagnostics | undefined)?.problems?.[0];
    setEmailTestNotice({
      type: "error",
      text: test.error || firstProblem || "Test email failed. Check the Brevo sender verification and API key.",
    });
  };

  const handleDownloadBackup = async () => {
    setBackupDownloadLoading(true);
    setBackupNotice(null);
    const res = await ownerDownloadDatabaseBackup();
    setBackupDownloadLoading(false);
    if (res.success) {
      setBackupNotice({
        type: "success",
        text: "Full database Excel backup downloaded successfully.",
      });
      setTimeout(() => setBackupNotice(null), 5000);
    } else {
      setBackupNotice({
        type: "error",
        text: res.error || "Failed to download backup.",
      });
    }
  };

  const handleExportCatalog = async () => {
    setExportCatalogLoading(true);
    setBackupNotice(null);
    const res = await ownerDownloadCatalogExcel();
    setExportCatalogLoading(false);
    if (res.success) {
      setBackupNotice({
        type: "success",
        text: "Catalogue and image report exported successfully.",
      });
      setTimeout(() => setBackupNotice(null), 5000);
    } else {
      setBackupNotice({
        type: "error",
        text: res.error || "Failed to export catalogue.",
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSubmitting(true);
    setPassError("");
    setPassSuccess("");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("owner_token") : "";
      const res = await fetch(`${getApiUrl()}/api/v1/auth/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      setPassSubmitting(false);

      if (res.ok) {
        setPassSuccess("Owner password updated securely.");
        setCurrentPassword("");
        setNewPassword("");
        if (data.token) {
          localStorage.setItem("owner_token", data.token);
        }
      } else {
        setPassError(data.error || "Password change failed.");
      }
    } catch (err: any) {
      setPassSubmitting(false);
      setPassError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl anim-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-3 w-28 skeleton" />
            <div className="h-8 w-48 skeleton" />
            <div className="h-3 w-72 skeleton" />
          </div>
          <div className="h-10 w-32 skeleton rounded-lg" />
        </div>
        <div className="flex gap-6 border-b border-[#DFE6EE] pb-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-3 w-16 skeleton" />
          ))}
        </div>
        <div className="surface-card p-6 rounded-lg space-y-5">
          <div className="space-y-2">
            <div className="h-4 w-40 skeleton" />
            <div className="h-3 w-64 skeleton" />
          </div>
          <div className="h-44 w-full skeleton rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-3 w-24 skeleton" />
                <div className="h-10 w-full skeleton rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const previewHero = heroCopy({
    hero_badge: heroBadge,
    hero_title: heroTitle,
    hero_subtitle: heroSubtitle,
    hero_caption: heroCaption,
  });
  const headlineLength = previewHero.title.length + previewHero.subtitle.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.14em]">
            Configuration
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#22272E] mt-1">
            Store settings
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            Homepage copy, contact identity, database backups, and owner credentials.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 bg-[#22272E] hover:bg-[#363D47] text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50 shrink-0 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Publishing..." : "Publish changes"}</span>
        </button>
      </div>

      {/* Feedback */}
      {successMsg && (
        <div className="flex items-center gap-2 text-[11px] font-medium text-[#217A4B] anim-fade-in">
          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 text-[11px] font-medium text-red-600 anim-fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#DFE6EE] overflow-x-auto scrollbar-none">
        {[
          { id: "hero", label: "Hero", icon: Sparkles },
          { id: "about", label: "About", icon: Info },
          { id: "identity", label: "Identity", icon: Building2 },
          { id: "database", label: "Database", icon: Database },
          { id: "security", label: "Security", icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id as typeof activeTab)}
              className={`relative flex items-center gap-1.5 pb-3 pt-1 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isActive ? "text-[#22272E]" : "text-slate-500 hover:text-[#22272E]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#4E5A67]" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#22272E]" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: HOMEPAGE HERO & CAPTION */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          <div className="surface-card p-6 rounded-lg space-y-5 text-xs">
            <div className="border-b border-[#DFE6EE] pb-3">
              <h2 className="text-sm font-semibold text-[#22272E] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5B6877]" />
                Homepage Hero Banner &amp; Headline Editor
              </h2>
              <p className="text-[11px] text-[#5B6877] mt-0.5">
                Customize the high-impact headline, category pill, and primary caption displayed at the very top of the homepage.
              </p>
            </div>

            {/* Same copy rules and styling as the public homepage hero */}
            <div>
              <p className="flex items-center gap-1.5 font-semibold text-[#22272E] mb-2">
                <Eye className="w-3.5 h-3.5 text-[#4E5A67]" />
                How it looks on the homepage
              </p>
              <div className="bg-[#22272E] text-white p-6 sm:p-10 rounded-md">
                <div className="flex items-center gap-3 mb-5">
                  <ColorBar />
                  <span className="font-mono text-xs text-slate-300">{previewHero.badge}</span>
                </div>
                <p className={`${heroHeadlineClass(previewHero)} font-heading font-extrabold tracking-[-0.02em] leading-[1.06] max-w-2xl`}>
                  {previewHero.title}
                  <span className="block text-[#B9C3CF]">{previewHero.subtitle}</span>
                </p>
                <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">{previewHero.caption}</p>
                <div className="mt-6 inline-flex px-5 py-3 rounded-md bg-[#B9C3CF] text-[#22272E] font-bold text-sm">Browse products</div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 pt-2">
              <div>
                <label htmlFor="field-small-line-above-the" className="block font-bold text-[#22272E] mb-1">
                  Small line above the headline
                </label>
                <input id="field-small-line-above-the"
                  type="text"
                  value={heroBadge}
                  onChange={(e) => setHeroBadge(e.target.value)}
                  placeholder="e.g. The Print Planet™ • India's Direct B2B Factory"
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#22272E] focus:bg-[#FFFFFF] rounded-lg px-3.5 py-2.5 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-headline" className="block font-bold text-[#22272E] mb-1">
                    Headline *
                  </label>
                  <input id="field-headline"
                    type="text"
                    required
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="e.g. Print Planet — Factory Direct"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#22272E] focus:bg-[#FFFFFF] rounded-lg px-3.5 py-2.5 text-xs outline-none font-semibold"
                  />
                </div>

                <div>
                  <label htmlFor="field-headline-second-line-orange" className="block font-bold text-[#22272E] mb-1">
                    Headline second line (orange) *
                  </label>
                  <input id="field-headline-second-line-orange"
                    type="text"
                    required
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="e.g. Wholesale ID Cards, Lanyard Rolls & Machinery"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#22272E] focus:bg-[#FFFFFF] rounded-lg px-3.5 py-2.5 text-xs outline-none"
                  />
                </div>

                <p className={`sm:col-span-2 text-[11px] ${headlineLength > HERO_LIMITS.headline ? "text-[#4E5A67] font-semibold" : "text-[#5B6877]"}`}>
                  Headline total: {headlineLength} of {HERO_LIMITS.headline} characters.
                  {headlineLength > HERO_LIMITS.headline ? " Longer headlines show smaller on the homepage." : ""}
                </p>
              </div>

              <div>
                <label htmlFor="field-line-under-the-headline" className="block font-bold text-[#22272E] mb-1">
                  Line under the headline *
                </label>
                <textarea id="field-line-under-the-headline"
                  rows={2}
                  required
                  value={heroCaption}
                  onChange={(e) => setHeroCaption(e.target.value)}
                  placeholder="Official portal of The Print Planet..."
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#22272E] focus:bg-[#FFFFFF] rounded-lg px-3.5 py-2.5 text-xs outline-none leading-relaxed"
                />
                <span className={`text-[11px] mt-0.5 block ${heroCaption.trim().length > HERO_LIMITS.caption ? "text-[#4E5A67] font-semibold" : "text-[#5B6877]"}`}>
                  {heroCaption.trim().length} of {HERO_LIMITS.caption} characters recommended.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveHero}
                  disabled={saving}
                  className="bg-[#22272E] hover:bg-[#363D47] text-white px-6 py-2.5 rounded-md font-bold text-xs tracking-wide transition-all shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{saving ? "Saving Hero..." : "Save Homepage Hero"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DYNAMIC ABOUT US CMS */}
      {activeTab === "about" && (
        <div className="space-y-6">
          <div className="surface-card p-6 rounded-lg space-y-6 text-xs">
            <div className="border-b border-[#DFE6EE] pb-3">
              <h2 className="text-sm font-semibold text-[#22272E] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#5B6877]" />
                Dynamic About Us Content Management System (CMS)
              </h2>
              <p className="text-[11px] text-[#5B6877] mt-0.5">
                Edit factory background, mission story, daily output statistics counters, and quality standards for the public <code>/about</code> page.
              </p>
            </div>

            {/* Section 1: Hero Banner on About Page */}
            <div className="space-y-4 p-4 rounded-md bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#22272E]">
                1. About Page Hero Banner
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-hero-tag-pill" className="block font-semibold text-[#22272E] mb-1">Hero Tag Pill</label>
                  <input id="field-hero-tag-pill"
                    type="text"
                    value={aboutHeroTag}
                    onChange={(e) => setAboutHeroTag(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#DFE6EE] focus:border-[#22272E] rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="field-hero-title" className="block font-semibold text-[#22272E] mb-1">Hero Title</label>
                  <input id="field-hero-title"
                    type="text"
                    value={aboutHeroTitle}
                    onChange={(e) => setAboutHeroTitle(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#DFE6EE] focus:border-[#22272E] rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="field-hero-subtitle" className="block font-semibold text-[#22272E] mb-1">Hero Subtitle</label>
                <textarea id="field-hero-subtitle"
                  rows={2}
                  value={aboutHeroSubtitle}
                  onChange={(e) => setAboutHeroSubtitle(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#DFE6EE] focus:border-[#22272E] rounded-lg px-3 py-2 text-xs outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Section 2: Story & Manufacturing Mission */}
            <div className="space-y-4 p-4 rounded-md bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#22272E]">
                2. Manufacturing Mission &amp; Background Story
              </h3>

              <div>
                <label htmlFor="field-section-heading" className="block font-semibold text-[#22272E] mb-1">Section Heading</label>
                <input id="field-section-heading"
                  type="text"
                  value={aboutStoryTitle}
                  onChange={(e) => setAboutStoryTitle(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#DFE6EE] focus:border-[#22272E] rounded-lg px-3 py-2 text-xs outline-none font-semibold"
                />
              </div>

              <div>
                <label htmlFor="field-story-paragraph-1" className="block font-semibold text-[#22272E] mb-1">Story Paragraph 1</label>
                <textarea id="field-story-paragraph-1"
                  rows={3}
                  value={aboutStoryP1}
                  onChange={(e) => setAboutStoryP1(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#DFE6EE] focus:border-[#22272E] rounded-lg px-3 py-2 text-xs outline-none leading-relaxed"
                />
              </div>

              <div>
                <label htmlFor="field-story-paragraph-2" className="block font-semibold text-[#22272E] mb-1">Story Paragraph 2</label>
                <textarea id="field-story-paragraph-2"
                  rows={3}
                  value={aboutStoryP2}
                  onChange={(e) => setAboutStoryP2(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#DFE6EE] focus:border-[#22272E] rounded-lg px-3 py-2 text-xs outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* Section 3: Daily Output Statistics Counters */}
            <div className="space-y-4 p-4 rounded-md bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#22272E]">
                3. Factory Output Counters (Displayed in Stats Grid)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE]">
                  <label htmlFor="field-counter-1-holders" className="block font-semibold text-slate-700 mb-1">Counter 1 (Holders)</label>
                  <input id="field-counter-1-holders"
                    type="text"
                    value={stat1Val}
                    onChange={(e) => setStat1Val(e.target.value)}
                    placeholder="e.g. 50,000+"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-mono font-bold text-[#22272E] mb-2 outline-none"
                  />
                  <input
                    type="text"
                    value={stat1Label}
                    onChange={(e) => setStat1Label(e.target.value)}
                    placeholder="Holders Produced Daily"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none"
                  />
                </div>

                <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE]">
                  <label htmlFor="field-counter-2-ribbons" className="block font-semibold text-slate-700 mb-1">Counter 2 (Ribbons)</label>
                  <input id="field-counter-2-ribbons"
                    type="text"
                    value={stat2Val}
                    onChange={(e) => setStat2Val(e.target.value)}
                    placeholder="e.g. 10,000+ m"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-mono font-bold text-[#22272E] mb-2 outline-none"
                  />
                  <input
                    type="text"
                    value={stat2Label}
                    onChange={(e) => setStat2Label(e.target.value)}
                    placeholder="Daily Satin Ribbon Output"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none"
                  />
                </div>

                <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE]">
                  <label htmlFor="field-counter-3-active-skus" className="block font-semibold text-slate-700 mb-1">Counter 3 (Active SKUs)</label>
                  <input id="field-counter-3-active-skus"
                    type="text"
                    value={stat3Val}
                    onChange={(e) => setStat3Val(e.target.value)}
                    placeholder="e.g. 180+"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-mono font-bold text-[#22272E] mb-2 outline-none"
                  />
                  <input
                    type="text"
                    value={stat3Label}
                    onChange={(e) => setStat3Label(e.target.value)}
                    placeholder="Active Commercial SKUs"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none"
                  />
                </div>

                <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE]">
                  <label htmlFor="field-counter-4-clients" className="block font-semibold text-slate-700 mb-1">Counter 4 (Clients)</label>
                  <input id="field-counter-4-clients"
                    type="text"
                    value={stat4Val}
                    onChange={(e) => setStat4Val(e.target.value)}
                    placeholder="e.g. 500+"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-mono font-bold text-[#22272E] mb-2 outline-none"
                  />
                  <input
                    type="text"
                    value={stat4Label}
                    onChange={(e) => setStat4Label(e.target.value)}
                    placeholder="Institutional Clients Across India"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Quality & Core Production Standards */}
            <div className="space-y-4 p-4 rounded-md bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#22272E]">
                4. Quality &amp; Core Standards
              </h3>

              <div className="space-y-3">
                <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE] space-y-2">
                  <input
                    type="text"
                    value={standard1Title}
                    onChange={(e) => setStandard1Title(e.target.value)}
                    placeholder="Standard 1 Title (e.g. ISO CR-80 Standard Compliance)"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-bold text-[#22272E] outline-none"
                  />
                  <textarea
                    rows={2}
                    value={standard1Desc}
                    onChange={(e) => setStandard1Desc(e.target.value)}
                    placeholder="Standard 1 Description..."
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE] space-y-2">
                  <input
                    type="text"
                    value={standard2Title}
                    onChange={(e) => setStandard2Title(e.target.value)}
                    placeholder="Standard 2 Title (e.g. Pure Grade Polyvinyl Chloride)"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-bold text-[#22272E] outline-none"
                  />
                  <textarea
                    rows={2}
                    value={standard2Desc}
                    onChange={(e) => setStandard2Desc(e.target.value)}
                    placeholder="Standard 2 Description..."
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE] space-y-2">
                  <input
                    type="text"
                    value={standard3Title}
                    onChange={(e) => setStandard3Title(e.target.value)}
                    placeholder="Standard 3 Title (e.g. Rigid Hardware Attachments)"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-bold text-[#22272E] outline-none"
                  />
                  <textarea
                    rows={2}
                    value={standard3Desc}
                    onChange={(e) => setStandard3Desc(e.target.value)}
                    placeholder="Standard 3 Description..."
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Facilities Strip */}
            <div className="space-y-4 p-4 rounded-md bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#22272E]">
                5. Facility Pillars
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE] space-y-2">
                  <input
                    type="text"
                    value={facility1Title}
                    onChange={(e) => setFacility1Title(e.target.value)}
                    placeholder="Facility 1 Title"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-bold text-[#22272E] outline-none"
                  />
                  <textarea
                    rows={3}
                    value={facility1Desc}
                    onChange={(e) => setFacility1Desc(e.target.value)}
                    placeholder="Facility 1 Description..."
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none resize-none"
                  />
                </div>

                <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE] space-y-2">
                  <input
                    type="text"
                    value={facility2Title}
                    onChange={(e) => setFacility2Title(e.target.value)}
                    placeholder="Facility 2 Title"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-bold text-[#22272E] outline-none"
                  />
                  <textarea
                    rows={3}
                    value={facility2Desc}
                    onChange={(e) => setFacility2Desc(e.target.value)}
                    placeholder="Facility 2 Description..."
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none resize-none"
                  />
                </div>

                <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE] space-y-2">
                  <input
                    type="text"
                    value={facility3Title}
                    onChange={(e) => setFacility3Title(e.target.value)}
                    placeholder="Facility 3 Title"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-bold text-[#22272E] outline-none"
                  />
                  <textarea
                    rows={3}
                    value={facility3Desc}
                    onChange={(e) => setFacility3Desc(e.target.value)}
                    placeholder="Facility 3 Description..."
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveAbout}
                disabled={saving}
                className="bg-[#22272E] hover:bg-[#363D47] text-white px-6 py-2.5 rounded-md font-bold text-xs tracking-wide transition-all shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{saving ? "Saving About Us..." : "Save About Us CMS"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STORE IDENTITY & CONTACT */}
      {activeTab === "identity" && (
        <form onSubmit={handleSaveIdentity} className="space-y-6 text-xs">
          <div className="surface-card p-6 rounded-lg space-y-5">
            <h2 className="text-sm font-semibold text-[#22272E] border-b border-[#DFE6EE] pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#5B6877]" />
              Store Legal Identity &amp; Branding
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="field-business-name" className="block font-semibold text-[#22272E] mb-1">Business Name *</label>
                <input id="field-business-name"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#22272E] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none font-bold text-[#22272E]"
                />
              </div>

              <div>
                <label htmlFor="field-tagline" className="block font-semibold text-[#22272E] mb-1">Tagline</label>
                <input id="field-tagline"
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#22272E] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="field-official-gst-number" className="block font-semibold text-[#22272E] mb-1">Official GST Number</label>
                <input id="field-official-gst-number"
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#22272E] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label htmlFor="field-custom-logo-url-optional" className="block font-semibold text-[#22272E] mb-1">Custom Logo URL (optional)</label>
                <input id="field-custom-logo-url-optional"
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#22272E] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Contact Strip Details */}
          <div className="surface-card p-6 rounded-lg space-y-5">
            <h2 className="text-sm font-semibold text-[#22272E] border-b border-[#DFE6EE] pb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#217A4B]" />
              Trade Contact &amp; Dispatch Desk
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="field-primary-phone" className="block font-semibold text-[#22272E] mb-1">Primary Phone</label>
                <input id="field-primary-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#22272E] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none font-semibold"
                />
              </div>

              <div>
                <label htmlFor="field-whatsapp-trade-line" className="block font-semibold text-[#22272E] mb-1">WhatsApp Trade Line</label>
                <input id="field-whatsapp-trade-line"
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#22272E] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none font-semibold text-emerald-700"
                />
              </div>

              <div>
                <label htmlFor="field-official-sales-email" className="block font-semibold text-[#22272E] mb-1">Official Sales Email</label>
                <input id="field-official-sales-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#22272E] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="field-factory-headquarters-address" className="block font-semibold text-[#22272E] mb-1">Factory &amp; Headquarters Address</label>
              <textarea id="field-factory-headquarters-address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#22272E] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none resize-none leading-relaxed"
              />
            </div>

            <div>
              <label htmlFor="field-footer-introduction-text" className="block font-semibold text-[#22272E] mb-1">Footer Introduction Text</label>
              <textarea id="field-footer-introduction-text"
                rows={3}
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#22272E] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#22272E] hover:bg-[#363D47] text-white px-8 py-3 rounded-md font-bold text-xs tracking-wide transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? "Saving Identity..." : "Save Identity Settings"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: DATABASE & CLOUD SYNC */}
      {activeTab === "database" && (
        <div className="surface-card p-6 rounded-lg space-y-6 text-xs anim-fade-up">
          <div className="border-b border-[#DFE6EE] pb-4">
            <h2 className="text-sm font-semibold text-[#22272E] flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-400" />
              Backup &amp; recovery
            </h2>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Multi-sheet Excel backups containing products, categories, RFQ leads, and store configuration.
            </p>
          </div>

          {backupNotice && (
            <div
              className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center justify-between ${
                backupNotice.type === "success"
                  ? "bg-green-50 border-green-200 text-[#217A4B]"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              <div className="flex items-center gap-2">
                {backupNotice.type === "success" ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{backupNotice.text}</span>
              </div>
              <button
                onClick={() => setBackupNotice(null)}
                className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Email delivery diagnostics */}
          <div className="border border-[#DFE6EE] rounded-md p-4 bg-[#EDF1F6] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="p-2 bg-[#FFFFFF] border border-[#DFE6EE] text-slate-500 rounded-lg shrink-0">
                  <Mail className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-semibold text-[#22272E] text-xs sm:text-sm">
                    Transactional email
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    RFQ alerts are delivered over HTTPS through Brevo or Resend. Run a live diagnostic to see the provider response.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleTestEmail}
                disabled={emailTestLoading}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#22272E] hover:bg-[#363D47] text-white rounded-lg font-bold text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer shrink-0"
              >
                {emailTestLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Mail className="w-3.5 h-3.5" />
                )}
                <span>{emailTestLoading ? "Checking..." : "Test email delivery"}</span>
              </button>
            </div>

            {emailTestNotice && (
              <div
                className={`p-3 rounded-lg border text-xs font-semibold ${
                  emailTestNotice.type === "success"
                    ? "bg-green-50 border-green-200 text-[#217A4B]"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <div className="flex items-start gap-2">
                  {emailTestNotice.type === "success" ? (
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{emailTestNotice.text}</span>
                </div>
              </div>
            )}

            {emailDiagnostics && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg p-2.5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-[#5B6877]">Provider</div>
                    <div className="font-bold text-[#22272E] mt-0.5 uppercase">
                      {emailDiagnostics.config?.provider || "none"}
                    </div>
                  </div>
                  <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg p-2.5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-[#5B6877]">Sender</div>
                    <div className="font-bold text-[#22272E] mt-0.5 truncate">
                      {emailDiagnostics.config?.active_sender_email || emailDiagnostics.config?.brevo_sender_email || emailDiagnostics.config?.resend_from_email || "Not set"}
                    </div>
                  </div>
                  <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg p-2.5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-[#5B6877]">Sender Status</div>
                    <div className={`font-bold mt-0.5 ${emailDiagnostics.sender_verified ? "text-[#217A4B]" : "text-red-600"}`}>
                      {emailDiagnostics.sender_verified ? "Verified" : "Not verified"}
                    </div>
                  </div>
                </div>
                {emailDiagnostics.resend && (
                  <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg p-2.5 text-[11px] text-slate-600 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-medium text-[#22272E]">Resend</span>
                      <span>Key: {emailDiagnostics.resend.key_valid ? "valid" : "not validated"}</span>
                      <span>Domains: {emailDiagnostics.resend.domains?.length || 0}</span>
                      {emailDiagnostics.resend.sandbox && <span className="text-[#4E5A67]">Sandbox sender</span>}
                    </div>
                    {emailDiagnostics.resend.note && (
                      <p className="text-slate-500 leading-relaxed">{emailDiagnostics.resend.note}</p>
                    )}
                  </div>
                )}
                {emailDiagnostics.problems && emailDiagnostics.problems.length > 0 && (
                  <ul className="space-y-1 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
                    {emailDiagnostics.problems.map((problem, index) => (
                      <li key={index} className="flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{problem}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Cloud auto-persistence */}
          <div className="border border-[#DFE6EE] rounded-md p-4 bg-[#EDF1F6] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="p-2 bg-[#FFFFFF] border border-[#DFE6EE] text-slate-500 rounded-lg shrink-0 mt-0.5">
                  <CloudUpload className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-semibold text-[#22272E] text-xs sm:text-sm flex items-center gap-2">
                    Cloud auto-persistence
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#217A4B]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#217A4B]" />
                      Active
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Products, categories, and enquiries are mirrored to secure cloud storage on every change, then restored automatically on boot.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCloudSync("backup")}
                  disabled={cloudSyncLoading || cloudRestoreLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#22272E] hover:bg-[#363D47] text-white rounded-lg font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {cloudSyncLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CloudUpload className="w-3.5 h-3.5" />
                  )}
                  <span>{cloudSyncLoading ? "Syncing..." : "Sync now"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCloudSync("restore")}
                  disabled={cloudSyncLoading || cloudRestoreLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] hover:bg-slate-50 text-[#22272E] border border-[#DFE6EE] rounded-lg font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {cloudRestoreLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CloudDownload className="w-3.5 h-3.5" />
                  )}
                  <span>{cloudRestoreLoading ? "Restoring..." : "Restore"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="border border-[#DFE6EE] rounded-lg p-4 bg-[#EDF1F6] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-[#22272E] font-bold mb-1">
                  <Mail className="w-4 h-4 text-[#217A4B]" />
                  <span>Email Full DB Backup</span>
                </div>
                <p className="text-[11px] text-[#5B6877] leading-relaxed">
                  Generates a live database snapshot and emails it as an Excel attachment directly to <strong>{email || "theprintplanet01@gmail.com"}</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={handleEmailBackup}
                disabled={backupEmailLoading}
                className="w-full bg-[#217A4B] hover:bg-[#1a623c] text-white py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {backupEmailLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Mail className="w-3.5 h-3.5" />
                )}
                <span>{backupEmailLoading ? "Generating & Emailing..." : "Send DB Backup to Email"}</span>
              </button>
            </div>

            <div className="border border-[#DFE6EE] rounded-lg p-4 bg-[#EDF1F6] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-[#22272E] font-bold mb-1">
                  <Download className="w-4 h-4 text-[#22272E]" />
                  <span>Direct DB Download</span>
                </div>
                <p className="text-[11px] text-[#5B6877] leading-relaxed">
                  Immediately compiles and downloads the full multi-sheet database workbook (.xlsx) to your computer.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadBackup}
                disabled={backupDownloadLoading}
                className="w-full bg-[#22272E] hover:bg-[#363D47] text-white py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {backupDownloadLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{backupDownloadLoading ? "Compiling..." : "Download DB Backup (.xlsx)"}</span>
              </button>
            </div>

            <div className="border border-[#DFE6EE] rounded-lg p-4 bg-[#EDF1F6] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-[#22272E] font-bold mb-1">
                  <FileSpreadsheet className="w-4 h-4 text-[#5B6877]" />
                  <span>Catalog &amp; Images Export</span>
                </div>
                <p className="text-[11px] text-[#5B6877] leading-relaxed">
                  Exports all catalog products with SKU, category, trade pricing, and image URLs formatted for client onboarding.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportCatalog}
                disabled={exportCatalogLoading}
                className="w-full bg-[#FFFFFF] border border-[#DFE6EE] hover:bg-[#EDF1F6] text-[#22272E] py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {exportCatalogLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                )}
                <span>{exportCatalogLoading ? "Exporting..." : "Export Catalog Sheet"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY CREDENTIALS */}
      {activeTab === "security" && (
        <div className="surface-card p-6 rounded-lg space-y-5 text-xs">
          <h2 className="text-sm font-semibold text-[#22272E] border-b border-[#DFE6EE] pb-2 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[#5B6877]" />
            Change Owner Master Password
          </h2>

          {passSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-[#217A4B] flex items-center gap-2 font-semibold">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{passSuccess}</span>
            </div>
          )}

          {passError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="field-current-password" className="block font-semibold text-[#22272E] mb-1">Current Password *</label>
              <input id="field-current-password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded-lg px-3.5 py-2.5 outline-none"
              />
            </div>

            <div>
              <label htmlFor="field-new-master-password-min" className="block font-semibold text-[#22272E] mb-1">
                New Master Password (min 8 characters) *
              </label>
              <input id="field-new-master-password-min"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded-lg px-3.5 py-2.5 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={passSubmitting}
              className="bg-[#22272E] hover:bg-[#363D47] text-white px-6 py-2.5 rounded-md font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {passSubmitting ? "Updating Password..." : "Update Owner Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function OwnerSettingsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-[#5B6877]">Loading configuration...</div>}>
      <OwnerSettingsInner />
    </Suspense>
  );
}
