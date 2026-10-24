import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Print Planet™ (The Print Planet) Bangalore',
    short_name: 'Print Planet',
    description:
      "Official website of Print Planet (The Print Planet, Bangalore — theprintplanet.co.in). India's direct B2B manufacturer and wholesale supplier of PVC ID card raw materials, multicolour heat-transfer lanyards, and card machinery.",
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#17365D',
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
  };
}
