import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { Order, Product, CreateOrderInput } from '@/lib/types'
import { authConfig, verifySessionToken } from '@/lib/auth'

// POST /api/orders - Create a new order
export async function POST(request: Request) {
  try {
    const body: CreateOrderInput = await request.json()
    
    // Validate required fields
    if (!body.productId || !body.buyerEmail || !body.buyerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const productsCollection = db.collection<Product>('products')
    const ordersCollection = db.collection<Order>('orders')

    // Try to associate order with logged-in user, if any
    let userObjectId: ObjectId | undefined
    const cookieStore = cookies()
    const token = cookieStore.get(authConfig.cookieName)?.value
    if (token) {
      const payload = verifySessionToken(token)
      if (payload && ObjectId.isValid(payload.userId)) {
        userObjectId = new ObjectId(payload.userId)
      }
    }

    // Get product details
    const product = await productsCollection.findOne({ 
      _id: new ObjectId(body.productId),
      status: 'active'
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Create order
    const newOrder: Order = {
      productId: new ObjectId(body.productId),
      productTitle: product.title,
      productPrice: product.price,
      userId: userObjectId,
      buyerEmail: body.buyerEmail,
      buyerName: body.buyerName,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await ordersCollection.insertOne(newOrder)

    // In production, you would:
    // 1. Process payment with Stripe/other provider
    // 2. Update order status to 'completed' on successful payment
    // 3. Increment product sales count
    // 4. Send confirmation email

    // For demo, mark as completed immediately
    await ordersCollection.updateOne(
      { _id: result.insertedId },
      { $set: { status: 'completed', updatedAt: new Date() } }
    )

    // Increment sales count
    await productsCollection.updateOne(
      { _id: new ObjectId(body.productId) },
      { $inc: { sales: 1 } }
    )

    return NextResponse.json({
      success: true,
      orderId: result.insertedId.toString(),
      message: 'Order created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

// GET /api/orders - Get orders (for admin/creator dashboard)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = parseInt(searchParams.get('skip') || '0')

    const db = await getDatabase()
    const collection = db.collection<Order>('orders')

    // In production, filter by authenticated user's products
    const orders = await collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await collection.countDocuments()

    return NextResponse.json({
      orders,
      total,
      hasMore: skip + limit < total
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
