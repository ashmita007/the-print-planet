export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image?: string | null;
  parent?: number | null;
  parent_slug?: string | null;
  display_order: number;
  is_active: boolean;
  seo_title?: string;
  seo_description?: string;
  products_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product?: number;
  cloudinary_public_id: string;
  secure_url: string;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  category: Category;
  category_id?: number;
  short_description?: string;
  description: string;
  specifications: Record<string, string>;
  material?: string | null;
  dimensions?: string | null;
  color?: string | null;
  minimum_order_quantity?: number | null;
  price?: string | number | null;
  price_display?: string | null;
  currency: string;
  price_visibility: boolean;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  seo_title?: string;
  seo_description?: string;
  reference_source_url?: string | null;
  source_verified_at?: string | null;
  verification_status: string;
  primary_image?: {
    id: number;
    secure_url: string;
    alt_text: string;
  } | null;
  images?: ProductImage[];
  related_products?: Product[];
  created_at: string;
  updated_at: string;
}

export interface Enquiry {
  id: number;
  full_name: string;
  company_name?: string;
  email: string;
  phone: string;
  product?: number | null;
  product_name_text?: string;
  product_details?: Product;
  requested_quantity?: number | null;
  message: string;
  attachment?: string | null;
  attachment_url?: string;
  source_page?: string;
  lead_source?: string;
  landing_page?: string;
  referrer?: string;
  status: 'new' | 'in_progress' | 'quoted' | 'closed' | 'spam';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: number;
  business_name: string;
  tagline: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  gst_number?: string;
  hero_badge?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_caption?: string;
  about_data?: Record<string, string | undefined>;
  social_links: Record<string, string>;
  footer_text: string;
  seo_defaults: Record<string, string>;
  updated_at: string;
}

export interface HomePageSection {
  id: number;
  section_type: string;
  title: string;
  subtitle: string;
  display_order: number;
  is_active: boolean;
  config: Record<string, unknown>;
  featured_categories: Category[];
  featured_products: Product[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface DashboardMetrics {
  total_products: number;
  active_products: number;
  total_categories: number;
  active_categories: number;
  total_enquiries: number;
  new_enquiries: number;
  in_progress_enquiries: number;
  total_bulk_orders?: number;
  pending_bulk_orders?: number;
}

export interface BulkOrderMessage {
  id: number;
  order: number;
  sender_type: 'client' | 'owner' | 'system';
  sender_name: string;
  message: string;
  attachment?: string | null;
  attachment_url?: string;
  created_at: string;
}

export interface BulkOrder {
  id: number;
  order_number: string;
  user?: number;
  organization_type: 'school' | 'corporate' | 'college' | 'reseller' | 'other';
  organization_type_label?: string;
  organization_name: string;
  contact_person: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  gst_number?: string;
  category_type?: string;
  checked_products?: { id: number; name: string; sku?: string }[];
  product?: number | null;
  product_details?: Product | null;
  product_name_text?: string;
  estimated_quantity: number;
  specifications?: Record<string, unknown>;
  requirements: string;
  attachment?: string | null;
  attachment_url?: string;
  status: 'submitted' | 'reviewing' | 'quoted' | 'proofing' | 'in_production' | 'dispatched' | 'completed' | 'cancelled';
  status_label?: string;
  quoted_amount?: number | null;
  quote_notes?: string;
  tracking_consignment_number?: string;
  tracking_courier_partner?: string;
  is_paid?: boolean;
  paid_amount?: number | string | null;
  paid_at?: string | null;
  razorpay_payment_id?: string;
  can_pay_online?: boolean;
  payment_under_review?: boolean;
  messages?: BulkOrderMessage[];
  messages_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CheckedProduct {
  id: number;
  product_details?: Product;
}

export interface BulkOrderSummaryMetrics {
  total: number;
  submitted: number;
  reviewing: number;
  quoted: number;
  in_production: number;
  completed: number;
}

export type GoogleReview = {
  author_name: string;
  author_url: string;
  author_photo: string;
  rating: number;
  text: string;
  relative_time: string;
  publish_time: string;
};

export type PublicGoogleReviews = {
  review_url: string;
  maps_url: string;
  rating: string | number | null;
  review_count: number | null;
  reviews: GoogleReview[];
  last_synced_at: string | null;
};

export type OwnerGoogleReviews = PublicGoogleReviews & {
  place_id: string;
  show_on_site: boolean;
  has_api_key: boolean;
  api_key_source: '' | 'server' | 'saved';
  last_sync_error: string;
  updated_at: string;
};

export type ClientProfile = {
  id?: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
};

export type RegisterResult = {
  success: boolean;
  verificationRequired?: boolean;
  email?: string;
  resendAfter?: number;
  message?: string;
  error?: string;
};

export interface QuoteCheckout {
  key_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
}

export interface PaymentGatewaySummary {
  enabled: boolean;
  key_id: string;
  mode: '' | 'test' | 'live';
  has_key_secret: boolean;
  key_secret_last4: string;
  has_webhook_secret: boolean;
  secrets_unreadable: boolean;
  active_source: 'admin' | 'environment' | 'none';
  active_mode: '' | 'test' | 'live';
  webhook_url: string;
  webhook_events: string[];
  webhook_ready: boolean;
  can_store_secrets: boolean;
  updated_at: string | null;
}

export interface OwnerPaymentRow {
  id: number;
  order_number: string;
  organization_name: string;
  amount: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  status: 'paid' | 'needs_review' | 'not_paid';
  captured_at: string | null;
  created_at: string;
}

export type EmailDiagnostics = {
  config?: {
    provider?: string;
    preferred_provider?: string;
    brevo_key_configured?: boolean;
    brevo_key_preview?: string;
    brevo_sender_email?: string;
    resend_key_configured?: boolean;
    resend_key_preview?: string;
    resend_from_email?: string;
    active_sender_email?: string;
    owner_recipient?: string;
    smtp_backend?: string;
  };
  account?: { email?: string; company_name?: string; plan?: string };
  senders?: { email?: string; name?: string; active?: boolean }[];
  sender_verified?: boolean;
  brevo_sender_verified?: boolean;
  resend_sender_verified?: boolean;
  resend?: {
    key_valid?: boolean;
    sender_domain?: string;
    sandbox?: boolean;
    sender_verified?: boolean;
    note?: string;
    domains?: { name?: string; status?: string }[];
  } | null;
  problems?: string[];
};

export interface ImportPreviewRow {
  row_index: number;
  name?: string;
  sku?: string;
  category_slug?: string;
  price?: number | string | null;
  status?: string;
  raw_data?: Record<string, unknown>;
}

export interface ImportValidationResult {
  preview?: ImportPreviewRow[];
  rows?: Record<string, unknown>[];
  errors?: { row: number; sku?: string; error: string }[];
  error_count: number;
  total_rows: number;
  new_count: number;
  existing_count: number;
}

export interface ImportExecutionResult {
  imported_count: number;
  updated_count: number;
  skipped_count: number;
}

export interface ProductSavePayload extends Omit<Partial<Product>, 'category' | 'images'> {
  category?: number;
  images?: { secure_url: string; is_primary: boolean; display_order: number; alt_text: string }[];
}
