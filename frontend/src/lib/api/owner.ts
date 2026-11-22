import type {
  ProductSavePayload,
  ImportValidationResult,
  ImportExecutionResult,
  Category,
  Product,
  Enquiry,
  SiteSettings,
  PaginatedResponse,
  AuthUser,
  DashboardMetrics,
  BulkOrder,
  BulkOrderMessage,
  EmailDiagnostics,
  OwnerGoogleReviews,
  PaymentGatewaySummary,
  OwnerPaymentRow,
} from '../types';
import {
  getApiUrl,
  errorMessage,
  setOwnerToken,
  clearOwnerToken,
  getAuthHeaders,
} from './core';

export async function ownerGetGoogleReviews(): Promise<OwnerGoogleReviews | null> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/google-reviews/`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function ownerSaveGoogleReviews(
  data: Partial<Pick<OwnerGoogleReviews, 'review_url' | 'maps_url' | 'place_id' | 'show_on_site'>> & { places_api_key?: string }
): Promise<{ success: boolean; data?: OwnerGoogleReviews; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/google-reviews/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: body.error || body.detail || 'Could not save Google review settings' };
    return { success: true, data: body };
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) || 'Network error' };
  }
}

export async function ownerSyncGoogleReviews(): Promise<{ success: boolean; message: string; data?: OwnerGoogleReviews }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/google-reviews/sync/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const body = await res.json().catch(() => ({}));
    return { success: res.ok && !!body.ok, message: body.message || body.detail || 'Sync failed', data: body.connection };
  } catch (err: unknown) {
    return { success: false, message: errorMessage(err) || 'Network error' };
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
      setOwnerToken(data.token);
      localStorage.setItem('owner_user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('authChange'));
    }
    return { success: true, token: data.token, user: data.user };
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) || 'Connection error' };
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
      clearOwnerToken();
      localStorage.removeItem('owner_user');
      window.dispatchEvent(new Event('authChange'));
    }
  }
}

/** Returns null when the token is rejected, undefined when the check itself failed. */
export async function ownerGetMe(): Promise<AuthUser | null | undefined> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/auth/me/`, {
      headers: { ...getAuthHeaders() },
    });
    if (res.status === 401 || res.status === 403) return null;
    if (!res.ok) return undefined;
    return await res.json();
  } catch {
    return undefined;
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

export async function ownerSaveProduct(id: number | null, data: ProductSavePayload): Promise<{ success: boolean; data?: Product; error?: string }> {
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
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) };
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
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) };
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
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) };
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
  data?: ImportValidationResult;
  error?: string;
}> {
  try {
    let body: FormData | string;
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
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function ownerExecuteBulkImport(rows: Record<string, unknown>[], strategy: 'skip' | 'update'): Promise<{
  success: boolean;
  data?: ImportExecutionResult;
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
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) };
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
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) };
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
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function ownerGetEmailDiagnostics(): Promise<{ success: boolean; data?: EmailDiagnostics; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/email/diagnostics/`, {
      headers: { ...getAuthHeaders() },
      cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to read email diagnostics' };
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) };
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
  } catch (err: unknown) {
    return { ok: false, error: errorMessage(err) };
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
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) };
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
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) };
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
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function ownerDownloadConversationsBackup(): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/backup/conversations/`, {
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
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function ownerGetBulkOrders(params?: {
  page?: number;
  search?: string;
  status?: string;
  org_type?: string;
}): Promise<{
  count: number;
  results: BulkOrder[];
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

export async function ownerGetBulkOrderDetail(idOrNumber: string | number): Promise<BulkOrder | null> {
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
): Promise<{ success: boolean; data?: BulkOrderMessage; error?: string }> {
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
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) || 'Network failure' };
  }
}

export async function ownerUpdateBulkOrder(
  idOrNumber: string | number,
  data: Partial<BulkOrder>
): Promise<{ success: boolean; data?: BulkOrder; error?: string }> {
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
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) || 'Network failure' };
  }
}


// ---------------------------------------------------------------------------
// Owner: online payments (Razorpay)
// ---------------------------------------------------------------------------

const PAYMENT_SETTINGS_URL = () => `${getApiUrl()}/api/v1/owner/payment-settings/`;

export async function ownerGetPaymentSettings(): Promise<PaymentGatewaySummary | null> {
  try {
    const res = await fetch(PAYMENT_SETTINGS_URL(), { headers: getAuthHeaders(), cache: 'no-store' });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function ownerSavePaymentSettings(data: {
  key_id?: string;
  key_secret?: string;
  webhook_secret?: string;
  enabled?: boolean;
  clear_secrets?: boolean;
}): Promise<{ settings?: PaymentGatewaySummary; error?: string }> {
  try {
    const res = await fetch(PAYMENT_SETTINGS_URL(), {
      method: 'PUT',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    return res.ok ? { settings: body } : { error: body.error || 'Could not save the settings.' };
  } catch {
    return { error: 'Could not reach the server.' };
  }
}

export async function ownerTestPaymentKeys(data: { key_id?: string; key_secret?: string }): Promise<{ ok: boolean; mode?: string; error?: string }> {
  try {
    const res = await fetch(`${PAYMENT_SETTINGS_URL()}test/`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { ok: false, error: 'Could not reach the server.' };
  }
}

export async function ownerGetPayments(page = 1): Promise<{ results: OwnerPaymentRow[]; count: number } | null> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/owner/payments/?page=${page}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

