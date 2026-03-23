import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { Product, CreateProductInput, User } from '@/lib/types'
import { cookies } from 'next/headers'
import { authConfig, verifySessionToken } from '@/lib/auth'
import { productCreateSchema } from '@/lib/schema'
import { resolvePriceCents } from '@/lib/currency'

// GET /api/products - List all products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'createdAt'
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = parseInt(searchParams.get('skip') || '0')
    const userId = searchParams.get('userId')

    const db = await getDatabase()
    const collection = db.collection<Product>('products')

    // Build query
    const query: Record<string, unknown> = {}

    if (userId && ObjectId.isValid(userId)) {
      // When userId is provided, verify the requester owns this userId
      const cookieStore = await (await import('next/headers')).cookies()
      const token = cookieStore.get(authConfig.cookieName)?.value
      const payload = token ? verifySessionToken(token) : null

      if (payload && payload.userId === userId) {
        // Authenticated owner — return all statuses
        query.creatorId = new ObjectId(userId)
      } else {
        // Not the owner — only show active products
        query.creatorId = new ObjectId(userId)
        query.status = 'active'
      }
    } else {
      // Public marketplace: only show published (active) products
      query.status = 'active'
    }

    if (category && category !== 'todos') {
      query.category = category
    }

    if (search) {
      // Escape regex special characters to prevent ReDoS
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      query.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
      ]
    }

    // Build sort
    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 }
    switch (sort) {
      case 'preco-menor':
        sortOptions = { priceCents: 1 }
        break
      case 'preco-maior':
        sortOptions = { priceCents: -1 }
        break
      case 'populares':
        sortOptions = { sales: -1, createdAt: -1 }
        break
      case 'recentes':
        sortOptions = { createdAt: -1 }
        break
      case 'relevancia':
      default:
        sortOptions = { sales: -1, views: -1, createdAt: -1 }
    }

    const rawProducts = await collection
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .toArray()

    const products = rawProducts.map((product) => {
      const { price, ...rest } = product
      return {
        ...rest,
        priceCents: resolvePriceCents(product),
        _id: product._id?.toString(),
        creatorName: product.creatorName,
      }
    })

    const total = await collection.countDocuments(query)

    return NextResponse.json({
      products,
      total,
      hasMore: skip + limit < total,
    })
  } catch (error: any) {
    console.error('🔥 PRODUCTS ERROR:', error)

    return NextResponse.json(
      { error: error?.message || error },
      { status: 500 }
    )
  }
}

// POST /api/products - Create a new product
export async function POST(request: Request) {
  try {
    const rawBody = await request.json()


    const priceCents =
      rawBody.priceCents ??
      (rawBody.price ? Math.round(Number(rawBody.price) * 100) : undefined)
    const parseResult = productCreateSchema.safeParse({ ...rawBody, priceCents, })

    // Validate required fields
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid product data', details: parseResult.error.errors },
        { status: 400 }
      )
    }

    const body = parseResult.data

    const db = await getDatabase()
    const productsCollection = db.collection<Product>('products')
    const usersCollection = db.collection<User>('users')

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

    const creatorId = new ObjectId(payload.userId)
    const user = await usersCollection.findOne({ _id: creatorId })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 },
      )
    }

    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const existingProduct = await productsCollection.findOne({ slug })
    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this slug already exists.' },
        { status: 400 },
      )
    }
    const finalSlug = slug

    const productStatus = 'active'

    const newProduct: Product = {
      title: body.title,
      description: body.description,
      priceCents: body.priceCents,
      category: body.category,
      coverImage: body.coverImage,
      pdfUrl: body.pdfUrl,
      features: body.features || [],
      slug: finalSlug,
      creatorId,
      creatorName: user.name,
      featured: false,
      status: productStatus,
      views: 0,
      sales: 0,
      rating: 0,
      reviewCount: 0,
      affiliateEnabled: false,
      affiliateCommissionPercent: 20,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await productsCollection.insertOne(newProduct)

    return NextResponse.json({
      success: true,
      productId: result.insertedId,
      slug: finalSlug
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
