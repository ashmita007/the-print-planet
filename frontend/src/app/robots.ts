import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theprintplanet.co.in';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/_next/static/',
        ],
        disallow: [
          '/owner/',
          '/api/',
          '/admin/',
          '/checkout/',
        ],
      },
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'Applebot',
          'OAI-SearchBot',
          'PerplexityBot',
          'Claude-SearchBot',
        ],
        allow: [
          '/',
          '/_next/static/',
        ],
        disallow: [
          '/owner/',
          '/api/',
          '/admin/',
          '/checkout/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
