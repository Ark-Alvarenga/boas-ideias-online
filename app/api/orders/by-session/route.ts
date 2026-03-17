import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ObjectId } from 'mongodb'
import type StripeType from 'stripe'
import { getDatabase } from '@/lib/mongodb'
import type { Order, Product } from '@/lib/types'
import { authConfig, verifySessionToken } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'

// GET /api/orders/by-session?session_id=cs_...
// Returns (or lazily creates) the current user's paid order for a given Stripe Checkout session.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id' },
        { status: 400 },
      )
    }

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
    const currentUserId = new ObjectId(payload.userId)

    const db = await getDatabase()
    const ordersCollection = db.collection<Order>('orders')
    const productsCollection = db.collection<Product>('products')

    // 1) Try to find an existing paid order created by the webhook
    const existingOrder = await ordersCollection.findOne({
      stripeSessionId: sessionId,
      userId: currentUserId,
      status: 'paid',
    })

    if (existingOrder && existingOrder._id) {
      return NextResponse.json({
        success: true,
        orderId: existingOrder._id.toString(),
        productTitle: existingOrder.productTitle,
      })
    }

    // 2) Fallback: verify directly with Stripe and create the order if payment is confirmed.
    const stripeClient = getStripe()
    const session = await stripeClient.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Checkout session is not paid yet' },
        { status: 404 },
      )
    }

    const metadata = session.metadata ?? {}
    const productId =
      typeof metadata.productId === 'string' && ObjectId.isValid(metadata.productId)
        ? new ObjectId(metadata.productId)
        : null
    const metadataUserId =
      typeof metadata.userId === 'string' && ObjectId.isValid(metadata.userId)
        ? new ObjectId(metadata.userId)
        : null

    // Ensure this session actually belongs to the current user
    if (!metadataUserId || !metadataUserId.equals(currentUserId)) {
      return NextResponse.json(
        { error: 'This checkout session does not belong to the current user' },
        { status: 403 },
      )
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing product metadata on checkout session' },
        { status: 404 },
      )
    }

    const product = await productsCollection.findOne({ _id: productId })
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found for this session' },
        { status: 404 },
      )
    }

    const buyerName =
      (typeof metadata.buyerName === 'string' && metadata.buyerName) ||
      session.customer_details?.name ||
      'Cliente'
    const buyerEmail =
      (typeof session.customer_details?.email === 'string' && session.customer_details.email) ||
      (typeof session.customer_email === 'string' && session.customer_email) ||
      ''

    const newOrder: Order = {
      productId: product._id!,
      productTitle: product.title,
      productPrice: product.price,
      userId: currentUserId,
      buyerEmail,
      buyerName,
      status: 'paid',
      createdAt: new Date(),
      updatedAt: new Date(),
      stripeSessionId: session.id,
    }

    const insertResult = await ordersCollection.insertOne(newOrder)

    await productsCollection.updateOne(
      { _id: product._id },
      { $inc: { sales: 1 } },
    )

    return NextResponse.json({
      success: true,
      orderId: insertResult.insertedId.toString(),
      productTitle: newOrder.productTitle,
    })
  } catch (error) {
    console.error('[orders/by-session] Error:', error)
    return NextResponse.json(
      { error: 'Failed to resolve order by session' },
      { status: 500 },
    )
  }
}


