import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { cookies } from 'next/headers'
import { authConfig, verifySessionToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'
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

    // Authenticate user
    const cookieStore = await cookies()
    const token = cookieStore.get(authConfig.cookieName)?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    const payload = verifySessionToken(token)
    if (!payload || !ObjectId.isValid(payload.userId)) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 },
      )
    }
    const body = await request.json()
    
    const db = await getDatabase()
    const collection = db.collection<Product>('products')

    // Ensure the current user owns the product
    const product = await collection.findOne({ slug })
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 },
      )
    }

    if (!product.creatorId || !product.creatorId.equals(new ObjectId(payload.userId))) {
      return NextResponse.json(
        { error: 'Not authorized to modify this product' },
        { status: 403 },
      )
    }

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

    await collection.updateOne(
      { _id: product._id },
      { $set: updateData },
    )

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

    // Authenticate user
    const cookieStore = await cookies()
    const token = cookieStore.get(authConfig.cookieName)?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    const payload = verifySessionToken(token)
    if (!payload || !ObjectId.isValid(payload.userId)) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 },
      )
    }

    const db = await getDatabase()
    const collection = db.collection<Product>('products')

    // Ensure the current user owns the product
    const product = await collection.findOne({ slug })
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 },
      )
    }

    if (!product.creatorId || !product.creatorId.equals(new ObjectId(payload.userId))) {
      return NextResponse.json(
        { error: 'Not authorized to delete this product' },
        { status: 403 },
      )
    }

    // Soft delete by changing status
    await collection.updateOne(
      { _id: product._id },
      { $set: { status: 'archived', updatedAt: new Date() } },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
