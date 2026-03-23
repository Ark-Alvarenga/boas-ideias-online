import { MetadataRoute } from 'next'
import { getDatabase } from '@/lib/mongodb'
import { Product } from '@/lib/types'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://boasideias.online'

  // Static routes
  const staticRoutes = [
    '',
    '/marketplace',
    '/sobre',
    '/contato',
    '/ajuda',
    '/precos',
    '/termos',
    '/privacidade',
    '/para-criadores',
    '/recursos',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Dynamic product routes
  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const db = await getDatabase()
    const products = await db.collection<Product>('products')
      .find({ status: 'active' }, { projection: { slug: 1, updatedAt: 1 } })
      .toArray()

    productRoutes = products.map((product) => ({
      url: `${baseUrl}/produto/${product.slug}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Error generating sitemap for products:', error)
  }

  return [...staticRoutes, ...productRoutes]
}
