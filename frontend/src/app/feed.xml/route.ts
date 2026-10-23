import { NextResponse } from 'next/server';
import { getProducts, getCategories } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theprintplanet.co.in';

export async function GET() {
  try {
    const [productsData, categories] = await Promise.all([
      getProducts({ page: 1, page_size: 50 }),
      getCategories(),
    ]);

    const itemsXml = (productsData?.results || [])
      .map((product) => {
        const productUrl = `${SITE_URL}/products/${product.slug}`;
        const title = (product.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const description = (product.short_description || product.description || 'Wholesale B2B ID card product and printing supplies')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        const pubDate = new Date().toUTCString();

        return `
    <item>
      <title>${title}</title>
      <link>${productUrl}</link>
      <guid isPermaLink="true">${productUrl}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
      })
      .join('');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Print Planet — Wholesale ID Card Solutions &amp; Lanyards</title>
    <link>${SITE_URL}</link>
    <description>Latest wholesale ID accessories, satin lanyard rolls, and machinery catalog from The Print Planet.</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    return new NextResponse('<error>Failed to generate feed</error>', {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
