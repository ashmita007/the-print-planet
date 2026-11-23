import type {
  Product,
  BulkOrder,
  BulkOrderMessage,
  BulkOrderSummaryMetrics,
  CheckedProduct,
  ClientProfile,
  RegisterResult,
  QuoteCheckout,
} from '../types';
import {
  getApiUrl,
  errorMessage,
  setOwnerToken,
  getAuthHeaders,
  getClientAuthHeaders,
} from './core';

// ==========================================
// CLIENT PORTAL & BULK ORDERS API CALLS
// ==========================================

export function clearClientSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('client_token');
  localStorage.removeItem('client_user');
  window.dispatchEvent(new Event('authChange'));
}

/** Only same-site paths are allowed as post-login destinations. */
export function safeRedirectPath(value: string | null | undefined, fallback = '/orders'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
  return value;
}

/**
 * Confirms the stored buyer token with the server.
 * Returns the profile, null when signed out or the token was rejected (it is then cleared),
 * or undefined when the server could not be reached (the session is kept).
 */
export async function clientVerifySession(): Promise<ClientProfile | null | undefined> {
  const headers = getClientAuthHeaders();
  if (!headers.Authorization) return null;
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/auth/me/`, { headers, cache: 'no-store' });
    if (res.status === 401 || res.status === 403) {
      clearClientSession();
      return null;
    }
    if (!res.ok) return undefined;
    const me = await res.json();
    if (me.role === 'owner') {
      // Owner tokens belong in the owner console, not the buyer portal.
      clearClientSession();
      return null;
    }
    const profile: ClientProfile = {
      id: me.id, username: me.username, email: me.email, first_name: me.first_name, last_name: me.last_name,
    };
    localStorage.setItem('client_user', JSON.stringify(profile));
    return profile;
  } catch {
    return undefined;
  }
}

/** Downloads a protected attachment with the caller's token, since a plain link cannot send it. */
export async function downloadProtectedFile(url: string, as: 'client' | 'owner' = 'client'): Promise<{ success: boolean; error?: string }> {
  const headers = as === 'owner' ? getAuthHeaders() : getClientAuthHeaders();
  try {
    const target = url.startsWith('/') ? `${getApiUrl()}${url}` : url;
    const res = await fetch(target, { headers, cache: 'no-store' });
    if (!res.ok) return { success: false, error: res.status === 404 ? 'File not found.' : 'You are not allowed to open this file.' };
    const disposition = res.headers.get('Content-Disposition') || '';
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
    const filename = match ? decodeURIComponent(match[1]) : url.split('/').filter(Boolean).pop() || 'attachment';
    const blobUrl = URL.createObjectURL(await res.blob());
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) || 'Download failed.' };
  }
}

function storeClientSession(token: string, user: ClientProfile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('client_token', token);
  localStorage.setItem('client_user', JSON.stringify(user));
  window.dispatchEvent(new Event('authChange'));
}

/** Creates an unverified account; the buyer then enters the 6-digit code from their email. */
export async function clientRegister(data: {
  full_name: string;
  company_name?: string;
  email: string;
  phone: string;
  password: string;
}): Promise<RegisterResult> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) {
      return {
        success: false,
        verificationRequired: Boolean(resData.verification_required),
        email: resData.email,
        error: resData.error || (Object.values(resData)[0] as string) || 'Registration failed',
      };
    }
    return {
      success: true,
      verificationRequired: Boolean(resData.verification_required),
      email: resData.email || data.email,
      resendAfter: resData.resend_after,
      message: resData.message,
    };
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) || 'Registration network failed' };
  }
}

export async function verifyEmailOtp(email: string, code: string): Promise<{
  success: boolean;
  user?: ClientProfile;
  error?: string;
  errorCode?: string;
  attemptsLeft?: number;
}> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/auth/verify-email/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const resData = await res.json();
    if (!res.ok) {
      return { success: false, error: resData.error || 'Could not verify the code.', errorCode: resData.code, attemptsLeft: resData.attempts_left };
    }
    if (resData.token) storeClientSession(resData.token, resData.user);
    return { success: true, user: resData.user };
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) || 'Network failed.' };
  }
}

export async function resendEmailOtp(email: string): Promise<{ success: boolean; resendAfter?: number; message?: string; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/auth/resend-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const resData = await res.json();
    if (!res.ok) return { success: false, error: resData.error || 'Could not send a new code.', resendAfter: resData.resend_after };
    return { success: true, resendAfter: resData.resend_after, message: resData.message };
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) || 'Network failed.' };
  }
}

export async function clientLogin(data: {
  username: string;
  password: string;
}): Promise<{ success: boolean; token?: string; role?: string; user?: ClientProfile; error?: string; unverifiedEmail?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: resData.error || 'Invalid credentials',
        unverifiedEmail: resData.code === 'email_unverified' ? resData.email : undefined,
      };
    }
    if (typeof window !== 'undefined' && resData.token) {
      if (resData.role === 'owner') {
        setOwnerToken(resData.token);
        localStorage.setItem('owner_user', JSON.stringify(resData.user));
        localStorage.removeItem('client_token');
        localStorage.removeItem('client_user');
      } else {
        localStorage.setItem('client_token', resData.token);
        localStorage.setItem('client_user', JSON.stringify(resData.user));
      }
      window.dispatchEvent(new Event('authChange'));
    }
    return { success: true, token: resData.token, role: resData.role, user: resData.user };
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) || 'Login network failed' };
  }
}

export async function clientSubmitBulkOrder(formData: FormData): Promise<{
  success: boolean;
  order_number?: string;
  token?: string;
  order?: BulkOrder;
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
      const profile = data.user || {
        first_name: String(formData.get('contact_person') || '').trim().split(/\s+/)[0],
        email: String(formData.get('email') || ''),
      };
      localStorage.setItem('client_user', JSON.stringify(profile));
      window.dispatchEvent(new Event('authChange'));
    }
    return { success: true, ...data };
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) || 'Failed to submit bulk order.' };
  }
}

export async function clientGetBulkOrders(): Promise<{
  results: BulkOrder[];
  count: number;
  summary_metrics?: BulkOrderSummaryMetrics;
  error?: string;
  unauthorized?: boolean;
}> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/bulk-orders/my-orders/?page_size=500`, {
      headers: getClientAuthHeaders(),
      cache: 'no-store',
    });
    if (res.status === 401 || res.status === 403) {
      clearClientSession();
      return { results: [], count: 0, unauthorized: true, error: 'Please log in again.' };
    }
    if (!res.ok) {
      return { results: [], count: 0, error: 'Failed to fetch orders.' };
    }
    const data = await res.json();
    return data;
  } catch (err: unknown) {
    return { results: [], count: 0, error: errorMessage(err) };
  }
}

/** Returns the order, 'unauthorized' when the session is gone, or null when not found / not yours. */
export async function clientGetBulkOrderDetail(orderNumber: string): Promise<BulkOrder | 'unauthorized' | null> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/bulk-orders/my-orders/${encodeURIComponent(orderNumber)}/`, {
      headers: getClientAuthHeaders(),
      cache: 'no-store',
    });
    if (res.status === 401 || res.status === 403) {
      clearClientSession();
      return 'unauthorized';
    }
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function clientPostBulkOrderMessage(orderNumber: string, message: string, file?: File): Promise<{
  success: boolean;
  message?: BulkOrderMessage;
  error?: string;
}> {
  try {
    const formData = new FormData();
    formData.append('message', message);
    if (file) {
      formData.append('attachment', file);
    }
    const res = await fetch(`${getApiUrl()}/api/v1/bulk-orders/my-orders/${encodeURIComponent(orderNumber)}/messages/`, {
      method: 'POST',
      headers: getClientAuthHeaders(),
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to send message.' };
    return { success: true, message: data };
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) };
  }
}

/** Starts online payment of the order's quote; the amount is set by the server. */
export async function clientStartQuotePayment(orderNumber: string): Promise<{ checkout?: QuoteCheckout; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/bulk-orders/my-orders/${encodeURIComponent(orderNumber)}/pay/`, {
      method: 'POST',
      headers: getClientAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Could not start the payment.' };
    return { checkout: data };
  } catch {
    return { error: 'Could not reach the server. Please try again.' };
  }
}

export async function clientVerifyQuotePayment(
  orderNumber: string,
  result: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
): Promise<{ paid: boolean; error?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/bulk-orders/my-orders/${encodeURIComponent(orderNumber)}/pay/verify/`, {
      method: 'POST',
      headers: { ...getClientAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    });
    const data = await res.json();
    if (!res.ok) return { paid: false, error: data.error || 'Payment could not be verified.' };
    if (!data.paid) return { paid: false, error: 'Payment received. It does not match the current quote, so our team will review it and contact you.' };
    return { paid: true };
  } catch {
    return { paid: false, error: 'Could not confirm the payment. If money was taken it will be confirmed automatically.' };
  }
}

export async function clientLogout(): Promise<void> {
  try {
    const headers = getClientAuthHeaders();
    if (headers.Authorization) {
      await fetch(`${getApiUrl()}/api/v1/auth/logout/`, { method: 'POST', headers });
    }
  } catch {}
  clearClientSession();
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
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) || 'Network failed.' };
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
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err) || 'Network failed.' };
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

export async function clientGetCheckedProducts(): Promise<{ results: CheckedProduct[]; count: number }> {
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

