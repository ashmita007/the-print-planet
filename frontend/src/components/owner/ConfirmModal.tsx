"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = true,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = orig;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="alertdialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl max-w-[320px] sm:max-w-md w-full p-4 sm:p-6 shadow-xl sm:shadow-2xl border border-[#DCE3EB] animate-in zoom-in-95 duration-150 space-y-3 sm:space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              isDestructive
                ? "bg-red-100 text-[#C0392B]"
                : "bg-blue-100 text-[#17365D]"
            }`}
          >
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1 min-w-0 pr-1">
            <h3 className="text-sm sm:text-base font-bold text-[#17365D] leading-snug">
              {title}
            </h3>
            <p className="text-[11px] sm:text-xs text-[#687586] mt-0.5 sm:mt-1 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center shrink-0"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        <div className="pt-2 sm:pt-4 border-t border-[#DCE3EB] flex gap-2 sm:gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-initial py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg sm:rounded-xl border border-[#DCE3EB] text-[#263445] text-xs sm:text-sm font-semibold hover:bg-[#F5F7FA] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 sm:flex-initial py-1.5 sm:py-2 px-3 sm:px-5 rounded-lg sm:rounded-xl text-white text-xs sm:text-sm font-bold transition-colors shadow-2xs ${
              isDestructive
                ? "bg-[#C0392B] hover:bg-[#a93226]"
                : "bg-[#17365D] hover:bg-[#102742]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
