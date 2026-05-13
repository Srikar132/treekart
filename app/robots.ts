import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/checkout/',
        '/account/',
        '/auth/',
        '/farmer/',
        '/api/',
      ],
    },
    sitemap: 'https://www.treekart.in/sitemap.xml',
  }
}
