import { NextResponse } from "next/server";
import { buildPricingMarkdown } from "@/lib/pricingTariff";

// Generated from the live catalogue on each request (cached by the CDN), so the
// published prices always match the product pages. The DB is not reachable at build time.
export const dynamic = "force-dynamic";

export async function GET() {
  const content = await buildPricingMarkdown();
  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // AI assistants may read it; Google should rank /pricing instead of this raw file.
      "X-Robots-Tag": "noindex, follow",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
