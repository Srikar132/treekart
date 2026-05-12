import { MetadataRoute } from 'next'
import { getAvailableTrees } from '@/actions/tree.actions'
import { getMangoProducts } from '@/actions/products.actions'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://treekart.in'
 
  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/faq',
    '/trees',
    '/store',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))
 
  // Fetch dynamic tree routes
  const { trees } = await getAvailableTrees({ limit: 1000, filters: { status: ['available', 'rented'] } })
  const treeRoutes = trees.map((tree) => ({
    url: `${baseUrl}/trees/${tree.id}`,
    lastModified: new Date(tree.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))
 
  // Fetch dynamic product routes
  const { products } = await getMangoProducts({ limit: 1000 })
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/store/${product.id}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))
 
  return [...staticRoutes, ...treeRoutes, ...productRoutes]
}
