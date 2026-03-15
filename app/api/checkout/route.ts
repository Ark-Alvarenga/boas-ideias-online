import { NextResponse } from 'next/server'
import type StripeType from 'stripe'
import { getDatabase } from '@/lib/mongodb'
import type { Product, User, Affiliate } from '@/lib/types'
import { authConfig, verifySessionToken } from '@/lib/auth'
import { AFFILIATE_REF_COOKIE } from '@/lib/affiliate'
import { cookies } from 'next/headers'
import { ObjectId } from 'mongodb'

let stripe: StripeType | null = null

function getStripe(): StripeType {
  if (!stripe) {
    const Stripe = require('stripe') as typeof StripeType
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripe = new Stripe(secretKey, {
      apiVersion: '2024-06-20',
    })
  }
  return stripe
}

interface CheckoutBody {
  productId: string
  buyerName?: string
  buyerEmail?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody
    const { productId, buyerEmail, buyerName } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing productId' },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const productsCollection = db.collection<Product>('products')

    const product = await productsCollection.findOne({
      _id: new ObjectId(productId),
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 },
      )
    }

    if (product.status !== 'active') {
      return NextResponse.json(
        { error: 'This product is not available for purchase.' },
        { status: 400 },
      )
    }

    // Resolve current user (required for metadata)
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

    const usersCollection = db.collection<User>('users')
    const buyer = await usersCollection.findOne({
      _id: new ObjectId(payload.userId),
    })
    if (!buyer) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 },
      )
    }

    if (product.creatorId && product.creatorId.equals(buyer._id!)) {
      return NextResponse.json(
        { error: 'You cannot purchase your own product.' },
        { status: 400 },
      )
    }

    const creator = await usersCollection.findOne({
      _id: product.creatorId,
    })
    if (!creator) {
      return NextResponse.json(
        { error: 'Product creator not found' },
        { status: 404 },
      )
    }

    let affiliateUserId: string | null = null
    const affiliateRefCookie = cookieStore.get(AFFILIATE_REF_COOKIE)?.value
    if (affiliateRefCookie && ObjectId.isValid(affiliateRefCookie)) {
      const affiliateUserIdObj = new ObjectId(affiliateRefCookie)
      if (!affiliateUserIdObj.equals(buyer._id!)) {
        const affiliatesCollection = db.collection<Affiliate>('affiliates')
        const affiliate = await affiliatesCollection.findOne({
          userId: affiliateUserIdObj,
          productId: product._id!,
        })
        if (affiliate && product.affiliateEnabled) {
          affiliateUserId = affiliateRefCookie
        }
      }
    }

    const origin =
      request.headers.get('origin') ??
      process.env.NEXT_PUBLIC_APP_URL ??
      'http://localhost:3000'

    const stripeClient = getStripe()
    const unitAmountCents = Math.round(product.price * 100)
    const platformFeePercent = Math.min(
      100,
      Math.max(0, Number(process.env.PLATFORM_FEE_PERCENT) || 0),
    )
    const platformFeeCents = Math.round(
      (unitAmountCents * platformFeePercent) / 100,
    )

    const sessionParams: StripeType.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'brl',
            unit_amount: unitAmountCents,
            product_data: {
              name: product.title,
              description: product.description.slice(0, 200),
            },
          },
        },
      ],
      customer_email: buyerEmail || buyer.email,
      metadata: {
        productId: product._id!.toString(),
        userId: buyer._id!.toString(),
        buyerName: buyerName || buyer.name,
        ...(affiliateUserId && { affiliateUserId }),
      },
      success_url: `${origin}/dashboard`,
      cancel_url: `${origin}/produto/${product.slug}`,
    }

    if (creator.stripeAccountId && platformFeeCents < unitAmountCents) {
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: creator.stripeAccountId,
        },
      }
    }

    const session = await stripeClient.checkout.sessions.create(sessionParams)

    return NextResponse.json(
      {
        success: true,
        id: session.id,
        url: session.url,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    )
  }
}

