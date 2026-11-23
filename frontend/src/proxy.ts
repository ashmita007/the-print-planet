import { NextResponse, type NextRequest } from "next/server";
import { getGuide } from "@/lib/guides";
import { classifyStatus } from "@/lib/api/readItem";

/**
 * Real 404 status for product, category and guide URLs that do not exist.
 *
 * Every public page streams behind a loading.tsx, and once streaming starts the
 * status is already 200, so notFound() inside the page only adds a noindex tag
 * (a "soft 404" to Google). Checking here runs before rendering, so a missing
 * slug is rewritten to an unmatched path and the root not-found page answers 404.
 * If the API cannot answer (5xx, timeout, network) we reply 503 with Retry-After instead of guessing.
 */

const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { exists: boolean; at: number }>();
// Same characters Django's SlugField accepts; some catalogue slugs contain "_".
const SLUG = /^[A-Za-z0-9_-]{1,255}$/;

type Lookup = "exists" | "missing" | "unavailable";

async function lookup(kind: "products" | "categories", slug: string): Promise<Lookup> {
  const key = `${kind}/${slug}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.exists ? "exists" : "missing";
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(`${API}/api/v1/${kind}/${slug}/`, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(timer);
    const result = classifyStatus(res.status);
    if (result !== "unavailable") cache.set(key, { exists: result === "exists", at: Date.now() });
    return result;
  } catch {
    return "unavailable";
  }
}

/** The API is struggling: tell crawlers to come back, rather than call a real page missing or serve it half-empty. */
function unavailable() {
  const body =
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="robots" content="noindex"><title>Back in a moment | The Print Planet</title></head>' +
    '<body style="font-family:system-ui,sans-serif;color:#121418;text-align:center;padding:20vh 1rem 0">' +
    "<h1>Back in a moment</h1><p>Our catalogue is busy right now. Please try this page again in a minute.</p>" +
    '<p><a href="/" style="color:#F26B1D">Go to the home page</a></p></body></html>';
  return new NextResponse(body, {
    status: 503,
    headers: { "Content-Type": "text/html; charset=utf-8", "Retry-After": "120", "Cache-Control": "no-store" },
  });
}

function notFound(request: NextRequest) {
  // Clone nextUrl rather than new URL(path, request.url): behind Nginx the request URL says
  // https (X-Forwarded-Proto) while Node listens on plain http, and an origin mismatch turns
  // the rewrite into an external proxy call over TLS that fails with a 500.
  const url = request.nextUrl.clone();
  url.protocol = "http:"; // Node itself only speaks http; Nginx terminates TLS in front of it
  url.pathname = "/__not-found";
  url.search = "";
  return NextResponse.rewrite(url);
}

export async function proxy(request: NextRequest) {
  const [, section, slug, extra] = request.nextUrl.pathname.split("/");
  if (!slug || extra !== undefined) return NextResponse.next();
  if (!SLUG.test(slug)) return notFound(request);

  if (section === "guides") return getGuide(slug) ? NextResponse.next() : notFound(request);
  if (section === "products" || section === "categories") {
    const found = await lookup(section, slug);
    return found === "exists" ? NextResponse.next() : found === "missing" ? notFound(request) : unavailable();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/products/:slug", "/categories/:slug", "/guides/:slug"],
};
