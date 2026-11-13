import React from "react";
import { ExternalLink, PenLine, Star } from "lucide-react";
import ReviewCarousel, { Review } from "@/components/home/ReviewCarousel";
import { getGoogleReviews } from "@/lib/api";

/**
 * Real Google Business Profile reviews, synced by the backend from the Places API.
 * Renders nothing until the owner connects Google in Settings → Reviews, so the
 * homepage never shows invented reviews or ratings.
 */
export default async function GoogleReviews() {
  const data = await getGoogleReviews();
  if (!data) return null;

  const reviews: Review[] = (data.reviews || [])
    .filter((r) => r.text && r.text.trim())
    .map((r, i) => ({
      id: `${r.publish_time || "g"}-${i}`,
      author: r.author_name || "Google user",
      authorUrl: r.author_url || undefined,
      meta: r.relative_time ? `${r.relative_time} on Google` : "Google review",
      rating: Math.max(0, Math.min(5, Math.round(r.rating || 0))),
      text: r.text,
    }));

  const rating = data.rating != null ? Number(data.rating) : null;
  const count = data.review_count ?? 0;
  const readAllUrl = data.maps_url || data.review_url;

  // Nothing connected yet: stay hidden.
  if (!reviews.length && !data.review_url) return null;

  const writeReviewLink = data.review_url ? (
    <a
      href={data.review_url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-[#121418] hover:bg-[#2A2F37] text-white px-5 py-3 rounded-full text-sm font-bold transition-colors"
    >
      <PenLine className="w-4 h-4" aria-hidden="true" />
      Write a Google review
    </a>
  ) : null;

  // Review link saved but no reviews synced yet: a small ask instead of an empty carousel.
  if (!reviews.length) {
    return (
      <section aria-labelledby="reviews-heading" className="bg-[#EDF1F6] py-12 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h2 id="reviews-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#121418]">
              Bought from us?
            </h2>
            <p className="mt-2 text-[15px] text-[#2B323B] max-w-xl">
              A short Google review helps other print shops and institutes find a supplier they can trust.
            </p>
          </div>
          {writeReviewLink}
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="reviews-heading" className="bg-[#EDF1F6] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="reviews-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#121418]">
            What buyers say
          </h2>
          <p className="mt-2 text-xs text-[#353C45]">Reviews from Google, shown as Google returns them.</p>
        </div>
        {rating != null && count > 0 && (
          <a
            href={readAllUrl || undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-2 text-sm text-[#2B323B] hover:underline underline-offset-4"
          >
            <Star className="w-5 h-5 fill-[#F26B1D] text-[#F26B1D]" aria-hidden="true" />
            <span>
              <strong className="text-lg font-extrabold text-[#121418] tabular-nums">{rating.toFixed(1)}</strong>
              {" "}from {count.toLocaleString("en-IN")} Google {count === 1 ? "review" : "reviews"}
            </span>
          </a>
        )}
      </div>

      <ReviewCarousel reviews={reviews} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 flex flex-wrap items-center gap-3">
        {writeReviewLink}
        {readAllUrl && (
          <a
            href={readAllUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-[#121418]/30 text-[#121418] hover:bg-white px-5 py-3 rounded-full text-sm font-bold transition-colors"
          >
            Read all reviews on Google
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </section>
  );
}
