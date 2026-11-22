"use client";

import React from "react";
import { CheckCircle, AlertCircle, Lock } from "lucide-react";

export interface SecurityTabProps {
  currentPassword: string;
  newPassword: string;
  passSubmitting: boolean;
  passSuccess: string;
  passError: string;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  handleChangePassword: (e: React.FormEvent) => Promise<void>;
}

export default function SecurityTab({
  currentPassword,
  newPassword,
  passSubmitting,
  passSuccess,
  passError,
  setCurrentPassword,
  setNewPassword,
  handleChangePassword,
}: SecurityTabProps) {
  return (
    <div className="surface-card p-6 rounded-lg space-y-5 text-xs">
      <h2 className="text-sm font-semibold text-[#121418] border-b border-[#DFE6EE] pb-2 flex items-center gap-1.5">
        <Lock className="w-4 h-4 text-[#353C45]" />
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
          <label htmlFor="field-current-password" className="block font-semibold text-[#121418] mb-1">Current Password *</label>
          <input id="field-current-password"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded-lg px-3.5 py-2.5 outline-none"
          />
        </div>

        <div>
          <label htmlFor="field-new-master-password-min" className="block font-semibold text-[#121418] mb-1">
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
          className="bg-[#121418] hover:bg-[#2A2F37] text-white px-6 py-2.5 rounded-md font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {passSubmitting ? "Updating Password..." : "Update Owner Password"}
        </button>
      </form>
    </div>
  );
}
