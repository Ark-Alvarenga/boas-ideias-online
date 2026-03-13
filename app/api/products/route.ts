import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { Product, CreateProductInput, User } from '@/lib/types'
import { cookies } from 'next/headers'
import { authConfig, verifySessionToken } from '@/lib/auth'

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
      // When userId is provided, return that user's products (all statuses)
      query.creatorId = new ObjectId(userId)
    } else {
      // Public marketplace: show all non-archived products from all users
      query.status = { $ne: 'archived' }
    }

    if (category && category !== 'todos') {
      query.category = category
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    // Build sort
    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 }
    switch (sort) {
      case 'preco-menor':
        sortOptions = { price: 1 }
        break
      case 'preco-maior':
        sortOptions = { price: -1 }
        break
      case 'populares':
        sortOptions = { sales: -1 }
        break
      case 'recentes':
      default:
        sortOptions = { createdAt: -1 }
    }

    const rawProducts = await collection
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .toArray()

    const products = rawProducts.map((product) => ({
      ...product,
      _id: product._id?.toString(),
      creatorName: product.creatorName,
    }))

    const total = await collection.countDocuments(query)

    return NextResponse.json({
      products,
      total,
      hasMore: skip + limit < total,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create a new product
export async function POST(request: Request) {
  try {
    const body: CreateProductInput = await request.json()
    
    // Validate required fields
    if (!body.title || !body.description || !body.price || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

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

    // Check if slug already exists
    const existingProduct = await productsCollection.findOne({ slug })
    const finalSlug = existingProduct ? `${slug}-${Date.now()}` : slug

    const productStatus = user.stripeOnboardingComplete ? 'active' : 'draft'

    const newProduct: Product = {
      title: body.title,
      description: body.description,
      price: body.price,
      category: body.category,
      coverImage: body.coverImage,
      pdfUrl: body.pdfUrl,
      features: body.features || [],
      slug: finalSlug,
      creatorId,
      creatorName: user.name,
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
