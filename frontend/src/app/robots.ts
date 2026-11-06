import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theprintplanet.co.in';

export default function robots(): MetadataRoute.Robots {
  const commonDisallows = [
    '/owner/',
    '/api/',
    '/admin/',
    '/checkout/',
    '/orders',
    '/account/',
    '/enquiry/',
  ];

  const commonAllows = [
    '/',
    '/_next/static/',
    '/pricing.md',
    '/pricing.txt',
    '/llms.txt',
    '/llms-full.txt',
    '/okf/',
    '/sitemap.xml',
    '/manifest.webmanifest',
    '/icon.png',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: commonAllows,
        disallow: commonDisallows,
      },
      // Search engine & AI discovery crawlers
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'Applebot',
          'OAI-SearchBot',
          'PerplexityBot',
          'Claude-SearchBot',
          'meta-webindexer',
        ],
        allow: commonAllows,
        disallow: commonDisallows,
      },
      // User-triggered retrieval bots (ChatGPT browsing, Claude web fetch, Perplexity live queries)
      {
        userAgent: [
          'ChatGPT-User',
          'Claude-User',
          'Perplexity-User',
          'meta-externalfetcher',
        ],
        allow: commonAllows,
        disallow: commonDisallows,
      },
      // AI training & foundation model indexing bots
      {
        userAgent: [
          'GPTBot',
          'ClaudeBot',
          'Google-Extended',
          'Amazonbot',
          'cohere-ai',
        ],
        allow: commonAllows,
        disallow: commonDisallows,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
