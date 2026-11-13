"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, ExternalLink, KeyRound, Loader2, RefreshCw, Save, Star } from "lucide-react";
import {
  OwnerGoogleReviews,
  ownerGetGoogleReviews,
  ownerSaveGoogleReviews,
  ownerSyncGoogleReviews,
} from "@/lib/api";

const inputClass =
  "w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none";

function formatWhen(iso: string | null) {
  if (!iso) return "never";
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function GoogleReviewsSettings() {
  const [conn, setConn] = useState<OwnerGoogleReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const [reviewUrl, setReviewUrl] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showOnSite, setShowOnSite] = useState(true);

  const apply = (c: OwnerGoogleReviews) => {
    setConn(c);
    setReviewUrl(c.review_url || "");
    setMapsUrl(c.maps_url || "");
    setPlaceId(c.place_id || "");
    setShowOnSite(c.show_on_site);
    setApiKey("");
  };

  useEffect(() => {
    ownerGetGoogleReviews().then((c) => {
      if (c) apply(c);
      else setNotice({ ok: false, text: "Could not load Google review settings. Check that you are signed in." });
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    const payload: Parameters<typeof ownerSaveGoogleReviews>[0] = {
      review_url: reviewUrl.trim(),
      maps_url: mapsUrl.trim(),
      place_id: placeId.trim(),
      show_on_site: showOnSite,
    };
    if (apiKey.trim()) payload.places_api_key = apiKey.trim();
    const res = await ownerSaveGoogleReviews(payload);
    setSaving(false);
    if (!res.success || !res.data) {
      setNotice({ ok: false, text: res.error || "Could not save." });
      return;
    }
    apply(res.data);
    // Pull fresh data straight away when the connection is complete.
    if (res.data.place_id && res.data.has_api_key) {
      await handleSync();
    } else {
      setNotice({ ok: true, text: "Saved." });
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setNotice(null);
    const res = await ownerSyncGoogleReviews();
    setSyncing(false);
    if (res.data) apply(res.data);
    setNotice({ ok: res.success, text: res.message });
  };

  const handleRemoveKey = async () => {
    setSaving(true);
    const res = await ownerSaveGoogleReviews({ places_api_key: "CLEAR" });
    setSaving(false);
    if (res.success && res.data) {
      apply(res.data);
      setNotice({ ok: true, text: "Saved API key removed." });
    } else {
      setNotice({ ok: false, text: res.error || "Could not remove the key." });
    }
  };

  if (loading) {
    return (
      <div className="surface-card p-6 rounded-lg text-xs text-[#353C45] flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading Google review settings...
      </div>
    );
  }

  const connected = !!(conn?.place_id && conn?.has_api_key);

  return (
    <form onSubmit={handleSave} className="space-y-6 text-xs">
      {/* Status */}
      <div className="surface-card p-6 rounded-lg space-y-4">
        <h2 className="text-sm font-semibold text-[#121418] border-b border-[#DFE6EE] pb-2 flex items-center gap-2">
          <Star className="w-4 h-4 text-[#F26B1D]" />
          Google reviews on the homepage
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-slate-500">Rating</p>
            <p className="text-lg font-extrabold text-[#121418] tabular-nums">
              {conn?.rating != null ? Number(conn.rating).toFixed(1) : "—"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Total reviews</p>
            <p className="text-lg font-extrabold text-[#121418] tabular-nums">{conn?.review_count ?? "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">Shown on site</p>
            <p className="text-lg font-extrabold text-[#121418] tabular-nums">{conn?.reviews?.length ?? 0}</p>
          </div>
          <div>
            <p className="text-slate-500">Last synced</p>
            <p className="font-semibold text-[#121418]">{formatWhen(conn?.last_synced_at ?? null)}</p>
          </div>
        </div>

        {conn?.last_sync_error && (
          <p className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Last sync failed: {conn.last_sync_error}</span>
          </p>
        )}

        <p className="text-[#353C45] leading-relaxed">
          The homepage shows your real Google rating and up to 5 recent reviews, exactly as Google returns them. It
          refreshes by itself once a day. Until something is connected, the review section stays hidden.
        </p>

        <button
          type="button"
          onClick={handleSync}
          disabled={!connected || syncing}
          className="inline-flex items-center gap-2 border border-[#121418]/30 text-[#121418] hover:bg-[#EDF1F6] px-4 py-2 rounded-md font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing from Google..." : "Sync now"}
        </button>
      </div>

      {/* Links */}
      <div className="surface-card p-6 rounded-lg space-y-5">
        <h2 className="text-sm font-semibold text-[#121418] border-b border-[#DFE6EE] pb-2">1. Review links</h2>
        <p className="text-[#353C45] leading-relaxed">
          In Google Business Profile, open <strong>Ask for reviews</strong> and copy the link. That alone adds a
          &ldquo;Write a Google review&rdquo; button to the homepage.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="field-google-review-url" className="block font-semibold text-[#121418] mb-1">
              &ldquo;Write a review&rdquo; link
            </label>
            <input
              id="field-google-review-url"
              type="url"
              value={reviewUrl}
              onChange={(e) => setReviewUrl(e.target.value)}
              placeholder="https://g.page/r/.../review"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="field-google-maps-url" className="block font-semibold text-[#121418] mb-1">
              Google Maps listing link (optional)
            </label>
            <input
              id="field-google-maps-url"
              type="url"
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              placeholder="Filled in automatically after the first sync"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Places API */}
      <div className="surface-card p-6 rounded-lg space-y-5">
        <h2 className="text-sm font-semibold text-[#121418] border-b border-[#DFE6EE] pb-2 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#353C45]" />
          2. Show your rating and reviews
        </h2>
        <p className="text-[#353C45] leading-relaxed">
          Find your Place ID with Google&apos;s{" "}
          <a
            href="https://developers.google.com/maps/documentation/places/web-service/place-id"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#121418] underline underline-offset-2 inline-flex items-center gap-1"
          >
            Place ID finder <ExternalLink className="w-3 h-3" />
          </a>
          . The API key needs the <strong>Places API (New)</strong> enabled. Restrict it to that API in Google Cloud.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="field-google-place-id" className="block font-semibold text-[#121418] mb-1">
              Place ID
            </label>
            <input
              id="field-google-place-id"
              type="text"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              placeholder="ChIJ..."
              className={`${inputClass} font-mono`}
            />
          </div>
          <div>
            <label htmlFor="field-google-api-key" className="block font-semibold text-[#121418] mb-1">
              Places API key
            </label>
            {conn?.api_key_source === "server" ? (
              <p className="py-2 text-[#217A4B] font-semibold">Set on the server (GOOGLE_PLACES_API_KEY).</p>
            ) : (
              <>
                <input
                  id="field-google-api-key"
                  type="password"
                  autoComplete="off"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={conn?.has_api_key ? "Saved. Leave blank to keep it." : "AIza..."}
                  className={`${inputClass} font-mono`}
                />
                {conn?.api_key_source === "saved" && (
                  <button
                    type="button"
                    onClick={handleRemoveKey}
                    className="mt-1 text-red-700 font-semibold hover:underline cursor-pointer"
                  >
                    Remove saved key
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 font-semibold text-[#121418] cursor-pointer">
          <input
            type="checkbox"
            checked={showOnSite}
            onChange={(e) => setShowOnSite(e.target.checked)}
            className="w-4 h-4 accent-[#121418]"
          />
          Show rating and reviews on the homepage
        </label>
      </div>

      {notice && (
        <div
          role="status"
          className={`flex items-center gap-2 font-semibold ${notice.ok ? "text-[#217A4B]" : "text-red-700"}`}
        >
          {notice.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={saving || syncing}
        className="bg-[#121418] hover:bg-[#2A2F37] text-white px-8 py-3 rounded-md font-bold text-xs tracking-wide transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        <span>{saving ? "Saving..." : "Save review settings"}</span>
      </button>
    </form>
  );
}
