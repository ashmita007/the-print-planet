"use client";

import React, { useState } from "react";
import { downloadProtectedFile } from "@/lib/api";

type Props = {
  url: string;
  as?: "client" | "owner";
  className?: string;
  children: React.ReactNode;
};

/**
 * Attachments live behind authenticated API routes, which a plain link cannot reach
 * because it cannot send the token. API paths download through fetch; others stay links.
 */
export default function AttachmentLink({ url, as = "client", className, children }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!url.startsWith("/api/")) {
    const safe = /^https?:\/\//i.test(url) || (url.startsWith("/") && !url.startsWith("//"));
    if (!safe) return null;
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={busy}
        aria-busy={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          const res = await downloadProtectedFile(url, as);
          setBusy(false);
          if (!res.success) setError(res.error || "Download failed.");
        }}
        className={`${className ?? ""} disabled:opacity-60`}
      >
        {children}
      </button>
      {error && (
        <span role="alert" className="block text-[11px] font-semibold text-[#C0392B] mt-1">
          {error}
        </span>
      )}
    </>
  );
}
