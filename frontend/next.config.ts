import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "5.imimg.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "*.imimg.com" },
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Link",
            value: '<https://theprintplanet.co.in/pricing.md>; rel="pricing"; type="text/markdown", <https://theprintplanet.co.in/llms.txt>; rel="alternate"; type="text/plain", <https://theprintplanet.co.in/okf/index.md>; rel="knowledge-graph"; type="text/markdown"',
          },
        ],
      },
      {
        source: "/llms.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "X-Robots-Tag", value: "all" },
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/llms-full.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "X-Robots-Tag", value: "all" },
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/okf/:path*",
        headers: [
          { key: "Content-Type", value: "text/markdown; charset=utf-8" },
          { key: "X-Robots-Tag", value: "all" },
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
  async rewrites() {
    const backendUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/media/:path*",
        destination: `${backendUrl}/media/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/enquiry",
        destination: "/quote",
        permanent: true,
      },
      {
        source: "/bulk-orders",
        destination: "/corporate",
        permanent: true,
      },
      {
        source: "/portfolio",
        destination: "/gallery",
        permanent: true,
      },
      // Misspelled catalogue URLs renamed in catalog migration 0003 (Nov 2026).
      { source: "/categories/rfid-cansumables", destination: "/categories/rfid-consumables", permanent: true },
      {
        source: "/categories/plastic-lanyard-hook-clip-accessorie",
        destination: "/categories/plastic-lanyard-hook-clip-accessories",
        permanent: true,
      },
      {
        source: "/products/clamp-feeting-machine-single-side",
        destination: "/products/clamp-fitting-machine-single-side",
        permanent: true,
      },
      // Products and categories outside the owner's product sheet, removed in catalog migration 0007.
      ...[
        "shrikanth",
        "m_chip",
        "pc",
        "hiph",
        "pp-r",
        "gpps",
        "yarn-75",
        "yarn-150",
        "yarn-450",
        "sample-kit-holder",
        "sensui-12-inch-x-50-mitter-roll",
        "solvent-gumming-roll-12-x-50-mitter-inch",
        "transparent-crystal-liquid-for-id-cards",
      ].map((slug) => ({ source: `/products/${slug}`, destination: "/products", permanent: true })),
      ...["gaming-roll", "gumming-roll", "sample-kit", "gumming-roll-for-sticker-card", "transparent-crystal-liquid-for-id-cards"].map(
        (slug) => ({ source: `/categories/${slug}`, destination: "/categories", permanent: true }),
      ),
      // Old holder models and RFID cards not in the owner's product sheet, removed in catalog migration 0009.
      ...[
        "eh-t-executive-pvc-id-card-holder",
        "vs-id-card-holder",
        "c2t-id-card-holder",
        "vs-t-id-card-holder",
        "h4-id-card-holder",
        "v2-id-card-holder",
        "v4-white-colour",
        "silver-horizontal-aluminium-holder",
        "blue-horizontal-aluminium-holder",
        "eh-t-executive-crystal-clear-id-card-holder",
        "black-horizontal-aluminium-holder",
        "gold-horizontal-aluminium-holder",
        "red-horizontal-aluminium-holder",
        "black-vertical-aluminium-holder",
        "silver-vertical-aluminium-holder",
        "blue-vertical-aluminium-holder",
        "gold-vertical-aluminium-holder",
        "red-vertical-aluminium-holder",
        "hs-sticker-id-card-pasting-holder",
        "eh-w-executive-pasting-id-card-holder",
        "ev-t-executive-crystal-clear-id-card-holder",
        "hs2-t-b",
        "ev-w-executive-pasting-id-card-holder",
        "vst-pvc-sticker-id-card-pasting-transparent-holder",
        "vs-sticker-id-card-pasting-holder",
        "vs2t-id-card-holder",
        "vs-l-single-side-sticker-holder",
        "hst-b-pvc-sticker-id-card-pasting-transparent-holder",
        "vst-b-pvc-sticker-id-card-pasting-transparent-holder",
        "hs2t-id-card-holder",
        "ev-t-executive-pvc-id-card-holder",
        "eh-w-executive-plates-id-card-holder",
        "ev-w-executive-plates-id-card-holder",
        "vs2-id-card-holder",
        "hs-id-card-holder",
        "hs2-id-card-holder",
        "v2p-id-card-holder",
        "h4t-id-card-holder",
        "hs-t-id-card-holder",
        "h2t-id-card-holder",
        "v4t-id-card-holder",
        "h2-id-card-holder",
        "c2-id-card-holder",
        "v2h-id-card-holder",
        "h2h-id-card-holder",
        "v4-id-card-holder",
      ].map((slug) => ({ source: `/products/${slug}`, destination: "/categories/id-card-holder", permanent: true })),
      ...[
        "em4100-125khz-proximity-rfid-clamshell-thin-cards",
        "mifare-1k-classic-rfid-iso-smart-cards",
      ].map((slug) => ({ source: `/products/${slug}`, destination: "/categories/pvc-and-smart-cards", permanent: true })),
      ...[
        "aluminium-metal-holder",
        "crystal-clear-pvc-id-card-holder",
        "executive-pvc-id-card-holder",
        "semi-transparent-pvc-id-card-holder",
        "pvc-id-card-sticker-pasting-holder",
      ].map((slug) => ({ source: `/categories/${slug}`, destination: "/categories/id-card-holder", permanent: true })),
    ];
  },
};

export default nextConfig;
