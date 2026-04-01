import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { cookies } from 'next/headers'
import { authConfig, verifySessionToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import type { Product, Order } from '@/lib/types'
import { productUpdateSchema } from '@/lib/schema'
import { resolvePriceCents } from '@/lib/currency'

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

    // Filter the product to remove critical fields like pdfUrl
    const { pdfUrl, ...safeProduct } = product;

    return NextResponse.json({
      product: {
        ...safeProduct,
        priceCents: resolvePriceCents(product),
        _id: product._id?.toString(),
      },
      relatedProducts: relatedProducts.map((related) => {
        const { price, pdfUrl, ...rest } = related;
        return {
          ...rest,
          priceCents: resolvePriceCents(related),
          _id: related._id?.toString(),
        };
      }),
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
    const rawBody = await request.json()
    
    const parseResult = productUpdateSchema.safeParse(rawBody)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid product data', details: parseResult.error.errors },
        { status: 400 }
      )
    }

    const parsed = parseResult.data

    // Affiliate safety: if disabled, force commission to 0
    if (parsed.affiliateEnabled === false) {
      parsed.affiliateCommissionPercent = 0
    }

    const updateData: Record<string, unknown> = { 
      ...parsed, 
      updatedAt: new Date() 
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
