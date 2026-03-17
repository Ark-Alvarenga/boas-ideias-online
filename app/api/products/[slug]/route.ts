import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { cookies } from 'next/headers'
import { authConfig, verifySessionToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import type { Product, Order } from '@/lib/types'

interface RouteContext {
  params: Promise<{ slug: string }> | { slug: string }
}

// GET /api/products/[slug] - Get product by slug (Next.js 15+ safe params)
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { slug } = await Promise.resolve(context.params)
    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Invalid slug" },
        { status: 400 }
      )
    }
    
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

// PATCH /api/products/[slug] - Update product (Next.js 15+ safe params)
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { slug } = await Promise.resolve(context.params)
    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Invalid slug" },
        { status: 400 }
      )
    }

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

    // --- Field allowlist: only accept known updatable fields ---
    const ALLOWED_FIELDS = ['title', 'description', 'price', 'category', 'status', 'coverImage', 'pdfUrl', 'features', 'featured', 'affiliateEnabled', 'affiliateCommissionPercent'] as const
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) {
        updateData[key] = body[key]
      }
    }

    // Sanitize specific fields
    if (typeof updateData.title === 'string') {
      updateData.title = updateData.title.trim().slice(0, 200)
      if (updateData.title === '') {
        return NextResponse.json({ error: 'Title cannot be empty.' }, { status: 400 })
      }
    }
    if (typeof updateData.description === 'string') {
      updateData.description = updateData.description.trim().slice(0, 5000)
    }
    if (updateData.price !== undefined) {
      const numPrice = Number(updateData.price)
      if (isNaN(numPrice) || numPrice < 0) {
        return NextResponse.json({ error: 'Invalid price.' }, { status: 400 })
      }
      updateData.price = numPrice
    }
    if (typeof updateData.category === 'string') {
      updateData.category = updateData.category.trim().slice(0, 100)
    }
    if (updateData.features !== undefined) {
      if (!Array.isArray(updateData.features) || !updateData.features.every((f: unknown) => typeof f === 'string')) {
        return NextResponse.json({ error: 'Features must be an array of strings.' }, { status: 400 })
      }
      updateData.features = (updateData.features as string[]).map((f: string) => f.trim()).filter(Boolean).slice(0, 20)
    }
    if (updateData.featured !== undefined) {
      if (typeof updateData.featured !== 'boolean') {
        return NextResponse.json({ error: 'Featured must be a boolean.' }, { status: 400 })
      }
    }

    // Validate status if present: only allow lifecycle states
    const allowedStatuses = ['draft', 'active', 'archived'] as const
    if (updateData.status !== undefined) {
      if (!allowedStatuses.includes(updateData.status as typeof allowedStatuses[number])) {
        return NextResponse.json(
          { error: 'Invalid status. Allowed: draft, active, archived.' },
          { status: 400 }
        )
      }
    }

    // Validate affiliate fields
    if (updateData.affiliateEnabled !== undefined) {
      if (typeof updateData.affiliateEnabled !== 'boolean') {
        return NextResponse.json({ error: 'affiliateEnabled must be a boolean.' }, { status: 400 })
      }
    }
    if (updateData.affiliateCommissionPercent !== undefined) {
      const pct = Number(updateData.affiliateCommissionPercent)
      if (isNaN(pct) || pct < 1 || pct > 50) {
        return NextResponse.json({ error: 'Affiliate commission must be between 1% and 50%.' }, { status: 400 })
      }
      updateData.affiliateCommissionPercent = pct
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
        { error: 'Not authorized to modify this product' },
        { status: 403 },
      )
    }

    await collection.updateOne(
      { _id: product._id },
      { $set: updateData },
    )

    if (updateData.status === 'archived') {
      console.log('[Product:PATCH]', JSON.stringify({ action: 'archive', slug, userId: payload.userId, timestamp: new Date().toISOString() }))
    }
    if (updateData.status === 'active') {
      console.log('[Product:PATCH]', JSON.stringify({ action: 'republish', slug, userId: payload.userId, timestamp: new Date().toISOString() }))
    }
    
    console.log('[Product:PATCH]', JSON.stringify({ action: 'update', slug, userId: payload.userId, timestamp: new Date().toISOString() }))

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
    const { slug } = await Promise.resolve(context.params)
    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Invalid slug" },
        { status: 400 }
      )
    }

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

    // Safety: do not delete if product has orders (sales)
    const ordersCollection = db.collection<Order>('orders')
    const orderCount = await ordersCollection.countDocuments({
      productId: product._id,
    })
    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'Product cannot be deleted because it already has sales.' },
        { status: 400 }
      )
    }

    await collection.deleteOne({ _id: product._id })
    console.log('[Product:DELETE]', JSON.stringify({ action: 'delete', slug, userId: payload.userId, timestamp: new Date().toISOString() }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
