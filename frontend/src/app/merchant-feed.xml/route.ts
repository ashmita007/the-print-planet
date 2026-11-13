import { getApiUrl } from '@/lib/api';
import type { Product } from '@/lib/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theprintplanet.co.in';

// Google Merchant Center product feed (RSS 2.0 + g: namespace) for free Shopping listings.
// Add https://theprintplanet.co.in/merchant-feed.xml as a scheduled feed in Merchant Center.
export const revalidate = 3600;

const esc = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    // Strip control characters XML does not allow.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

const plain = (text: string, limit: number) =>
  text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit);

async function fetchAllProducts(): Promise<Product[]> {
  const all: Product[] = [];
  let url: string | null = `${getApiUrl()}/api/v1/products/?page_size=500`;
  for (let page = 0; url && page < 10; page++) {
    const res: Response = await fetch(url, { next: { revalidate: 3600 } } as RequestInit);
    if (!res.ok) break;
    const data: { results?: Product[]; next?: string | null } = await res.json();
    all.push(...(data.results || []));
    url = data.next || null;
  }
  return all;
}

function itemXml(p: Product): string | null {
  const price = Number(p.price);
  const image = p.primary_image?.secure_url || p.images?.[0]?.secure_url;
  // Google rejects items without a visible price or an image, so leave those out.
  if (!p.is_active || !p.price_visibility || !(price > 0) || !image) return null;

  const link = `${SITE_URL}/products/${p.slug}`;
  const description = plain(p.description || p.short_description || p.name, 4900);
  const extraImages = (p.images || [])
    .map((i) => i.secure_url)
    .filter((u) => u && u !== image)
    .slice(0, 10)
    .map((u) => `\n      <g:additional_image_link>${esc(u)}</g:additional_image_link>`)
    .join('');
  const category = p.category?.name ? plain(p.category.name, 750) : '';
  const moq = p.minimum_order_quantity && p.minimum_order_quantity > 1 ? p.minimum_order_quantity : 0;

  return `
    <item>
      <g:id>${esc(p.sku || p.id)}</g:id>
      <g:title>${esc(plain(p.name, 150))}</g:title>
      <g:description>${esc(description)}</g:description>
      <g:link>${esc(link)}</g:link>
      <g:image_link>${esc(image)}</g:image_link>${extraImages}
      <g:availability>in_stock</g:availability>
      <g:price>${price.toFixed(2)} ${esc(p.currency || 'INR')}</g:price>
      <g:condition>new</g:condition>
      <g:brand>The Print Planet</g:brand>
      <g:identifier_exists>no</g:identifier_exists>${category ? `\n      <g:product_type>${esc(category)}</g:product_type>` : ''}${p.color ? `\n      <g:color>${esc(plain(p.color, 100))}</g:color>` : ''}${p.material ? `\n      <g:material>${esc(plain(p.material, 200))}</g:material>` : ''}${moq ? `\n      <g:custom_label_0>MOQ ${moq}</g:custom_label_0>` : ''}
    </item>`;
}

export async function GET() {
  let items = '';
  try {
    items = (await fetchAllProducts()).map(itemXml).filter(Boolean).join('');
  } catch {
    items = '';
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>The Print Planet product feed</title>
    <link>${SITE_URL}</link>
    <description>ID card, lanyard and card machine supplies from The Print Planet, Bengaluru.</description>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'X-Robots-Tag': 'noindex',
    },
  });
}
