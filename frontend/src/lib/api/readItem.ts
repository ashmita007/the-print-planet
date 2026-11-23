/**
 * Single-item server reads (a product or category page).
 * A 404 means the item does not exist and returns null. Anything else, a timeout,
 * a 5xx or a dropped socket, is not "missing": it is retried once and then thrown
 * so the page shows the error boundary instead of a cached "not found" with noindex.
 */

export class ReadError extends Error {
  status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.name = "ReadError";
    this.status = status;
  }
}

type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

export async function fetchItem<T>(
  url: string,
  fetcher: Fetcher,
  init: RequestInit = {},
  retryDelayMs = 300
): Promise<T | null> {
  let failure: ReadError | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    try {
      // The retry skips the data cache so it cannot be served the failed response again.
      const res = await fetcher(url, attempt === 0 ? init : { cache: "no-store" });
      if (res.status === 404) return null;
      if (res.ok) return (await res.json()) as T;
      failure = new ReadError(`Read failed with status ${res.status}: ${url}`, res.status);
    } catch (err) {
      failure = new ReadError(`Read failed: ${err instanceof Error ? err.message : String(err)}`, null);
    }
  }
  throw failure;
}

/** How an API status answers "does this item exist?": 404 is no, 2xx is yes, anything else is unknown. */
export function classifyStatus(status: number): "exists" | "missing" | "unavailable" {
  if (status === 404) return "missing";
  return status >= 200 && status < 300 ? "exists" : "unavailable";
}
