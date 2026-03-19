import { NextResponse } from 'next/server'
import type StripeType from 'stripe'
import { getDatabase } from '@/lib/mongodb'
import type { Product, User, Affiliate } from '@/lib/types'
import { authConfig, verifySessionToken } from '@/lib/auth'
import { AFFILIATE_REF_COOKIE } from '@/lib/affiliate'
import { getStripe } from '@/lib/stripe'
import { checkoutSchema } from '@/lib/schema'
import { resolvePriceCents } from '@/lib/currency'
import { cookies } from 'next/headers'
import { ObjectId } from 'mongodb'
import { randomUUID } from 'crypto'

import { getBaseUrl } from '@/lib/utils'

interface CheckoutBody {
  productId: string
  buyerName?: string
  buyerEmail?: string
  ref?: string
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json()
    const parseResult = checkoutSchema.safeParse(rawBody)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid checkout data', details: parseResult.error.errors },
        { status: 400 },
      )
    }

    const { productId, buyerEmail, buyerName, ref } = parseResult.data

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

    // Removed block: allow checkout even if creator has not completed Stripe onboarding

    // Check for affiliate ref (from body directly, or fallback to cookie from middleware)
    let affiliateUserId: string | null = null
    const affiliateRefCookie = ref || cookieStore.get(AFFILIATE_REF_COOKIE)?.value
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
      request.headers.get('origin') ?? getBaseUrl()

    const stripeClient = getStripe()
    const unitAmountCents = resolvePriceCents(product)

    if (unitAmountCents <= 0) {
      return NextResponse.json(
        { error: 'Invalid product price' },
        { status: 400 },
      )
    }

    // Separate Charges and Transfers model:
    // Platform collects 100% of the payment.
    // Transfers to creator (and optionally affiliate) happen in the webhook.
    //
    // A unique transfer_group is generated upfront and set on the
    // PaymentIntent so that every transfer created in the webhook
    // shares the same group — this lets Stripe link the original
    // charge to all downstream transfers.
    const transferGroup = `tg_${randomUUID()}`

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
      payment_intent_data: {
        transfer_group: transferGroup,
      },
      metadata: {
        productId: product._id!.toString(),
        userId: buyer._id!.toString(),
        buyerName: buyerName || buyer.name,
        creatorId: product.creatorId.toString(),
        transferGroup,
        ...(affiliateUserId && { affiliateUserId }),
      },
      success_url: `${origin}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/produto/${product.slug}`,
    }

    const session = await stripeClient.checkout.sessions.create(sessionParams)

    console.log('[Checkout:POST]', JSON.stringify({ 
      action: 'checkout_session_created', 
      productId: product._id!.toString(), 
      userId: buyer._id!.toString(), 
      creatorStripeAccountId: creator.stripeAccountId,
      amount: unitAmountCents, 
      sessionId: session.id, 
      transferGroup,
      timestamp: new Date().toISOString() 
    }))

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
