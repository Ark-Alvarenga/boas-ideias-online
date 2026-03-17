import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { Order, Product, CreateOrderInput } from '@/lib/types'
import { authConfig, verifySessionToken } from '@/lib/auth'

// POST /api/orders is REMOVED.
// Orders are created exclusively by the Stripe webhook after confirmed payment.
// See: /api/webhooks/stripe/route.ts



// GET /api/orders - Get orders (for admin/creator dashboard)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = parseInt(searchParams.get('skip') || '0')

    const db = await getDatabase()
    const collection = db.collection<Order>('orders')

    // Require authentication and scope orders to the current user (buyer)
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

    const userObjectId = new ObjectId(payload.userId)

    const orders = await collection
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await collection.countDocuments({ userId: userObjectId })

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
