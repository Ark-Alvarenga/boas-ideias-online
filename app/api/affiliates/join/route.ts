import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import type { Product, User, Affiliate } from '@/lib/types'
import { authConfig, verifySessionToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { ObjectId } from 'mongodb'

interface JoinBody {
  productId: string
}

export async function POST(request: Request) {
  try {
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

    const body = (await request.json()) as JoinBody
    const productId = body.productId
    if (!productId || !ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: 'Invalid productId' },
        { status: 400 },
      )
    }

    const userId = new ObjectId(payload.userId)
    const productObjectId = new ObjectId(productId)

    const db = await getDatabase()
    const productsCollection = db.collection<Product>('products')
    const affiliatesCollection = db.collection<Affiliate>('affiliates')

    const product = await productsCollection.findOne({
      _id: productObjectId,
      status: 'active',
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 },
      )
    }

    if (!product.affiliateEnabled) {
      return NextResponse.json(
        { error: 'Affiliate program is not enabled for this product' },
        { status: 400 },
      )
    }

    if (product.creatorId.equals(userId)) {
      return NextResponse.json(
        { error: 'You cannot be an affiliate of your own product' },
        { status: 400 },
      )
    }

    const existing = await affiliatesCollection.findOne({
      userId,
      productId: productObjectId,
    })
    if (existing) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      const affiliateLink = `${baseUrl}/produto/${product.slug}?ref=${payload.userId}`
      return NextResponse.json({
        success: true,
        alreadyJoined: true,
        affiliateLink,
        message: 'Already an affiliate',
      })
    }

    const commissionPercent =
      product.affiliateCommissionPercent ?? 0

    const newAffiliate: Affiliate = {
      userId,
      productId: productObjectId,
      commissionPercent,
      createdAt: new Date(),
    }

    await affiliatesCollection.insertOne(newAffiliate)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const affiliateLink = `${baseUrl}/produto/${product.slug}?ref=${payload.userId}`

    return NextResponse.json({
      success: true,
      affiliateLink,
      commissionPercent,
    })
  } catch (error) {
    console.error('Affiliate join error:', error)
    return NextResponse.json(
      { error: 'Failed to join affiliate program' },
      { status: 500 },
    )
  }
}
