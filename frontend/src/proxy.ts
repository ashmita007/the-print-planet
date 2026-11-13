import { NextResponse, type NextRequest } from "next/server";
import { getGuide } from "@/lib/guides";

/**
 * Real 404 status for product, category and guide URLs that do not exist.
 *
 * Every public page streams behind a loading.tsx, and once streaming starts the
 * status is already 200, so notFound() inside the page only adds a noindex tag
 * (a "soft 404" to Google). Checking here runs before rendering, so a missing
 * slug is rewritten to an unmatched path and the root not-found page answers 404.
 * If the API cannot be reached we let the request through rather than hide a real page.
 */

const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { exists: boolean; at: number }>();
const SLUG = /^[a-z0-9][a-z0-9-]{0,200}$/;

async function exists(kind: "products" | "categories", slug: string): Promise<boolean> {
  const key = `${kind}/${slug}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.exists;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(`${API}/api/v1/${kind}/${slug}/`, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(timer);
    if (res.status === 404) {
      cache.set(key, { exists: false, at: Date.now() });
      return false;
    }
    if (res.ok) cache.set(key, { exists: true, at: Date.now() });
    return true; // 5xx or anything unexpected: do not 404 a page that may be real
  } catch {
    return true;
  }
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
    return (await exists(section, slug)) ? NextResponse.next() : notFound(request);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/products/:slug", "/categories/:slug", "/guides/:slug"],
};
