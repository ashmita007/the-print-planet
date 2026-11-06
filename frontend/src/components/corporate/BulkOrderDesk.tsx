"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  FileUp,
  Loader2,
  MessageCircle,
  Phone,
  X,
} from "lucide-react";
import { clearClientSession, clientLogin, clientSubmitBulkOrder, clientVerifySession } from "@/lib/api";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import TextReveal from "@/components/animations/TextReveal";
import { ColorBar, CropMarks } from "@/components/animations/PrintMarks";
import PrintPlanet from "@/components/planet/PrintPlanet";
import type { PrintPlanet as PlanetScene } from "@/components/planet/printPlanetScene";
import { ChipGroup, Field, inputClass } from "./FormControls";
import {
  ATTACHMENT_EXTENSIONS,
  INDIAN_STATES,
  MAX_ATTACHMENT_BYTES,
  MIN_QUANTITY,
  ORG_TYPES,
  OrgType,
  QUANTITY_PRESETS,
  VOLUME_TIERS,
  productLinesFor,
  tierForQuantity,
  validators,
} from "./orderData";

const DRAFT_KEY = "the_print_planet_bulk_order_draft_v1";
const STEPS = ["Your order", "Your details", "Review and send"];
const WHATSAPP = "https://wa.me/919741808034";

interface Draft {
  orgType: OrgType;
  productValue: string;
  specChoices: Record<string, string>;
  quantity: string;
  neededBy: string;
  notes: string;
  orgName: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  gstNumber: string;
}

const EMPTY_DRAFT: Draft = {
  orgType: "corporate",
  productValue: "corporate_lanyards",
  specChoices: {},
  quantity: "2500",
  neededBy: "",
  notes: "",
  orgName: "",
  contactPerson: "",
  email: "",
  phone: "",
  city: "Bangalore",
  state: "Karnataka",
  gstNumber: "",
};

type FieldName = "orgName" | "contactPerson" | "email" | "phone" | "city" | "gstNumber";

export default function BulkOrderDesk() {
  const [form, setForm] = useState<Draft>(EMPTY_DRAFT);
  const [draftReady, setDraftReady] = useState(false);
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState<Partial<Record<FieldName | "password", boolean>>>({});
  const [attempt, setAttempt] = useState(0);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState("");
  const [dragging, setDragging] = useState(false);

  const [currentUser, setCurrentUser] = useState<{ email?: string; first_name?: string; username?: string } | null>(null);
  const [accountMode, setAccountMode] = useState<"new" | "login">("new");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const quantityCounterRef = useRef<HTMLSpanElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const shownQuantity = useRef({ value: 2500 });
  const previousStep = useRef(0);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const touch = (name: FieldName | "password") => setTouched((prev) => ({ ...prev, [name]: true }));

  const quantity = Number(form.quantity) || 0;
  const tier = tierForQuantity(quantity);
  const productLines = useMemo(() => productLinesFor(form.orgType), [form.orgType]);
  const product = productLines.find((line) => line.value === form.productValue) ?? productLines[0];
  const org = ORG_TYPES.find((type) => type.value === form.orgType) ?? ORG_TYPES[0];
  const chosenSpecs = product.specs
    .filter((spec) => form.specChoices[spec.label])
    .map((spec) => `${spec.label}: ${form.specChoices[spec.label]}`);

  const errors: Record<FieldName, string> = {
    orgName: validators.required(form.orgName, "your organisation's name"),
    contactPerson: validators.required(form.contactPerson, "the contact person's name"),
    email: validators.email(form.email),
    phone: validators.phone(form.phone),
    city: validators.required(form.city, "your city"),
    gstNumber: validators.gst(form.gstNumber),
  };
  const quantityError = quantity < MIN_QUANTITY ? `Minimum bulk quantity is ${MIN_QUANTITY} units` : "";
  const passwordError = password.trim() ? validators.password(password) : "";
  const shownError = (name: FieldName) => (touched[name] ? errors[name] : "");

  const applyUser = (user: { email?: string; first_name?: string; last_name?: string; username?: string }) => {
    setCurrentUser(user);
    setForm((prev) => ({
      ...prev,
      email: prev.email || user.email || "",
      contactPerson: prev.contactPerson || `${user.first_name || ""} ${user.last_name || ""}`.trim(),
    }));
  };

  // Restore the draft and any signed-in user. The password and file are never stored.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) setForm({ ...EMPTY_DRAFT, ...JSON.parse(saved) });
    } catch {
      // A corrupt draft just starts the form fresh.
    }
    setDraftReady(true);

    // Trust a stored sign-in only after the server confirms it belongs to a buyer account.
    let cancelled = false;
    clientVerifySession().then((profile) => {
      if (cancelled) return;
      if (profile) applyUser(profile);
      else if (profile === undefined) {
        try {
          const stored = localStorage.getItem("client_user");
          if (stored) applyUser(JSON.parse(stored));
        } catch {}
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (draftReady && orderNumber === null) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form, orderNumber, draftReady]);

  // The planet prints itself once, as the page settles.
  const pressPlanet = (scene: PlanetScene) => {
    if (prefersReducedMotion()) {
      scene.setProgress(1);
      return;
    }
    const press = { progress: 0 };
    scene.setProgress(0);
    gsap.to(press, {
      progress: 1,
      duration: 2.6,
      delay: 0.3,
      ease: "power1.inOut",
      onUpdate: () => scene.setProgress(press.progress),
    });
  };

  const scrollToDesk = () => sheetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const changeOrgType = (next: OrgType) => {
    const lines = productLinesFor(next);
    setForm((prev) => ({
      ...prev,
      orgType: next,
      productValue: lines.some((line) => line.value === prev.productValue) ? prev.productValue : lines[0].value,
      specChoices: {},
    }));
  };

  const chooseFile = (file: File | undefined) => {
    if (!file) return;
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ATTACHMENT_EXTENSIONS.includes(extension)) {
      setAttachmentError("Use PDF, Word, Excel, JPG, PNG, WEBP, ZIP, AI, EPS or CDR.");
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachmentError("That file is over 15 MB. Send a smaller one, or share it on WhatsApp later.");
      return;
    }
    setAttachmentError("");
    setAttachment(file);
  };

  const goTo = (next: number) => {
    setSubmitError("");
    if (prefersReducedMotion()) {
      setStep(next);
      return;
    }
    gsap.to(panelRef.current, {
      x: next > step ? -28 : 28,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => setStep(next),
    });
  };

  const continueFromOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityError) {
      setAttempt((n) => n + 1);
      return;
    }
    goTo(1);
  };

  const continueFromDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched((prev) => ({ ...prev, orgName: true, contactPerson: true, email: true, phone: true, city: true, gstNumber: true }));
    const firstInvalid = (Object.keys(errors) as FieldName[]).find((name) => errors[name]);
    if (firstInvalid) {
      setAttempt((n) => n + 1);
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    goTo(2);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const res = await clientLogin({ username: loginId.trim(), password: loginPassword });
    setLoginLoading(false);
    if (res.success && res.role === "owner") {
      setLoginError("That is an owner account. Use a buyer account to place bulk orders.");
    } else if (res.success) {
      applyUser(res.user);
      setAccountMode("new");
      setSubmitError("");
    } else {
      setLoginError(res.error || "That email or password is not right.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!currentUser && password.trim() && passwordError) {
      touch("password");
      setAttempt((n) => n + 1);
      document.getElementById("password")?.focus();
      return;
    }

    const requirements = [
      `[Selected Slab: ${tier.slab}]`,
      chosenSpecs.length ? `Specification: ${chosenSpecs.join(", ")}` : "",
      form.neededBy ? `Needed by: ${form.neededBy}` : "",
      "",
      form.notes.trim() || "No additional notes.",
    ]
      .filter((line, index) => line || index === 3)
      .join("\n");

    const payload = new FormData();
    payload.append("organization_type", form.orgType);
    payload.append("organization_name", form.orgName.trim());
    payload.append("contact_person", form.contactPerson.trim());
    payload.append("email", form.email.trim());
    payload.append("phone", form.phone.trim());
    payload.append("city", form.city.trim());
    payload.append("state", form.state);
    if (form.gstNumber.trim()) payload.append("gst_number", form.gstNumber.trim());
    payload.append("category_type", product.value);
    payload.append("product_name_text", product.label);
    payload.append("estimated_quantity", String(quantity));
    payload.append("requirements", requirements);
    if (!currentUser) payload.append("password", password);
    if (attachment) payload.append("attachment", attachment);

    setSubmitting(true);
    const res = await clientSubmitBulkOrder(payload);
    setSubmitting(false);

    if (res.success) {
      sessionStorage.removeItem(DRAFT_KEY);
      setOrderNumber(res.order?.order_number || res.order_number || "");
      if (!currentUser) setCurrentUser({ email: form.email.trim(), first_name: form.contactPerson.split(" ")[0] });
      return;
    }

    const message = Array.isArray(res.error) ? res.error[0] : res.error;
    if (currentUser && /token|credentials|authenticat/i.test(String(message))) {
      // The saved sign-in expired: drop it and ask again.
      clearClientSession();
      setCurrentUser(null);
      setAccountMode("login");
      setLoginId(form.email.trim());
      setSubmitError("Your sign-in expired. Log in again to send your order.");
    } else if (res.requires_login) {
      setAccountMode("login");
      setLoginId(form.email.trim());
      setSubmitError("This email already has an account. Log in to send your order.");
    } else if (/password/i.test(String(message))) {
      touch("password");
      setSubmitError(String(message));
    } else {
      setSubmitError(String(message || "We could not send your order. Please try again, or message us on WhatsApp."));
    }
  };

  // Hero entrance.
  useGSAP(
    () => {
      gsap.set("[data-hero]", { opacity: 1 });
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-word]", { yPercent: 115, duration: 0.8, stagger: 0.04 }, 0)
        .from("[data-swatch]", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.4, stagger: 0.05 }, 0.2)
        .from("[data-hero-item]", { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.08 }, 0.25)
        .from("[data-desk]", { autoAlpha: 0, y: 36, duration: 0.85, stagger: 0.1 }, 0.3)
        .from("[data-crop]", { autoAlpha: 0, scale: 1.8, duration: 0.45, stagger: 0.06, ease: "back.out(2)" }, 0.8);
    },
    { scope: rootRef }
  );

  // Step change: progress line, then slide the new step in and move focus to it.
  useLayoutEffect(() => {
    const direction = step >= previousStep.current ? 1 : -1;
    const changed = step !== previousStep.current;
    previousStep.current = step;

    const reduced = prefersReducedMotion();
    gsap.to(progressRef.current, {
      scaleX: step / (STEPS.length - 1),
      duration: reduced ? 0 : 0.5,
      ease: "power3.inOut",
    });
    if (!changed) return;

    gsap.fromTo(
      panelRef.current,
      { x: reduced ? 0 : direction * 28, opacity: reduced ? 1 : 0 },
      { x: 0, opacity: 1, duration: reduced ? 0 : 0.4, ease: "power3.out", clearProps: "transform" }
    );
    gsap.from(gsap.utils.toArray("[data-step-item]", panelRef.current), {
      y: 12,
      opacity: 0,
      duration: reduced ? 0 : 0.4,
      stagger: 0.05,
      ease: "power3.out",
      clearProps: "transform,opacity",
    });

    headingRef.current?.focus({ preventScroll: true });
    const top = sheetRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 80) window.scrollBy({ top: top - 96, behavior: reduced ? "auto" : "smooth" });
  }, [step]);

  // Quantity counts up or down in the summary, and the marker slides along the slab track.
  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      gsap.to(shownQuantity.current, {
        value: quantity,
        duration: reduced ? 0 : 0.5,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => {
          if (quantityCounterRef.current) {
            quantityCounterRef.current.textContent = Math.round(shownQuantity.current.value).toLocaleString("en-IN");
          }
        },
      });

      const position = gsap.utils.clamp(0, 100, gsap.utils.pipe(
        (qty: number) => Math.log(Math.max(qty, MIN_QUANTITY)),
        gsap.utils.mapRange(Math.log(MIN_QUANTITY), Math.log(20000), 0, 100)
      )(quantity));
      gsap.to(markerRef.current, { left: `${position}%`, duration: reduced ? 0 : 0.6, ease: "power3.out", overwrite: true });
    },
    { dependencies: [quantity], scope: rootRef }
  );

  // Crossing a slab swaps the summary's benefits in.
  const firstTierRender = useRef(true);
  useGSAP(
    () => {
      if (firstTierRender.current) {
        firstTierRender.current = false;
        return;
      }
      if (prefersReducedMotion()) return;
      gsap.from("[data-tier-swap]", { autoAlpha: 0, x: 14, duration: 0.4, stagger: 0.04, ease: "power3.out", clearProps: "transform,opacity,visibility" });
    },
    { dependencies: [tier.id], scope: rootRef }
  );

  useGSAP(
    () => {
      if (!orderNumber && orderNumber !== "") return;
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-success-ring]", { scale: 0.6, autoAlpha: 0, duration: 0.5, transformOrigin: "50% 50%", ease: "back.out(2)" })
        .fromTo("[data-success-tick]", { strokeDashoffset: 40 }, { strokeDashoffset: 0, duration: 0.45, ease: "power2.inOut" }, 0.2)
        .from("[data-success-item]", { autoAlpha: 0, y: 14, duration: 0.5, stagger: 0.07 }, 0.35);
    },
    { dependencies: [orderNumber], scope: successRef }
  );

  const startWithTier = (sampleQty: number) => {
    set("quantity", String(sampleQty));
    if (step !== 0 && orderNumber === null) goTo(0);
    scrollToDesk();
  };

  const reviewRows: { label: string; value: string; step: number }[] = [
    { label: "Product", value: [product.label, ...chosenSpecs].join(" · "), step: 0 },
    { label: "Quantity", value: `${quantity.toLocaleString("en-IN")} units · ${tier.name}`, step: 0 },
    ...(form.neededBy ? [{ label: "Needed by", value: form.neededBy, step: 0 }] : []),
    ...(form.notes.trim() ? [{ label: "Notes", value: form.notes.trim(), step: 0 }] : []),
    ...(attachment ? [{ label: "Attachment", value: attachment.name, step: 0 }] : []),
    { label: "Organisation", value: `${form.orgName} · ${org.label}`, step: 1 },
    { label: "Contact", value: `${form.contactPerson} · ${form.email} · ${form.phone}`, step: 1 },
    { label: "Delivery to", value: `${form.city}, ${form.state}`, step: 1 },
    ...(form.gstNumber ? [{ label: "GSTIN", value: form.gstNumber, step: 1 }] : []),
  ];

  return (
    <div ref={rootRef} className="overflow-x-clip">
      {/* Hero */}
      <section data-no-reveal className="relative bg-[#0E2238] text-white overflow-hidden">
        <div data-hero-dots aria-hidden="true" className="page-hero-dots absolute inset-0 pointer-events-none" />
        <PrintPlanet
          dots={7000}
          minViewport={1024}
          onScene={pressPlanet}
          className="hidden lg:block !absolute right-[max(0rem,calc(50vw-40rem))] -top-6 w-[34rem] h-[26rem]"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-28 sm:pb-32">
          <div data-hero data-hero-item className="mb-4">
            <ColorBar />
          </div>
          <h1 data-hero className="text-4xl sm:text-5xl lg:text-[3.5rem] font-hero font-extrabold tracking-[-0.03em] leading-[1.04] max-w-3xl">
            <TextReveal text="Bulk orders, direct" />{" "}
            <span className="block text-[#FF8A3D]">
              <TextReveal text="from our factory." />
            </span>
          </h1>
          <p data-hero data-hero-item className="mt-4 text-base text-slate-100 font-normal max-w-xl leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
            Lanyards, ID cards, holders and RFID for companies, schools and print shops. Tell us what you need and get a formal GST quotation in your own order portal.
          </p>
          <ul data-hero data-hero-item className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[13px] text-slate-200">
            {["No broker fees", "Digital proof included", "GST invoice and e-way bill", "Pan-India dispatch"].map((fact) => (
              <li key={fact} className="flex items-center gap-2">
                <span aria-hidden="true" className="w-1 h-1 bg-[#121418]" />
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Order desk */}
      <section data-no-reveal className="relative max-w-7xl mx-auto px-4 sm:px-6 -mt-20 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div data-desk ref={sheetRef} className="lg:col-span-8 relative scroll-mt-24 min-w-0">
            <CropMarks color="rgba(244,163,107,0.8)" />
            <div className="bg-[#FFFFFF] shadow-[0_24px_60px_-28px_rgba(14,34,56,0.45)] border border-[#DFE6EE]">
              {orderNumber !== null ? (
                <div ref={successRef} className="p-6 sm:p-10">
                  <svg data-success-ring width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
                    <circle cx="32" cy="32" r="32" fill="#217A4B" />
                    <path
                      data-success-tick
                      d="M20 33 L29 42 L45 24"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="4.5"
                      strokeLinecap="square"
                      strokeDasharray="40"
                    />
                  </svg>
                  <h2 data-success-item className="mt-5 text-2xl sm:text-3xl font-extrabold text-[#121418]">
                    Order {orderNumber} received
                  </h2>
                  <p data-success-item className="mt-2 text-[15px] text-[#2B323B] max-w-xl leading-relaxed">
                    Thanks, {form.contactPerson.split(" ")[0] || "and welcome"}. Your order for {form.orgName} is in our factory queue, and your account is ready.
                  </p>

                  <ol className="mt-7 border-t border-[#DFE6EE]">
                    {[
                      ["We check your specification", "Our team reviews the product, quantity and any artwork you sent."],
                      ["You get a formal quotation", "It appears in your order portal, with GST included."],
                      ["You approve the proof", "Production starts only after you sign off."],
                      ["We dispatch", "Tracking details are added to your order."],
                    ].map(([title, detail], index) => (
                      <li data-success-item key={title} className="grid grid-cols-[2.5rem_1fr] py-3.5 border-b border-[#DFE6EE]">
                        <span className="font-mono text-[13px] text-[#2B323B] pt-0.5">0{index + 1}</span>
                        <div>
                          <p className="text-[15px] font-bold text-[#121418]">{title}</p>
                          <p className="text-sm text-[#2B323B] mt-0.5">{detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <div data-success-item className="mt-7 flex flex-col sm:flex-row gap-3">
                    <Link
                      href={orderNumber ? `/orders/${orderNumber}` : "/orders"}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] font-bold text-[15px] transition-colors"
                    >
                      <span>Open my order</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/products"
                      className="inline-flex items-center justify-center px-6 py-3.5 rounded-md border border-[#121418] text-[#121418] hover:bg-[#121418] hover:text-white font-bold text-[15px] transition-colors"
                    >
                      Keep browsing
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Stepper */}
                  <div className="px-5 sm:px-8 pt-6">
                    <ol className="relative flex justify-between">
                      <div aria-hidden="true" className="absolute top-3.5 left-3.5 right-3.5 h-0.5 bg-[#DFE6EE]">
                        <div ref={progressRef} className="h-full w-full bg-[#F26B1D] origin-left" style={{ transform: "scaleX(0)" }} />
                      </div>
                      {STEPS.map((label, index) => {
                        const done = index < step;
                        const current = index === step;
                        return (
                          <li key={label} className="relative flex flex-col items-start first:items-start last:items-end flex-1 last:flex-none">
                            <button
                              type="button"
                              disabled={!done}
                              onClick={() => goTo(index)}
                              aria-current={current ? "step" : undefined}
                              className="group flex flex-col items-[inherit] gap-1.5 disabled:cursor-default"
                            >
                              <span
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-mono font-semibold transition-colors duration-300 ${
                                  done || current
                                    ? "bg-[#121418] text-white"
                                    : "bg-[#FFFFFF] text-[#353C45] border-2 border-[#DFE6EE]"
                                }`}
                              >
                                {done ? <Check className="w-4 h-4" /> : index + 1}
                              </span>
                              <span
                                className={`hidden sm:block text-[13px] font-semibold ${
                                  current ? "text-[#121418]" : "text-[#353C45] group-enabled:group-hover:text-[#121418]"
                                }`}
                              >
                                {label}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </div>

                  <div ref={panelRef} className="p-5 sm:p-8">
                    <p className="sm:hidden font-mono text-xs text-[#353C45] mb-1">
                      Step {step + 1} of {STEPS.length}
                    </p>

                    {step === 0 && (
                      <form onSubmit={continueFromOrder} noValidate className="space-y-7">
                        <div data-step-item>
                          <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold text-[#121418] outline-none">
                            What do you need?
                          </h2>
                          <p className="text-[15px] text-[#2B323B] mt-1">Pick the closest match. We will confirm every detail with you.</p>
                        </div>

                        <div data-step-item>
                          <ChipGroup
                            legend="Ordering for"
                            value={form.orgType}
                            onChange={(value) => changeOrgType(value as OrgType)}
                            options={ORG_TYPES.map((type) => ({ value: type.value, label: type.label }))}
                          />
                        </div>

                        <fieldset data-step-item>
                          <legend className="text-sm font-semibold text-[#121418] mb-2">Product</legend>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {productLines.map((line) => {
                              const selected = line.value === product.value;
                              return (
                                <button
                                  key={line.value}
                                  type="button"
                                  aria-pressed={selected}
                                  onClick={() => setForm((prev) => ({ ...prev, productValue: line.value, specChoices: {} }))}
                                  className={`flex items-start justify-between gap-3 text-left p-3.5 rounded-md border transition-colors ${
                                    selected ? "bg-[#EDF1F6] border-[#B9C3CF]" : "bg-[#FFFFFF] border-[#B9C3CF] hover:border-[#121418]"
                                  }`}
                                >
                                  <span>
                                    <span className="block text-[15px] font-bold text-[#121418]">{line.label}</span>
                                    <span className="block text-[13px] text-[#353C45] mt-0.5">{line.detail}</span>
                                  </span>
                                  <span
                                    aria-hidden="true"
                                    className={`mt-0.5 w-5 h-5 shrink-0 rounded-full border flex items-center justify-center transition-colors ${
                                      selected ? "bg-[#121418] border-[#B9C3CF] text-white" : "border-[#B9C3CF]"
                                    }`}
                                  >
                                    {selected && <Check className="w-3 h-3" />}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </fieldset>

                        {product.specs.map((spec) => (
                          <div data-step-item key={`${product.value}-${spec.label}`}>
                            <ChipGroup
                              legend={spec.label}
                              allowClear
                              value={form.specChoices[spec.label] || ""}
                              onChange={(value) =>
                                setForm((prev) => ({ ...prev, specChoices: { ...prev.specChoices, [spec.label]: value } }))
                              }
                              options={spec.options.map((option) => ({ value: option, label: option }))}
                            />
                          </div>
                        ))}

                        <div data-step-item className="border-t border-[#DFE6EE] pt-6">
                          <ChipGroup
                            legend="Quantity"
                            value={form.quantity}
                            onChange={(value) => set("quantity", value)}
                            options={QUANTITY_PRESETS.map((preset) => ({
                              value: String(preset),
                              label: preset.toLocaleString("en-IN"),
                            }))}
                          />
                          <div className="mt-3 max-w-xs">
                            <Field
                              id="quantity"
                              label="Or enter an exact quantity"
                              error={quantityError}
                              attempt={attempt}
                            >
                              <input
                                id="quantity"
                                type="number"
                                inputMode="numeric"
                                min={MIN_QUANTITY}
                                step={50}
                                value={form.quantity}
                                aria-invalid={!!quantityError}
                                aria-describedby={quantityError ? "quantity-error" : undefined}
                                onChange={(e) => set("quantity", e.target.value)}
                                className={`${inputClass} tabular-nums`}
                              />
                            </Field>
                          </div>

                          {/* Slab track */}
                          <div className="mt-5" aria-hidden="true">
                            <div className="relative h-1.5 flex gap-px">
                              <span className="flex-[52] bg-[#DFE6EE]" />
                              <span className="flex-[26] bg-[#121418]" />
                              <span className="flex-[22] bg-[#121418]" />
                              <span
                                ref={markerRef}
                                className="absolute -top-1.5 -ml-1.5 w-3 h-[1.125rem] bg-[#121418]"
                                style={{ left: "52%" }}
                              />
                            </div>
                            <div className="mt-2 flex text-[12px] text-[#353C45]">
                              <span className="flex-[52]">Wholesale rate</span>
                              <span className="flex-[26]">Up to 20% off</span>
                              <span className="flex-[22]">Contract</span>
                            </div>
                          </div>
                        </div>

                        <div data-step-item className="border-t border-[#DFE6EE] pt-6 space-y-5">
                          <div className="max-w-xs">
                            <Field id="neededBy" label="Needed by" optional>
                              <input
                                id="neededBy"
                                type="date"
                                value={form.neededBy}
                                onChange={(e) => set("neededBy", e.target.value)}
                                className={inputClass}
                              />
                            </Field>
                          </div>

                          <Field
                            id="notes"
                            label="Anything else we should know?"
                            optional
                            hint="Pantone colours, printing text, branch-wise delivery, or a reference to a past order."
                          >
                            <textarea
                              id="notes"
                              rows={3}
                              value={form.notes}
                              aria-describedby="notes-hint"
                              onChange={(e) => set("notes", e.target.value)}
                              className={`${inputClass} leading-relaxed resize-y`}
                            />
                          </Field>

                          <div>
                            <div className="flex items-baseline justify-between mb-1.5">
                              <span className="text-sm font-semibold text-[#121418]">Logo, artwork or spec sheet</span>
                              <span className="text-xs text-[#353C45]">Optional</span>
                            </div>
                            {attachment ? (
                              <div className="flex items-center justify-between gap-3 p-3 border border-[#B9C3CF] rounded-md">
                                <span className="flex items-center gap-2 min-w-0 text-sm text-[#121418]">
                                  <Check className="w-4 h-4 text-[#217A4B] shrink-0" />
                                  <span className="truncate">{attachment.name}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setAttachment(null)}
                                  aria-label={`Remove ${attachment.name}`}
                                  className="p-1.5 text-[#353C45] hover:text-[#C0392B] transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <label
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setDragging(true);
                                }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setDragging(false);
                                  chooseFile(e.dataTransfer.files[0]);
                                }}
                                className={`flex items-center gap-3 p-4 border border-dashed rounded-md cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#121418]/20 ${
                                  dragging ? "border-[#B9C3CF] bg-[#EDF1F6]" : "border-[#6C7A89] hover:border-[#121418]"
                                }`}
                              >
                                <FileUp className="w-5 h-5 text-[#2B323B] shrink-0" />
                                <span className="text-sm text-[#2B323B]">
                                  <span className="font-semibold text-[#121418]">Choose a file</span> or drop it here. PDF, PNG, JPG, AI or CDR, up to 15 MB.
                                </span>
                                <input
                                  type="file"
                                  accept={ATTACHMENT_EXTENSIONS.join(",")}
                                  className="sr-only"
                                  onChange={(e) => chooseFile(e.target.files?.[0])}
                                />
                              </label>
                            )}
                            {attachmentError && (
                              <p role="alert" className="mt-1.5 text-[13px] font-medium text-[#C0392B]">
                                {attachmentError}
                              </p>
                            )}
                          </div>
                        </div>

                        <div data-step-item className="flex justify-end">
                          <button
                            type="submit"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] font-bold text-[15px] transition-colors"
                          >
                            <span>Continue</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </form>
                    )}

                    {step === 1 && (
                      <form onSubmit={continueFromDetails} noValidate className="space-y-5">
                        <div data-step-item>
                          <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold text-[#121418] outline-none">
                            Who should we quote?
                          </h2>
                          <p className="text-[15px] text-[#2B323B] mt-1">We use this for your quotation, GST invoice and delivery.</p>
                        </div>

                        <div data-step-item className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <Field id="orgName" label={org.nameLabel} error={shownError("orgName")} valid={!!form.orgName.trim()} attempt={attempt}>
                            <input
                              id="orgName"
                              type="text"
                              autoComplete="organization"
                              value={form.orgName}
                              placeholder={org.namePlaceholder}
                              aria-invalid={!!shownError("orgName")}
                              aria-describedby={shownError("orgName") ? "orgName-error" : undefined}
                              onChange={(e) => set("orgName", e.target.value)}
                              onBlur={() => touch("orgName")}
                              className={inputClass}
                            />
                          </Field>
                          <Field id="contactPerson" label="Your name" error={shownError("contactPerson")} valid={!!form.contactPerson.trim()} attempt={attempt}>
                            <input
                              id="contactPerson"
                              type="text"
                              autoComplete="name"
                              value={form.contactPerson}
                              placeholder="e.g. Priya Sharma"
                              aria-invalid={!!shownError("contactPerson")}
                              aria-describedby={shownError("contactPerson") ? "contactPerson-error" : undefined}
                              onChange={(e) => set("contactPerson", e.target.value)}
                              onBlur={() => touch("contactPerson")}
                              className={inputClass}
                            />
                          </Field>
                          <Field
                            id="email"
                            label="Work email"
                            error={shownError("email")}
                            valid={!errors.email}
                            hint="Your quotation updates go here."
                            attempt={attempt}
                          >
                            <input
                              id="email"
                              type="email"
                              autoComplete="email"
                              value={form.email}
                              placeholder="name@company.com"
                              aria-invalid={!!shownError("email")}
                              aria-describedby={shownError("email") ? "email-error" : "email-hint"}
                              onChange={(e) => set("email", e.target.value)}
                              onBlur={() => touch("email")}
                              className={inputClass}
                            />
                          </Field>
                          <Field id="phone" label="Phone or WhatsApp" error={shownError("phone")} valid={!errors.phone} attempt={attempt}>
                            <input
                              id="phone"
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              value={form.phone}
                              placeholder="+91 98765 43210"
                              aria-invalid={!!shownError("phone")}
                              aria-describedby={shownError("phone") ? "phone-error" : undefined}
                              onChange={(e) => set("phone", e.target.value)}
                              onBlur={() => touch("phone")}
                              className={inputClass}
                            />
                          </Field>
                          <Field id="city" label="Delivery city" error={shownError("city")} attempt={attempt}>
                            <input
                              id="city"
                              type="text"
                              autoComplete="address-level2"
                              value={form.city}
                              aria-invalid={!!shownError("city")}
                              aria-describedby={shownError("city") ? "city-error" : undefined}
                              onChange={(e) => set("city", e.target.value)}
                              onBlur={() => touch("city")}
                              className={inputClass}
                            />
                          </Field>
                          <Field id="state" label="State">
                            <select
                              id="state"
                              autoComplete="address-level1"
                              value={form.state}
                              onChange={(e) => set("state", e.target.value)}
                              className={inputClass}
                            >
                              {INDIAN_STATES.map((name) => (
                                <option key={name} value={name}>
                                  {name}
                                </option>
                              ))}
                            </select>
                          </Field>
                        </div>

                        <div data-step-item className="sm:max-w-[calc(50%-0.625rem)]">
                          <Field
                            id="gstNumber"
                            label="GSTIN"
                            optional
                            hint="Add it to claim input tax credit on this order."
                            error={shownError("gstNumber")}
                            valid={!!form.gstNumber && !errors.gstNumber}
                            attempt={attempt}
                          >
                            <input
                              id="gstNumber"
                              type="text"
                              maxLength={15}
                              value={form.gstNumber}
                              placeholder="29AAAAA0000A1Z5"
                              aria-invalid={!!shownError("gstNumber")}
                              aria-describedby={shownError("gstNumber") ? "gstNumber-error" : "gstNumber-hint"}
                              onChange={(e) => set("gstNumber", e.target.value.toUpperCase())}
                              onBlur={() => touch("gstNumber")}
                              className={`${inputClass} font-mono`}
                            />
                          </Field>
                        </div>

                        <div data-step-item className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => goTo(0)}
                            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-md text-[#121418] hover:bg-[#EDF1F6] font-bold text-[15px] transition-colors"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] font-bold text-[15px] transition-colors"
                          >
                            <span>Review order</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </form>
                    )}

                    {step === 2 && (
                      <div className="space-y-6">
                        <div data-step-item>
                          <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold text-[#121418] outline-none">
                            Check and send
                          </h2>
                          <p className="text-[15px] text-[#2B323B] mt-1">Nothing is charged now. This request gets you a formal quotation.</p>
                        </div>

                        <dl data-step-item className="border-t border-[#DFE6EE]">
                          {reviewRows.map((row) => (
                            <div key={row.label} className="grid grid-cols-[6.5rem_1fr_auto] sm:grid-cols-[8rem_1fr_auto] gap-3 py-3 border-b border-[#DFE6EE] items-baseline">
                              <dt className="text-[13px] text-[#353C45]">{row.label}</dt>
                              <dd className="text-[15px] text-[#121418] min-w-0 break-words line-clamp-3">{row.value}</dd>
                              <dd>
                                <button
                                  type="button"
                                  onClick={() => goTo(row.step)}
                                  aria-label={`Edit ${row.label}`}
                                  className="text-[13px] font-semibold text-[#2B323B] hover:underline underline-offset-2"
                                >
                                  Edit
                                </button>
                              </dd>
                            </div>
                          ))}
                        </dl>

                        {submitError && (
                          <p role="alert" className="p-3.5 rounded-md bg-[#FDEDEC] text-[14px] font-medium text-[#C0392B]">
                            {submitError}
                          </p>
                        )}

                        {currentUser ? (
                          <p data-step-item className="flex items-center gap-2 text-sm text-[#2B323B]">
                            <Check className="w-4 h-4 text-[#217A4B] shrink-0" />
                            <span>
                              Ordering as <strong className="text-[#121418]">{currentUser.first_name || currentUser.username}</strong>
                              {currentUser.email ? ` (${currentUser.email})` : ""}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                clearClientSession();
                                setCurrentUser(null);
                                setAccountMode("login");
                              }}
                              className="ml-1 text-[13px] font-semibold text-[#2B323B] hover:underline underline-offset-2"
                            >
                              Not you? Switch account
                            </button>
                          </p>
                        ) : accountMode === "login" ? (
                          <form data-step-item onSubmit={handleLogin} className="bg-[#EDF1F6] p-4 sm:p-5 rounded-md space-y-4">
                            <div className="flex items-baseline justify-between gap-3">
                              <h3 className="text-base font-bold text-[#121418]">Log in to your account</h3>
                              <button
                                type="button"
                                onClick={() => setAccountMode("new")}
                                className="text-[13px] font-semibold text-[#2B323B] hover:underline underline-offset-2"
                              >
                                Create a new one instead
                              </button>
                            </div>
                            <Field id="loginId" label="Email or username">
                              <input
                                id="loginId"
                                type="text"
                                autoComplete="username"
                                required
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                                className={inputClass}
                              />
                            </Field>
                            <Field id="loginPassword" label="Password" error={loginError}>
                              <input
                                id="loginPassword"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={loginPassword}
                                aria-invalid={!!loginError}
                                aria-describedby={loginError ? "loginPassword-error" : undefined}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className={inputClass}
                              />
                            </Field>
                            <div className="flex items-center justify-between gap-3">
                              <Link href="/account/forgot-password" className="text-[13px] font-semibold text-[#2B323B] hover:underline underline-offset-2">
                                Forgot password?
                              </Link>
                              <button
                                type="submit"
                                disabled={loginLoading}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#F26B1D] hover:bg-[#FF8A3D] disabled:opacity-60 text-[#121418] font-bold text-sm transition-colors"
                              >
                                {loginLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>{loginLoading ? "Logging in" : "Log in"}</span>
                              </button>
                            </div>
                          </form>
                        ) : null}

                        {!(accountMode === "login" && !currentUser) && (
                          <form data-step-item onSubmit={handleSubmit} noValidate className="space-y-5">
                            {!currentUser && (
                              <Field
                                id="password"
                                label="Create an account password (optional)"
                                optional
                                hint="Create a password if you wish to sign in later to review quotes, approve proofs, and chat with our team."
                                error={touched.password ? passwordError : ""}
                                attempt={attempt}
                              >
                                <input
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  autoComplete="new-password"
                                  value={password}
                                  placeholder="At least 8 characters (optional)"
                                  aria-invalid={!!(touched.password && passwordError)}
                                  aria-describedby={touched.password && passwordError ? "password-error" : "password-hint"}
                                  onChange={(e) => setPassword(e.target.value)}
                                  onBlur={() => touch("password")}
                                  className={`${inputClass} pr-11`}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword((shown) => !shown)}
                                  aria-label={showPassword ? "Hide password" : "Show password"}
                                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-[#353C45] hover:text-[#121418] transition-colors"
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </Field>
                            )}

                            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => goTo(1)}
                                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-md text-[#121418] hover:bg-[#EDF1F6] font-bold text-[15px] transition-colors"
                              >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back</span>
                              </button>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                {!currentUser && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLoginId(form.email.trim());
                                      setAccountMode("login");
                                    }}
                                    className="text-sm font-semibold text-[#2B323B] hover:underline underline-offset-2"
                                  >
                                    Already have an account? Sign in
                                  </button>
                                )}
                                <button
                                  type="submit"
                                  disabled={submitting}
                                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md bg-[#F26B1D] hover:bg-[#FF8A3D] disabled:opacity-60 text-[#121418] font-bold text-[15px] transition-colors"
                                >
                                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                  <span>{submitting ? "Sending your order" : "Send for quotation"}</span>
                                </button>
                              </div>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Live summary */}
          <aside data-desk aria-label="Order summary" className="lg:col-span-4 lg:sticky lg:top-20 bg-[#0E2238] text-white">
            <div className="p-5 sm:p-6">
              <p className="font-mono text-xs text-slate-300">Your order</p>
              <p className="mt-1 text-lg font-bold">{product.label}</p>
              {chosenSpecs.length > 0 && <p className="text-sm text-slate-300 mt-0.5">{chosenSpecs.join(" · ")}</p>}

              <p className="mt-5 font-heading text-4xl font-extrabold tabular-nums tracking-tight">
                <span ref={quantityCounterRef}>2,500</span>
                <span className="ml-2 font-sans text-sm font-medium text-slate-300">units</span>
              </p>

              <div className="mt-5 pt-5 border-t border-white/15">
                <p data-tier-swap className="text-[15px] font-bold text-[#FF8A3D]">{tier.discount}</p>
                <p data-tier-swap className="text-sm text-slate-300 mt-0.5">
                  {tier.name} · {tier.turnaround}
                </p>
                <ul className="mt-4 space-y-2">
                  {tier.features.map((feature) => (
                    <li data-tier-swap key={`${tier.id}-${feature}`} className="flex items-start gap-2 text-sm text-slate-200">
                      <Check className="w-4 h-4 text-[#FF8A3D] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-2 border-t border-white/15 text-sm font-semibold">
              <a
                href={`${WHATSAPP}?text=${encodeURIComponent("Hi, I would like to discuss a bulk order.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 hover:bg-white/10 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
              <a href="tel:+919741808034" className="flex items-center justify-center gap-2 py-3.5 border-l border-white/15 hover:bg-white/10 transition-colors">
                <Phone className="w-4 h-4" />
                <span>Call us</span>
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* Slab comparison */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#121418] tracking-tight leading-[1.08]">
          Larger orders earn better terms
        </h2>
        <p className="mt-3 text-[15px] text-[#2B323B] max-w-xl">
          Your final price depends on the product and specification, and is confirmed in your formal GST quotation.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 border-t-2 border-[#121418] md:divide-x divide-[#DFE6EE]">
          {VOLUME_TIERS.map((item) => {
            const active = item.id === tier.id;
            return (
              <div
                key={item.id}
                className={`flex flex-col p-5 sm:p-6 border-b md:border-b-0 border-[#DFE6EE] transition-colors duration-300 ${
                  active ? "bg-[#EDF1F6]" : ""
                }`}
              >
                <p className="text-sm font-semibold text-[#2B323B]">{item.name}</p>
                <p className="mt-1 font-heading text-2xl font-extrabold text-[#121418] tabular-nums">{item.volume}</p>
                <p className="text-[13px] text-[#353C45]">units</p>
                <p className="mt-3 text-[15px] font-bold text-[#2B323B]">{item.discount}</p>
                <p className="text-sm text-[#2B323B]">{item.turnaround}</p>
                <ul className="mt-4 mb-5 space-y-1.5 flex-1">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-[#121418]">
                      <Check className="w-4 h-4 text-[#217A4B] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => startWithTier(item.sampleQty)}
                  disabled={orderNumber !== null}
                  className={`w-full py-3 rounded-md font-bold text-sm transition-colors disabled:opacity-50 ${
                    active
                      ? "bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418]"
                      : "border border-[#121418] text-[#121418] hover:bg-[#121418] hover:text-white"
                  }`}
                >
                  {active ? "Your current slab" : `Start with ${item.sampleQty.toLocaleString("en-IN")} units`}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
