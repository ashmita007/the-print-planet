"use client";

import React from "react";
import { Check, Loader2, EyeOff, Eye, ArrowLeft } from "lucide-react";
import { clearClientSession } from "@/lib/api";
import { Field, inputClass } from "../FormControls";
import Link from "next/link";
import { FieldName, Draft } from "./shared";

export interface OrderStepReviewProps {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  reviewRows: { label: string; value: string; step: number; }[];
  goTo: (next: number) => void;
  submitError: string;
  currentUser: { email?: string; first_name?: string; username?: string; } | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<{ email?: string; first_name?: string; username?: string; } | null>>;
  setAccountMode: React.Dispatch<React.SetStateAction<"new" | "login">>;
  accountMode: "new" | "login";
  handleLogin: (e: React.FormEvent) => Promise<void>;
  loginId: string;
  setLoginId: React.Dispatch<React.SetStateAction<string>>;
  loginError: string;
  loginPassword: string;
  setLoginPassword: React.Dispatch<React.SetStateAction<string>>;
  loginLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  touched: Partial<Record<FieldName | "password", boolean>>;
  passwordError: "" | "Use at least 8 characters";
  attempt: number;
  showPassword: boolean;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  touch: (name: FieldName | "password") => void;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  form: Draft;
  submitting: boolean;
}

export default function OrderStepReview({
  headingRef,
  reviewRows,
  goTo,
  submitError,
  currentUser,
  setCurrentUser,
  setAccountMode,
  accountMode,
  handleLogin,
  loginId,
  setLoginId,
  loginError,
  loginPassword,
  setLoginPassword,
  loginLoading,
  handleSubmit,
  touched,
  passwordError,
  attempt,
  showPassword,
  password,
  setPassword,
  touch,
  setShowPassword,
  form,
  submitting,
}: OrderStepReviewProps) {
  return (
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
  );
}
