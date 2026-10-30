export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image?: string | null;
  parent?: number | null;
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
  about_data?: Record<string, any>;
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
  config: Record<string, any>;
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
  product?: number | null;
  product_details?: Product | null;
  product_name_text?: string;
  estimated_quantity: number;
  specifications?: Record<string, any>;
  requirements: string;
  attachment?: string | null;
  attachment_url?: string;
  status: 'submitted' | 'reviewing' | 'quoted' | 'proofing' | 'in_production' | 'dispatched' | 'completed' | 'cancelled';
  status_label?: string;
  quoted_amount?: number | null;
  quote_notes?: string;
  tracking_consignment_number?: string;
  tracking_courier_partner?: string;
  messages?: BulkOrderMessage[];
  messages_count?: number;
  created_at: string;
  updated_at: string;
}

export interface BulkOrderSummaryMetrics {
  total: number;
  submitted: number;
  reviewing: number;
  quoted: number;
  in_production: number;
  completed: number;
}
