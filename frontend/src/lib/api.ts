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

// Helper for fetch with abort timeout to guarantee page never hangs
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 6000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
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
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/categories/`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('getCategories error:', err);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/categories/${slug}/`, { next: { revalidate: 60 } });
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
    const res = await fetchWithTimeout(url, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('getProducts error:', err);
    return { count: 0, next: null, previous: null, results: [] };
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/products/${slug}/`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`getProductBySlug(${slug}) error:`, err);
    return null;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/products/featured/`, { next: { revalidate: 60 } });
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
  source_page?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/enquiries/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
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
    tagline: 'Delivering Excellence in PVC Cards | Lens Packaging | Commercial Printing Solutions',
    logo_url: null,
    favicon_url: null,
    email: 'theprintplanet01@gmail.com',
    phone: '+91 97418 08034',
    whatsapp: '+91 97418 08034',
    address: 'No.17, Ground Floor, 7th Main, 13th Cross Rd, Agrahara Dasarahalli, Rajajinagar Industrial Town, Bengaluru (Bangalore) Urban, Bengaluru - 560079, Karnataka, India',
    gst_number: '29AAQFT3909B1ZZ',
    social_links: {},
    footer_text: 'THE PRINT PLANET - Delivering Excellence in PVC Cards | Lens Packaging | Commercial Printing Solutions. ✱ Your Vision is Our Focus ✱. GSTIN: 29AAQFT3909B1ZZ | PAN: AAQFT3909B.',
    seo_defaults: {},
    updated_at: new Date().toISOString(),
  };

  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/site-settings/`, { next: { revalidate: 120 } });
    if (!res.ok) return fallback;
    return await res.json();
  } catch (err) {
    return fallback;
  }
}

export async function getHomePageSections(): Promise<HomePageSection[]> {
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/v1/homepage-sections/`, { next: { revalidate: 60 } });
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
    if (!res.ok) return { success: false, error: JSON.stringify(resData) };
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

