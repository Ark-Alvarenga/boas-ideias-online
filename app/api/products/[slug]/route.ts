import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import type { Product } from '@/lib/types'

interface RouteContext {
  params: { slug: string }
}

// GET /api/products/[slug] - Get product by slug
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { slug } = context.params
    
    const db = await getDatabase()
    const collection = db.collection<Product>('products')

    const product = await collection.findOne({ slug, status: 'active' })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await collection.updateOne(
      { slug },
      { $inc: { views: 1 } }
    )

    // Get related products (same category, different product)
    const relatedProducts = await collection
      .find({ 
        category: product.category, 
        slug: { $ne: slug },
        status: 'active'
      })
      .limit(3)
      .toArray()

    return NextResponse.json({
      product: {
        ...product,
        _id: product._id?.toString(),
      },
      relatedProducts: relatedProducts.map((related) => ({
        ...related,
        _id: related._id?.toString(),
      })),
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PATCH /api/products/[slug] - Update product
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { slug } = await context.params
    const body = await request.json()
    
    const db = await getDatabase()
    const collection = db.collection<Product>('products')

    const updateData = {
      ...body,
      updatedAt: new Date()
    }

    // Don't allow updating certain fields
    delete updateData._id
    delete updateData.creatorId
    delete updateData.createdAt
    delete updateData.sales
    delete updateData.views

    const result = await collection.updateOne(
      { slug },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[slug] - Delete product
export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { slug } = await context.params
    
    const db = await getDatabase()
    const collection = db.collection<Product>('products')

    // Soft delete by changing status
    const result = await collection.updateOne(
      { slug },
      { $set: { status: 'archived', updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
