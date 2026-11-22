"use client";

import { HERO_DEFAULTS, heroCopy } from "@/lib/hero";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Save, CheckCircle, AlertCircle, Building2, Lock, Database, Loader2, Sparkles, Info, Star } from "lucide-react";
import GoogleReviewsSettings from "@/components/owner/GoogleReviewsSettings";
import {
  getSiteSettings,
  ownerUpdateSettings,
  getApiUrl,
  authedFetch,
  setOwnerToken,
  ownerTriggerDatabaseBackupEmail,
  ownerDownloadDatabaseBackup,
  ownerDownloadCatalogExcel,
  ownerSyncCloudDatabase,
  ownerGetEmailDiagnostics,
  ownerSendTestEmail,
} from "@/lib/api";
import { SiteSettings } from "@/lib/types";
import HeroTab from "./_tabs/hero";
import AboutTab from "./_tabs/about";
import IdentityTab from "./_tabs/identity";
import DatabaseTab from "./_tabs/database";
import SecurityTab from "./_tabs/security";
import type { EmailDiagnostics, Notice } from "./_tabs/types";
import OwnerPageHeader from "@/components/owner/OwnerPageHeader";

const TAB_KEYS = ["hero", "about", "identity", "reviews", "database", "security"] as const;
type TabKey = (typeof TAB_KEYS)[number];

const isTabKey = (value: string | null): value is TabKey => TAB_KEYS.some((key) => key === value);
const parseTab = (value: string | null): TabKey => (isTabKey(value) ? value : "hero");

function OwnerSettingsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>(parseTab(searchParams.get("tab")));

  // Sync tab with URL
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (isTabKey(tabFromUrl)) setActiveTab(tabFromUrl);
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
  const [backupNotice, setBackupNotice] = useState<Notice | null>(null);

  // Email delivery diagnostics
  const [emailTestLoading, setEmailTestLoading] = useState(false);
  const [emailDiagnostics, setEmailDiagnostics] = useState<EmailDiagnostics | null>(null);
  const [emailTestNotice, setEmailTestNotice] = useState<Notice | null>(null);

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
      const res = await authedFetch(`${getApiUrl()}/api/v1/auth/change-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          setOwnerToken(data.token);
        }
      } else {
        setPassError(data.error || "Password change failed.");
      }
    } catch (err: unknown) {
      setPassSubmitting(false);
      setPassError(err instanceof Error ? err.message : String(err));
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
        <OwnerPageHeader eyebrow="Configuration" title="Store settings">
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            Homepage copy, contact identity, database backups, and owner credentials.
          </p>
        </OwnerPageHeader>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 bg-[#121418] hover:bg-[#2A2F37] text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50 shrink-0 cursor-pointer"
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
          { id: "reviews", label: "Reviews", icon: Star },
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
                isActive ? "text-[#121418]" : "text-slate-500 hover:text-[#121418]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#2B323B]" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#121418]" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: HOMEPAGE HERO & CAPTION */}
      {activeTab === "hero" && (
        <HeroTab
          saving={saving}
          heroBadge={heroBadge}
          heroTitle={heroTitle}
          heroSubtitle={heroSubtitle}
          heroCaption={heroCaption}
          setHeroBadge={setHeroBadge}
          setHeroTitle={setHeroTitle}
          setHeroSubtitle={setHeroSubtitle}
          setHeroCaption={setHeroCaption}
          previewHero={previewHero}
          headlineLength={headlineLength}
          handleSaveHero={handleSaveHero}
        />
      )}

      {/* TAB 2: DYNAMIC ABOUT US CMS */}
      {activeTab === "about" && (
        <AboutTab
          saving={saving}
          aboutHeroTag={aboutHeroTag}
          aboutHeroTitle={aboutHeroTitle}
          aboutHeroSubtitle={aboutHeroSubtitle}
          aboutStoryTitle={aboutStoryTitle}
          aboutStoryP1={aboutStoryP1}
          aboutStoryP2={aboutStoryP2}
          stat1Val={stat1Val}
          stat1Label={stat1Label}
          stat2Val={stat2Val}
          stat2Label={stat2Label}
          stat3Val={stat3Val}
          stat3Label={stat3Label}
          stat4Val={stat4Val}
          stat4Label={stat4Label}
          standard1Title={standard1Title}
          standard1Desc={standard1Desc}
          standard2Title={standard2Title}
          standard2Desc={standard2Desc}
          standard3Title={standard3Title}
          standard3Desc={standard3Desc}
          facility1Title={facility1Title}
          facility1Desc={facility1Desc}
          facility2Title={facility2Title}
          facility2Desc={facility2Desc}
          facility3Title={facility3Title}
          facility3Desc={facility3Desc}
          setAboutHeroTag={setAboutHeroTag}
          setAboutHeroTitle={setAboutHeroTitle}
          setAboutHeroSubtitle={setAboutHeroSubtitle}
          setAboutStoryTitle={setAboutStoryTitle}
          setAboutStoryP1={setAboutStoryP1}
          setAboutStoryP2={setAboutStoryP2}
          setStat1Val={setStat1Val}
          setStat1Label={setStat1Label}
          setStat2Val={setStat2Val}
          setStat2Label={setStat2Label}
          setStat3Val={setStat3Val}
          setStat3Label={setStat3Label}
          setStat4Val={setStat4Val}
          setStat4Label={setStat4Label}
          setStandard1Title={setStandard1Title}
          setStandard1Desc={setStandard1Desc}
          setStandard2Title={setStandard2Title}
          setStandard2Desc={setStandard2Desc}
          setStandard3Title={setStandard3Title}
          setStandard3Desc={setStandard3Desc}
          setFacility1Title={setFacility1Title}
          setFacility1Desc={setFacility1Desc}
          setFacility2Title={setFacility2Title}
          setFacility2Desc={setFacility2Desc}
          setFacility3Title={setFacility3Title}
          setFacility3Desc={setFacility3Desc}
          handleSaveAbout={handleSaveAbout}
        />
      )}

      {/* TAB 3: STORE IDENTITY & CONTACT */}
      {activeTab === "identity" && (
        <IdentityTab
          saving={saving}
          businessName={businessName}
          tagline={tagline}
          email={email}
          phone={phone}
          whatsapp={whatsapp}
          address={address}
          gstNumber={gstNumber}
          footerText={footerText}
          logoUrl={logoUrl}
          setBusinessName={setBusinessName}
          setTagline={setTagline}
          setEmail={setEmail}
          setPhone={setPhone}
          setWhatsapp={setWhatsapp}
          setAddress={setAddress}
          setGstNumber={setGstNumber}
          setFooterText={setFooterText}
          setLogoUrl={setLogoUrl}
          handleSaveIdentity={handleSaveIdentity}
        />
      )}

      {/* GOOGLE REVIEWS */}
      {activeTab === "reviews" && <GoogleReviewsSettings />}

      {/* TAB 4: DATABASE & CLOUD SYNC */}
      {activeTab === "database" && (
        <DatabaseTab
          email={email}
          backupEmailLoading={backupEmailLoading}
          backupDownloadLoading={backupDownloadLoading}
          exportCatalogLoading={exportCatalogLoading}
          cloudSyncLoading={cloudSyncLoading}
          cloudRestoreLoading={cloudRestoreLoading}
          backupNotice={backupNotice}
          emailTestLoading={emailTestLoading}
          emailDiagnostics={emailDiagnostics}
          emailTestNotice={emailTestNotice}
          setBackupNotice={setBackupNotice}
          handleCloudSync={handleCloudSync}
          handleEmailBackup={handleEmailBackup}
          handleTestEmail={handleTestEmail}
          handleDownloadBackup={handleDownloadBackup}
          handleExportCatalog={handleExportCatalog}
        />
      )}

      {/* TAB 5: SECURITY CREDENTIALS */}
      {activeTab === "security" && (
        <SecurityTab
          currentPassword={currentPassword}
          newPassword={newPassword}
          passSubmitting={passSubmitting}
          passSuccess={passSuccess}
          passError={passError}
          setCurrentPassword={setCurrentPassword}
          setNewPassword={setNewPassword}
          handleChangePassword={handleChangePassword}
        />
      )}
    </div>
  );
}

export default function OwnerSettingsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-[#353C45]">Loading configuration...</div>}>
      <OwnerSettingsInner />
    </Suspense>
  );
}
