import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import type { Product } from '@/lib/types'

// GET /api/featured-products - public featured products for homepage
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '4')

    const db = await getDatabase()
    const collection = db.collection<Product>('products')

    const products = await collection
      .find({
        status: 'active',
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    return NextResponse.json({
      products: products.map((product) => ({
        ...product,
        _id: product._id?.toString(),
      })),
    })
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 },
    )
  }
}

