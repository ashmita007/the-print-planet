import { isMaterialCode } from '@/lib/productCopy';
import { MetadataRoute } from 'next';
import { getCategories, getProducts } from '@/lib/api';
import { GUIDES } from '@/lib/guides';

// Built per request: the database is not reachable during the Docker build, so a
// prerendered sitemap would contain only the static pages.
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theprintplanet.co.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static high-priority landing pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/products`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/categories`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/services`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/gallery`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/industries`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/corporate`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/quote`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pricing`,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/faq`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/guides`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...GUIDES.map((g) => ({
      url: `${SITE_URL}/guides/${g.slug}`,
      lastModified: new Date(g.updated),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    {
      url: `${SITE_URL}/pvc-card-manufacturer-bangalore`,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/lanyard-manufacturer-bangalore`,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/pvc-cards-wholesale-india`,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // 2. Dynamic Categories
  const categories = await getCategories();
  // Empty categories are noindexed, so they stay out of the sitemap too.
  const categoryRoutes: MetadataRoute.Sitemap = categories.filter((cat) => cat.products_count > 0).map((cat) => ({
    url: `${SITE_URL}/categories/${cat.slug}`,
    lastModified: cat.updated_at ? new Date(cat.updated_at) : undefined,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // 3. Dynamic Products (Fetch all pages to guarantee 100% of catalogue products are indexed)
  const allProducts: { slug: string; name?: string; updated_at?: string }[] = [];
  let page = 1;
  let hasMore = true;
  while (hasMore && page <= 10) {
    const productsData = await getProducts({ page, page_size: 100 });
    if (productsData?.results?.length) {
      allProducts.push(...productsData.results);
      if (!productsData.next || allProducts.length >= productsData.count) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  // Bare material-code products are noindexed (see productCopy), so they are left out here too.
  const productRoutes: MetadataRoute.Sitemap = allProducts.filter((prod) => !isMaterialCode(prod.name)).map((prod) => ({
    url: `${SITE_URL}/products/${prod.slug}`,
    lastModified: prod.updated_at ? new Date(prod.updated_at) : undefined,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
