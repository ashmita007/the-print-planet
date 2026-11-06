import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'The Print Planet™ Bangalore | PVC Cards, Lanyards & ID Machines',
    short_name: 'The Print Planet',
    description:
      "Official portal of The Print Planet, Bangalore (theprintplanet.co.in). India's direct B2B manufacturer and wholesale supplier of PVC ID card raw materials, multicolour heat-transfer lanyards, and card machinery.",
    start_url: '/',
    display: 'standalone',
    background_color: '#0E2238',
    theme_color: '#0E2238',
    categories: ['shopping', 'business', 'productivity', 'utilities'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Search Product Catalog',
        short_name: 'Search',
        description: 'Instant search across 180+ wholesale PVC card and lanyard supplies',
        url: '/search',
        icons: [{ src: '/icon.png', sizes: '192x192' }],
      },
      {
        name: 'Wholesale Pricing Tariff',
        short_name: 'Tariff',
        description: 'Official factory volume breaks and wholesale slabs',
        url: '/pricing',
        icons: [{ src: '/icon.png', sizes: '192x192' }],
      },
      {
        name: 'Bulk Orders & Corporate RFP',
        short_name: 'Bulk Order',
        description: 'Fast institutional quotations and PAN-India dispatch desk',
        url: '/corporate',
        icons: [{ src: '/icon.png', sizes: '192x192' }],
      },
      {
        name: 'All Products & Machinery',
        short_name: 'Products',
        description: 'Browse factory-direct printing raw materials and machinery',
        url: '/products',
        icons: [{ src: '/icon.png', sizes: '192x192' }],
      },
    ],
  };
}
