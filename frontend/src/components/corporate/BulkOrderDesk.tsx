"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
} from "lucide-react";
import {
  clearClientSession,
  clientLogin,
  clientSubmitBulkOrder,
  clientVerifySession,
} from "@/lib/api";
import {
  gsap,
  prefersReducedMotion,
  useGSAP,
} from "@/lib/gsap";
import TextReveal from "@/components/animations/TextReveal";
import {
  CropMarks,
} from "@/components/animations/PrintMarks";
import PrintPlanet from "@/components/planet/PrintPlanet";
import type { PrintPlanet as PlanetScene } from "@/components/planet/printPlanetScene";
import {
  ATTACHMENT_EXTENSIONS,
  MAX_ATTACHMENT_BYTES,
  INDIAN_STATES,
  MIN_QUANTITY,
  ORG_TYPES,
  OrgType,
  productLinesFor,
  tierForQuantity,
  validators,
} from "./orderData";
import Hero from "./bulk-order/Hero";
import OrderStepDetails from "./bulk-order/OrderStepDetails";
import OrderStepContact from "./bulk-order/OrderStepContact";
import AddressPicker, { type AddressChoice } from "@/components/orders/AddressPicker";
import OrderStepReview from "./bulk-order/OrderStepReview";
import LiveSummary from "./bulk-order/LiveSummary";
import SlabComparison from "./bulk-order/SlabComparison";
import {
  Draft,
  FieldName,
} from "./bulk-order/shared";

const DRAFT_KEY = "the_print_planet_bulk_order_draft_v1";
const STEPS = ["Your order", "Your details", "Review and send"];


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

  const [addressChoice, setAddressChoice] = useState<AddressChoice>({ shippingId: "", billingId: "" });
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
      if (res.user) applyUser(res.user);
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
    if (currentUser && addressChoice.shippingId) payload.append("shipping_address_id", addressChoice.shippingId);
    if (currentUser && addressChoice.billingId) payload.append("billing_address_id", addressChoice.billingId);
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
        .from("[data-crop]", { autoAlpha: 0, scale: 1.8, duration: 0.45, stagger: 0.06, ease: "power3.out" }, 0.8);
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
        .from("[data-success-ring]", { scale: 0.6, autoAlpha: 0, duration: 0.5, transformOrigin: "50% 50%", ease: "power3.out" })
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
      <Hero
        pressPlanet={pressPlanet}
      />

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
                      <OrderStepDetails
                        continueFromOrder={continueFromOrder}
                        headingRef={headingRef}
                        form={form}
                        changeOrgType={changeOrgType}
                        productLines={productLines}
                        product={product}
                        setForm={setForm}
                        set={set}
                        quantityError={quantityError}
                        attempt={attempt}
                        markerRef={markerRef}
                        attachment={attachment}
                        setAttachment={setAttachment}
                        setDragging={setDragging}
                        chooseFile={chooseFile}
                        dragging={dragging}
                        attachmentError={attachmentError}
                      />
                    )}

                    {step === 1 && (
                      <OrderStepContact
                        continueFromDetails={continueFromDetails}
                        headingRef={headingRef}
                        org={org}
                        shownError={shownError}
                        form={form}
                        attempt={attempt}
                        set={set}
                        touch={touch}
                        errors={errors}
                        goTo={goTo}
                        addressPicker={
                          currentUser ? (
                            <AddressPicker
                              value={addressChoice}
                              onChange={setAddressChoice}
                              onPickShipping={(address) => {
                                if (!address) return;
                                set("city", address.city);
                                if (INDIAN_STATES.includes(address.state)) set("state", address.state);
                              }}
                            />
                          ) : undefined
                        }
                      />
                    )}

                    {step === 2 && (
                      <OrderStepReview
                        headingRef={headingRef}
                        reviewRows={reviewRows}
                        goTo={goTo}
                        submitError={submitError}
                        currentUser={currentUser}
                        setCurrentUser={setCurrentUser}
                        setAccountMode={setAccountMode}
                        accountMode={accountMode}
                        handleLogin={handleLogin}
                        loginId={loginId}
                        setLoginId={setLoginId}
                        loginError={loginError}
                        loginPassword={loginPassword}
                        setLoginPassword={setLoginPassword}
                        loginLoading={loginLoading}
                        handleSubmit={handleSubmit}
                        touched={touched}
                        passwordError={passwordError}
                        attempt={attempt}
                        showPassword={showPassword}
                        password={password}
                        setPassword={setPassword}
                        touch={touch}
                        setShowPassword={setShowPassword}
                        form={form}
                        submitting={submitting}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Live summary */}
          <LiveSummary
            product={product}
            chosenSpecs={chosenSpecs}
            quantityCounterRef={quantityCounterRef}
            tier={tier}
          />
        </div>
      </section>

      {/* Slab comparison */}
      <SlabComparison
        tier={tier}
        startWithTier={startWithTier}
        orderNumber={orderNumber}
      />
    </div>
  );
}
