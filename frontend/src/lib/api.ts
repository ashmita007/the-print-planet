import {
  Category,
  Product,
  ProductImage,
  Enquiry,
  SiteSettings,
  HomePageSection,
  PaginatedResponse,
  AuthUser,
  DashboardMetrics,
} from './types';

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

// Helper for fetch with abort timeout and automatic retry on cold boot / socket reset
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> => {
  const maxRetries = typeof window === 'undefined' ? 3 : 1;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        ...options,
        signal: options.signal || controller.signal,
      });
      return res;
    } catch (err: any) {
      lastError = err;
      const isRecoverableError =
        err?.code === 'UND_ERR_SOCKET' ||
        err?.cause?.code === 'UND_ERR_SOCKET' ||
        err?.name === 'AbortError' ||
        (err?.message && (err.message.includes('fetch failed') || err.message.includes('other side closed') || err.message.includes('ECONNREFUSED')));

      if (attempt < maxRetries && isRecoverableError && typeof window === 'undefined') {
        const delayMs = attempt * 1200;
        console.warn(`[fetchWithTimeout] Attempt ${attempt} failed on ${url} (${err?.cause?.code || err?.message}). Retrying in ${delayMs}ms...`);
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

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('owner_token');
    if (token) {
      return { Authorization: `Token ${token}` };
    }
  }
  return {};
};

// ==========================================
// PUBLIC API CALLS
// ==========================================

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/categories/`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('getCategories error:', err);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/categories/${slug}/`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`getCategoryBySlug(${slug}) error:`, err);
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
    const res = await fetchWithTimeout(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('getProducts error:', err);
    return { count: 0, next: null, previous: null, results: [] };
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/products/${slug}/`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`getProductBySlug(${slug}) error:`, err);
    return null;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/products/featured/`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('getFeaturedProducts error:', err);
    return [];
  }
}

export async function globalSearch(q: string): Promise<{ products: Product[]; categories: Category[] }> {
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/search/?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
    if (!res.ok) return { products: [], categories: [] };
    return await res.json();
  } catch (err) {
    console.error('globalSearch error:', err);
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
}): Promise<{ success: boolean; data?: any; error?: string }> {
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
      formData.append('attachment', payload.attachment);
      if (payload.attachment_url) formData.append('attachment_url', payload.attachment_url);

      res = await fetch(`${getApiUrl()}/api/v1/enquiries/`, {
        method: 'POST',
        body: formData,
      });
    } else {
      res = await fetch(`${getApiUrl()}/api/v1/enquiries/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    const data = await res.json();
    if (!res.ok) {
      const msg = typeof data === 'object' ? Object.values(data).flat().join(', ') : 'Submission failed';
      return { success: false, error: msg };
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
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

export async function getHomePageSections(): Promise<HomePageSection[]> {
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/homepage-sections/`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

// ==========================================
// OWNER AUTH & DASHBOARD APIS
// ==========================================

export async function ownerLogin(username: string, password: string): Promise<{ success: boolean; token?: string; user?: AuthUser; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Login failed' };
    }
    if (typeof window !== 'undefined' && data.token) {
      localStorage.setItem('owner_token', data.token);
      localStorage.setItem('owner_user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('authChange'));
    }
    return { success: true, token: data.token, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
}

export async function ownerLogout(): Promise<void> {
  try {
    await fetch(`${getApiUrl()}/api/v1/auth/logout/`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
    });
  } catch (e) {
    // Ignore error
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('owner_token');
      localStorage.removeItem('owner_user');
      window.dispatchEvent(new Event('authChange'));
    }
  }
}

export async function ownerGetMe(): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/auth/me/`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function ownerGetDashboardStats(): Promise<{
  metrics: DashboardMetrics;
  recent_enquiries: Enquiry[];
  recent_products: Product[];
} | null> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/stats/`, {
      headers: { ...getAuthHeaders() },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function ownerGetProducts(params?: {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<Product>> {
  try {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.category) q.set('category', params.category);
    if (params?.status) q.set('status', params.status);
    if (params?.page) q.set('page', params.page.toString());
    if (params?.page_size) q.set('page_size', params.page_size.toString());
    const res = await fetch(`${getApiUrl()}/api/v1/owner/products/?${q.toString()}`, {
      headers: { ...getAuthHeaders() },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch {
    return { count: 0, next: null, previous: null, results: [] };
  }
}

export async function ownerToggleProductStatus(id: number, isActive: boolean): Promise<boolean> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/products/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ is_active: isActive }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function ownerGetProduct(id: number): Promise<Product | null> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/products/${id}/`, {
      headers: { ...getAuthHeaders() },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function ownerSaveProduct(id: number | null, data: Partial<Product>): Promise<{ success: boolean; data?: Product; error?: string }> {
  try {
    const isEdit = id !== null;
    const url = isEdit ? `${getApiUrl()}/api/v1/owner/products/${id}/` : `${getApiUrl()}/api/v1/owner/products/`;
    const res = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) {
      return { success: false, error: JSON.stringify(resData) };
    }
    return { success: true, data: resData };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function ownerDeleteProduct(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/products/${id}/`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return res.status === 204;
  } catch {
    return false;
  }
}

export async function ownerUploadImage(file: File): Promise<{ success: boolean; secure_url?: string; public_id?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${getApiUrl()}/api/v1/owner/images/upload/`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Upload failed' };
    return { success: true, secure_url: data.secure_url, public_id: data.public_id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function ownerGetCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/categories/`, {
      headers: { ...getAuthHeaders() },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function ownerSaveCategory(id: number | null, data: Partial<Category>): Promise<{ success: boolean; data?: Category; error?: string }> {
  try {
    const isEdit = id !== null;
    const url = isEdit ? `${getApiUrl()}/api/v1/owner/categories/${id}/` : `${getApiUrl()}/api/v1/owner/categories/`;
    const res = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) return { success: false, error: JSON.stringify(resData) };
    return { success: true, data: resData };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function ownerDeleteCategory(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/categories/${id}/`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return res.status === 204;
  } catch {
    return false;
  }
}

export async function ownerGetEnquiries(params?: {
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<Enquiry>> {
  try {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    if (params?.page) q.set('page', params.page.toString());
    if (params?.page_size) q.set('page_size', params.page_size.toString());
    const res = await fetch(`${getApiUrl()}/api/v1/owner/enquiries/?${q.toString()}`, {
      headers: { ...getAuthHeaders() },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch {
    return { count: 0, next: null, previous: null, results: [] };
  }
}

export async function ownerUpdateEnquiry(id: number, data: { status?: string; admin_notes?: string }): Promise<boolean> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/enquiries/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function ownerValidateBulkImport(fileOrJson: File | string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    let body: any;
    const headers: Record<string, string> = { ...getAuthHeaders() };

    if (fileOrJson instanceof File) {
      body = new FormData();
      body.append('file', fileOrJson);
    } else {
      headers['Content-Type'] = 'application/json';
      body = fileOrJson;
    }

    const res = await fetch(`${getApiUrl()}/api/v1/owner/import/validate/`, {
      method: 'POST',
      headers,
      body,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Validation failed' };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function ownerExecuteBulkImport(rows: any[], strategy: 'skip' | 'update'): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/import/execute/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ rows, strategy }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Execution failed' };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function ownerUpdateSettings(data: Partial<SiteSettings>): Promise<{ success: boolean; data?: SiteSettings; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/site-settings/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) {
      const errorMsg =
        resData.error ||
        resData.detail ||
        (typeof resData === 'object' ? Object.values(resData).flat().join(', ') : 'Failed to update settings');
      return { success: false, error: errorMsg };
    }
    return { success: true, data: resData };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function ownerTriggerDatabaseBackupEmail(recipient?: string): Promise<{
  success: boolean;
  message?: string;
  recipient?: string;
  filename?: string;
  file_size_kb?: number;
  error?: string;
}> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/backup/email/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(recipient ? { recipient } : {}),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to email database backup' };
    return { success: true, ...data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function ownerGetEmailDiagnostics(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/email/diagnostics/`, {
      headers: { ...getAuthHeaders() },
      cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to read email diagnostics' };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function ownerSendTestEmail(to?: string): Promise<{
  ok: boolean;
  provider?: string;
  message?: string;
  error?: string;
  sender?: string;
  recipient?: string;
  status?: number;
  code?: string;
  message_id?: string;
}> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/email/diagnostics/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(to ? { to } : {}),
    });
    const data = await res.json();
    return { ...data, ok: res.ok && data.ok !== false };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function ownerDownloadDatabaseBackup(): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/backup/download/`, {
      method: 'GET',
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) return { success: false, error: 'Failed to download database backup' };
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `The_Print_Planet_DB_Backup_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function ownerDownloadCatalogExcel(): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/export/excel/`, {
      method: 'GET',
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) return { success: false, error: 'Failed to export catalogue' };
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'The_Print_Planet_Catalogue_and_Images.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function ownerSyncCloudDatabase(action: 'backup' | 'restore' = 'backup'): Promise<{
  success: boolean;
  message?: string;
  size_kb?: number;
  error?: string;
}> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/backup/cloud/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to cloud sync database' };
    return { success: true, ...data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// CLIENT PORTAL & BULK ORDERS API CALLS
// ==========================================

export const getClientAuthHeaders = (): Record<string, string> => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('client_token') || localStorage.getItem('owner_token');
    if (token) {
      return { Authorization: `Token ${token}` };
    }
  }
  return {};
};

export async function clientRegister(data: {
  full_name: string;
  company_name?: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) {
      return { success: false, error: resData.error || Object.values(resData)[0] as string || 'Registration failed' };
    }
    if (typeof window !== 'undefined' && resData.token) {
      localStorage.setItem('client_token', resData.token);
      localStorage.setItem('client_user', JSON.stringify(resData.user));
      window.dispatchEvent(new Event('authChange'));
    }
    return { success: true, token: resData.token, user: resData.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Registration network failed' };
  }
}

export async function clientLogin(data: {
  username: string;
  password: string;
}): Promise<{ success: boolean; token?: string; role?: string; user?: any; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) {
      return { success: false, error: resData.error || 'Invalid credentials' };
    }
    if (typeof window !== 'undefined' && resData.token) {
      if (resData.role === 'owner') {
        localStorage.setItem('owner_token', resData.token);
        localStorage.setItem('owner_user', JSON.stringify(resData.user));
      } else {
        localStorage.setItem('client_token', resData.token);
        localStorage.setItem('client_user', JSON.stringify(resData.user));
      }
      window.dispatchEvent(new Event('authChange'));
    }
    return { success: true, token: resData.token, role: resData.role, user: resData.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Login network failed' };
  }
}

export async function clientSubmitBulkOrder(formData: FormData): Promise<{
  success: boolean;
  order_number?: string;
  token?: string;
  order?: any;
  error?: string;
  requires_login?: boolean;
}> {
  try {
    const headers = getClientAuthHeaders();
    const res = await fetch(`${getApiUrl()}/api/v1/bulk-orders/submit/`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || (typeof data === 'object' ? Object.values(data)[0] : 'Submission failed') as string,
        requires_login: data.requires_login,
      };
    }
    if (typeof window !== 'undefined' && data.token) {
      localStorage.setItem('client_token', data.token);
      if (data.order?.user) {
        localStorage.setItem('client_user', JSON.stringify(data.order.user));
      }
      window.dispatchEvent(new Event('authChange'));
    }
    return { success: true, ...data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit bulk order.' };
  }
}

export async function clientGetBulkOrders(): Promise<{
  results: any[];
  count: number;
  summary_metrics?: any;
  error?: string;
}> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/bulk-orders/my-orders/`, {
      headers: getClientAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      return { results: [], count: 0, error: 'Unauthorized or failed to fetch orders.' };
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { results: [], count: 0, error: err.message };
  }
}

export async function clientGetBulkOrderDetail(orderNumber: string): Promise<any | null> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/bulk-orders/my-orders/${orderNumber}/`, {
      headers: getClientAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function clientPostBulkOrderMessage(orderNumber: string, message: string, file?: File): Promise<{
  success: boolean;
  message?: any;
  error?: string;
}> {
  try {
    const formData = new FormData();
    formData.append('message', message);
    if (file) {
      formData.append('attachment', file);
    }
    const res = await fetch(`${getApiUrl()}/api/v1/bulk-orders/my-orders/${orderNumber}/messages/`, {
      method: 'POST',
      headers: getClientAuthHeaders(),
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to send message.' };
    return { success: true, message: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function clientLogout(): Promise<void> {
  try {
    const token = localStorage.getItem('client_token') || localStorage.getItem('owner_token');
    if (token) {
      await fetch(`${getApiUrl()}/api/v1/auth/logout/`, {
        method: 'POST',
        headers: { Authorization: `Token ${token}` },
      });
    }
  } catch {}
  if (typeof window !== 'undefined') {
    localStorage.removeItem('client_token');
    localStorage.removeItem('client_user');
    window.dispatchEvent(new Event('authChange'));
  }
}

export async function requestForgotPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/auth/forgot-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to submit password reset request.' };
    return { success: true, message: data.message };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network failed.' };
  }
}

export async function confirmPasswordReset(data: {
  uid: string;
  token: string;
  new_password: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/auth/reset-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) return { success: false, error: resData.error || 'Failed to reset password.' };
    return { success: true, message: resData.message };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network failed.' };
  }
}

export async function trackUserCheckedProduct(productId: number): Promise<void> {
  try {
    const headers = getClientAuthHeaders();
    if (!headers.Authorization) return;
    await fetch(`${getApiUrl()}/api/v1/bulk-orders/track-checked-product/${productId}/`, {
      method: 'POST',
      headers,
    });
  } catch {}
}

export async function clientGetCheckedProducts(): Promise<{ results: any[]; count: number }> {
  try {
    const headers = getClientAuthHeaders();
    if (!headers.Authorization) return { results: [], count: 0 };
    const res = await fetch(`${getApiUrl()}/api/v1/bulk-orders/checked-products/`, {
      headers,
      cache: 'no-store',
    });
    if (!res.ok) return { results: [], count: 0 };
    return await res.json();
  } catch {
    return { results: [], count: 0 };
  }
}

export async function ownerDownloadConversationsBackup(): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/bulk-orders/owner/backup/download/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return { success: false, error: 'Failed to download conversations backup' };
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `The_Print_Planet_Conversations_Backup_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function ownerGetBulkOrders(params?: {
  page?: number;
  search?: string;
  status?: string;
  org_type?: string;
}): Promise<{
  count: number;
  results: any[];
  next?: string;
  previous?: string;
}> {
  try {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', params.page.toString());
    if (params?.search) sp.set('search', params.search);
    if (params?.status && params.status !== 'all') sp.set('status', params.status);
    if (params?.org_type && params.org_type !== 'all') sp.set('org_type', params.org_type);

    const query = sp.toString() ? `?${sp.toString()}` : '';
    const res = await fetch(`${getApiUrl()}/api/v1/owner/bulk-orders/${query}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return { count: 0, results: [] };
    return await res.json();
  } catch {
    return { count: 0, results: [] };
  }
}

export async function ownerGetBulkOrderDetail(idOrNumber: string | number): Promise<any | null> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/bulk-orders/${idOrNumber}/`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function ownerReplyBulkOrder(
  idOrNumber: string | number,
  data: {
    message: string;
    status?: string;
    quoted_amount?: number | string;
    tracking_courier_partner?: string;
    tracking_consignment_number?: string;
    attachment_url?: string;
  }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/bulk-orders/${idOrNumber}/messages/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) return { success: false, error: resData.error || 'Failed to submit reply' };
    return { success: true, data: resData };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network failure' };
  }
}

export async function ownerUpdateBulkOrder(
  idOrNumber: string | number,
  data: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/bulk-orders/${idOrNumber}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) return { success: false, error: resData.error || 'Failed to update order' };
    return { success: true, data: resData };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network failure' };
  }
}

