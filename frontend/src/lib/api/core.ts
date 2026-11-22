export const getApiUrl = (): string => {
  let url = '';
  if (typeof window === 'undefined') {
    // Server-side inside Docker or Node (use 127.0.0.1 to avoid macOS IPv6 delay)
    url = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  } else if (process.env.NEXT_PUBLIC_API_URL) {
    // Client-side in browser
    url = process.env.NEXT_PUBLIC_API_URL;
  } else if (window.location && window.location.port === '3000') {
    // If running on dev port 3000, default to backend port 8000
    url = 'http://127.0.0.1:8000';
  }

  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url.replace(/\/$/, '');
};

// Catalogue reads are shared between visitors for a minute on the server, which keeps
// pages fast for buyers and crawlers. The browser and owner screens always read fresh.
export const CATALOGUE_READ: RequestInit =
  typeof window === 'undefined' ? ({ next: { revalidate: 60 } } as RequestInit) : { cache: 'no-store' };

// Helper for fetch with abort timeout and automatic retry on cold boot / socket reset
export const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> => {
  const maxRetries = typeof window === 'undefined' ? 3 : 1;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        ...options,
        signal: options.signal || controller.signal,
      });
      return res;
    } catch (err: unknown) {
      lastError = err;
      const e = err as { code?: string; cause?: { code?: string }; name?: string; message?: string } | null;
      const isRecoverableError =
        e?.code === 'UND_ERR_SOCKET' ||
        e?.cause?.code === 'UND_ERR_SOCKET' ||
        e?.name === 'AbortError' ||
        (e?.message && (e.message.includes('fetch failed') || e.message.includes('other side closed') || e.message.includes('ECONNREFUSED')));

      if (attempt < maxRetries && isRecoverableError && typeof window === 'undefined') {
        const delayMs = attempt * 1200;
        console.warn(`[fetchWithTimeout] Attempt ${attempt} failed on ${url} (${e?.cause?.code || e?.message}). Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  throw lastError;
};

export const errorMessage = (err: unknown): string | undefined => (err instanceof Error ? err.message : undefined);

export const getOwnerToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('owner_token');
};

export const setOwnerToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('owner_token', token);
};

export const clearOwnerToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('owner_token');
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getOwnerToken();
  return token ? { Authorization: `Token ${token}` } : {};
};


// The buyer portal has its own session, separate from the owner's: a client token
// only ever reaches the buyer endpoints, which the backend scopes to that account.
export const getClientAuthHeaders = (): Record<string, string> => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('client_token');
    if (token) {
      return { Authorization: `Token ${token}` };
    }
  }
  return {};
};


/** Fetch our API with the owner or buyer token attached. */
export const authedFetch = (
  url: string,
  options: RequestInit = {},
  as: 'owner' | 'client' = 'owner'
): Promise<Response> =>
  fetch(url, {
    ...options,
    headers: { ...(as === 'client' ? getClientAuthHeaders() : getAuthHeaders()), ...(options.headers as Record<string, string> | undefined) },
  });

const loggedReadErrors = new Set<string>();

/** Logs a public read failure once per label so a down backend does not flood the log. */
export const logReadError = (label: string, err: unknown): void => {
  if (loggedReadErrors.has(label)) return;
  loggedReadErrors.add(label);
  console.error(`${label} error:`, err);
};
