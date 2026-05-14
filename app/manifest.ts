import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TreeKart — Rent a Mango Tree',
    short_name: 'TreeKart',
    description: 'Experience the joy of owning a mango tree. Rent a real Alphonso mango tree, track its growth, and get fresh organic mangoes delivered to your doorstep.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#15803d', // primary green color
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
