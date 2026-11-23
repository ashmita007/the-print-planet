import type {
  Address,
  AddressInput,
  BulkOrder,
  CommercePolicies,
  CommerceSettings,
  InvoiceData,
  OrderRequest,
  OrderStatus,
  QuotePreview,
} from '../types';
import { getApiUrl, getAuthHeaders, getClientAuthHeaders } from './core';

// Quote-first commerce: addresses, invoices, cancel/return requests, policies and the owner desk.

type Result<T> = { data?: T; error?: string };

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/** First readable message from a DRF error body ({error}, {field: [msg]} or {detail}). */
function messageFrom(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback;
  const record = body as Record<string, unknown>;
  if (typeof record.error === 'string') return record.error;
  if (typeof record.detail === 'string') return record.detail;
  for (const [field, value] of Object.entries(record)) {
    const text = Array.isArray(value) ? String(value[0] ?? '') : typeof value === 'string' ? value : '';
    if (text) return `${field.replace(/_/g, ' ')}: ${text}`;
  }
  return fallback;
}

async function call<T>(url: string, init: RequestInit, fallback: string): Promise<Result<T>> {
  try {
    const res = await fetch(url, init.next ? init : { cache: 'no-store', ...init });
    const body: unknown = res.status === 204 ? null : await res.json().catch(() => null);
    if (!res.ok) return { error: messageFrom(body, fallback) };
    return { data: body as T };
  } catch {
    return { error: 'Could not reach the server. Please try again.' };
  }
}

const api = (path: string) => `${getApiUrl()}/api/v1${path}`;

// ---- Public -------------------------------------------------------------

export async function getCommercePolicies(): Promise<CommercePolicies | null> {
  const res = await call<CommercePolicies>(api('/commerce-policies/'), { next: { revalidate: 60 } } as RequestInit, 'Policies unavailable');
  return res.data ?? null;
}

// ---- Customer -----------------------------------------------------------

export const clientListAddresses = async (): Promise<Result<Address[]>> =>
  call<Address[]>(api('/account/addresses/'), { headers: getClientAuthHeaders() }, 'Could not load your addresses.');

export const clientSaveAddress = async (id: number | null, input: Partial<AddressInput>): Promise<Result<Address>> =>
  call<Address>(
    api(id === null ? '/account/addresses/' : `/account/addresses/${id}/`),
    { method: id === null ? 'POST' : 'PATCH', headers: { ...getClientAuthHeaders(), ...JSON_HEADERS }, body: JSON.stringify(input) },
    'Could not save the address.',
  );

export const clientDeleteAddress = async (id: number): Promise<Result<null>> =>
  call<null>(api(`/account/addresses/${id}/`), { method: 'DELETE', headers: getClientAuthHeaders() }, 'Could not delete the address.');

export const clientGetInvoice = async (orderNumber: string): Promise<Result<InvoiceData>> =>
  call<InvoiceData>(
    api(`/bulk-orders/my-orders/${encodeURIComponent(orderNumber)}/invoice/`),
    { headers: getClientAuthHeaders() },
    'No invoice has been issued for this order yet.',
  );

export const clientCreateOrderRequest = async (
  orderNumber: string,
  kind: 'cancel' | 'return',
  reason: string,
): Promise<Result<OrderRequest>> =>
  call<OrderRequest>(
    api(`/bulk-orders/my-orders/${encodeURIComponent(orderNumber)}/requests/`),
    { method: 'POST', headers: { ...getClientAuthHeaders(), ...JSON_HEADERS }, body: JSON.stringify({ kind, reason }) },
    'Could not send your request.',
  );

// ---- Owner --------------------------------------------------------------

const ownerOrderUrl = (id: number, tail: string) => api(`/owner/bulk-orders/${id}/${tail}/`);

export const ownerAdvanceOrder = async (
  id: number,
  body: { status: OrderStatus; note?: string; courier?: string; awb?: string },
): Promise<Result<BulkOrder>> =>
  call<BulkOrder>(ownerOrderUrl(id, 'status'), { method: 'POST', headers: { ...getAuthHeaders(), ...JSON_HEADERS }, body: JSON.stringify(body) }, 'Could not update the status.');

export const ownerPreviewQuote = async (id: number, subtotal: string): Promise<Result<QuotePreview>> =>
  call<QuotePreview>(
    ownerOrderUrl(id, 'quote'),
    { method: 'POST', headers: { ...getAuthHeaders(), ...JSON_HEADERS }, body: JSON.stringify({ subtotal, preview: true }) },
    'Could not calculate the quote.',
  );

export const ownerSaveQuote = async (id: number, subtotal: string, notes: string): Promise<Result<BulkOrder>> =>
  call<BulkOrder>(
    ownerOrderUrl(id, 'quote'),
    { method: 'POST', headers: { ...getAuthHeaders(), ...JSON_HEADERS }, body: JSON.stringify({ subtotal, notes }) },
    'Could not save the quote.',
  );

export const ownerIssueInvoice = async (id: number): Promise<Result<BulkOrder>> =>
  call<BulkOrder>(ownerOrderUrl(id, 'invoice'), { method: 'POST', headers: { ...getAuthHeaders(), ...JSON_HEADERS }, body: '{}' }, 'Could not issue the invoice.');

export const ownerListRequests = async (status: 'pending' | 'approved' | 'declined' | 'all' = 'pending'): Promise<Result<OrderRequest[]>> => {
  const res = await call<{ results: OrderRequest[] }>(
    api(`/owner/requests/${status === 'all' ? '' : `?status=${status}`}`),
    { headers: getAuthHeaders() },
    'Could not load requests.',
  );
  return res.error ? { error: res.error } : { data: res.data?.results ?? [] };
};

export const ownerDecideRequest = async (
  id: number,
  body: { decision: 'approve' | 'decline'; owner_note?: string; refund_amount?: string },
): Promise<Result<OrderRequest>> =>
  call<OrderRequest>(api(`/owner/requests/${id}/decide/`), { method: 'POST', headers: { ...getAuthHeaders(), ...JSON_HEADERS }, body: JSON.stringify(body) }, 'Could not record the decision.');

export const ownerGetCommerceSettings = async (): Promise<Result<CommerceSettings>> =>
  call<CommerceSettings>(api('/owner/commerce-settings/'), { headers: getAuthHeaders() }, 'Could not load commerce settings.');

export const ownerSaveCommerceSettings = async (data: Partial<CommerceSettings>): Promise<Result<CommerceSettings>> =>
  call<CommerceSettings>(api('/owner/commerce-settings/'), { method: 'PUT', headers: { ...getAuthHeaders(), ...JSON_HEADERS }, body: JSON.stringify(data) }, 'Could not save commerce settings.');
