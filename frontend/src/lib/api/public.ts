import type {
  Category,
  Product,
  SiteSettings,
  HomePageSection,
  PaginatedResponse,
  PublicGoogleReviews,
} from '../types';
import {
  getApiUrl,
  CATALOGUE_READ,
  fetchWithTimeout,
  errorMessage,
  getClientAuthHeaders,
  logReadError,
} from './core';

// ==========================================
// PUBLIC API CALLS
// ==========================================

export async function getCategories(params?: { hide_empty?: boolean; ordering?: string }): Promise<Category[]> {
  try {
    const query = new URLSearchParams();
    if (params?.hide_empty !== false) {
      query.set('hide_empty', 'true');
    }
    if (params?.ordering) {
      query.set('ordering', params.ordering);
    } else {
      query.set('ordering', 'count');
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/categories/${qs}`, CATALOGUE_READ);
    if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
    return await res.json();
  } catch (err) {
    logReadError('getCategories', err);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/categories/${slug}/`, CATALOGUE_READ);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    logReadError('getCategoryBySlug', err);
    return null;
  }
}

export async function getProducts(params?: {
  category?: string;
  search?: string;
  material?: string;
  color?: string;
  featured?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<Product>> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.material) query.set('material', params.material);
    if (params?.color) query.set('color', params.color);
    if (params?.featured) query.set('featured', 'true');
    if (params?.ordering) query.set('ordering', params.ordering);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.page_size) query.set('page_size', params.page_size.toString());

    const url = `${getApiUrl()}/api/v1/products/?${query.toString()}`;
    const res = await fetchWithTimeout(url, CATALOGUE_READ);
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
    return await res.json();
  } catch (err) {
    logReadError('getProducts', err);
    return { count: 0, next: null, previous: null, results: [] };
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/products/${slug}/`, CATALOGUE_READ);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    logReadError('getProductBySlug', err);
    return null;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/products/featured/`, CATALOGUE_READ);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    logReadError('getFeaturedProducts', err);
    return [];
  }
}

export async function globalSearch(q: string): Promise<{ products: Product[]; categories: Category[] }> {
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/search/?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
    if (!res.ok) return { products: [], categories: [] };
    return await res.json();
  } catch (err) {
    logReadError('globalSearch', err);
    return { products: [], categories: [] };
  }
}

export async function submitEnquiry(payload: {
  full_name: string;
  company_name?: string;
  email: string;
  phone: string;
  product?: number | null;
  product_name_text?: string;
  requested_quantity?: number | null;
  message: string;
  attachment?: File | null;
  attachment_url?: string;
  source_page?: string;
  lead_source?: string;
  landing_page?: string;
  referrer?: string;
}): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  // Attach where the buyer first came from (stored by LeadTracker) to every enquiry form.
  if (typeof window !== 'undefined' && !payload.lead_source) {
    try {
      const raw = localStorage.getItem('tpp_attr');
      const a = raw ? JSON.parse(raw) : null;
      if (a && Date.now() - a.ts < 30 * 864e5) {
        payload = { ...payload, lead_source: a.lead_source, landing_page: a.landing_page, referrer: a.referrer };
      }
    } catch {
      /* no attribution available */
    }
  }
  try {
    let res: Response;
    if (payload.attachment) {
      const formData = new FormData();
      formData.append('full_name', payload.full_name);
      if (payload.company_name) formData.append('company_name', payload.company_name);
      formData.append('email', payload.email);
      formData.append('phone', payload.phone);
      if (payload.product) formData.append('product', payload.product.toString());
      if (payload.product_name_text) formData.append('product_name_text', payload.product_name_text);
      if (payload.requested_quantity) formData.append('requested_quantity', payload.requested_quantity.toString());
      formData.append('message', payload.message);
      if (payload.source_page) formData.append('source_page', payload.source_page);
      if (payload.lead_source) formData.append('lead_source', payload.lead_source);
      if (payload.landing_page) formData.append('landing_page', payload.landing_page);
      if (payload.referrer) formData.append('referrer', payload.referrer);
      formData.append('attachment', payload.attachment);
      if (payload.attachment_url) formData.append('attachment_url', payload.attachment_url);

      const authHeaders = getClientAuthHeaders();
      res = await fetch(`${getApiUrl()}/api/v1/enquiries/`, {
        method: 'POST',
        headers: authHeaders.Authorization ? { Authorization: authHeaders.Authorization } : undefined,
        body: formData,
      });
    } else {
      const authHeaders = getClientAuthHeaders();
      res = await fetch(`${getApiUrl()}/api/v1/enquiries/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeaders.Authorization ? { Authorization: authHeaders.Authorization } : {}),
        },
        body: JSON.stringify(payload),
      });
    }

    const data = await res.json();
    if (!res.ok) {
      const msg = typeof data === 'object' ? Object.values(data).flat().join(', ') : 'Submission failed';
      return { success: false, error: msg };
    }
    if (typeof window !== 'undefined') {
      const w = window as unknown as { gtag?: (...a: unknown[]) => void; clarity?: (...a: unknown[]) => void };
      const params = {
        method: 'form',
        lead_source: payload.lead_source || 'direct',
        page_path: window.location.pathname,
        product: payload.product_name_text || undefined,
        quantity: payload.requested_quantity || undefined,
      };
      try {
        w.gtag?.('event', 'generate_lead', params);
        w.gtag?.('event', 'lead_form', params);
        w.clarity?.('event', 'lead_form');
      } catch {
        /* analytics must never block an enquiry */
      }
    }
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) || 'Network error' };
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const fallback: SiteSettings = {
    id: 1,
    business_name: 'THE PRINT PLANET',
    tagline: 'Specialist in PVC Cards | Lens Packaging & Cleaning | Commercial Printing | Bulk ID Solutions',
    logo_url: null,
    favicon_url: null,
    email: 'theprintplanet01@gmail.com',
    phone: '+91 97418 08034',
    whatsapp: '+91 97418 08034',
    address: 'No. 33, 34, Srigandhadakaval, Byraveshwaranagar, Near Hanumanthnagar, Sunkadakatte, Bangalore - 560091, Karnataka, India',
    gst_number: '29AAQFT3909B1ZZ',
    hero_badge: "The Print Planet™ • Specialist in PVC Cards & ID Systems",
    hero_title: 'The Print Planet — Factory Direct',
    hero_subtitle: 'Specialist in PVC Cards, Lens Packaging & Commercial Printing Solutions',
    hero_caption: "Official portal of The Print Planet (theprintplanet.co.in) — India's verified specialist in PVC cards, CR-80 fusing sheets, lens packaging & cleaning supplies, rigid ID card holders, satin lanyard rolls, commercial printing, and industrial card die-cutting machinery with 24–48h pan-India dispatch from Sunkadakatte, Bangalore.",
    about_data: {},
    social_links: {},
    footer_text: 'THE PRINT PLANET — Specialist in PVC Cards | Lens Packaging & Cleaning | Commercial Printing | Bulk ID Solutions. ✱ Your Vision is Our Focus ✱. GSTIN: 29AAQFT3909B1ZZ | PAN: AAQFT3909B.',
    seo_defaults: {},
    updated_at: new Date().toISOString(),
  };

  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/site-settings/`, { cache: 'no-store' });
    if (!res.ok) return fallback;
    return await res.json();
  } catch (err) {
    return fallback;
  }
}

/** Real Google rating and reviews, cached by the backend. Null when the backend is unreachable. */
export async function getGoogleReviews(): Promise<PublicGoogleReviews | null> {
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/google-reviews/`, CATALOGUE_READ, 12000);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getHomePageSections(): Promise<HomePageSection[]> {
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/homepage-sections/`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

