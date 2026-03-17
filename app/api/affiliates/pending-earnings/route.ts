import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { Sale, Product } from '@/lib/types'
import { authConfig, verifySessionToken } from '@/lib/auth'

// GET /api/affiliates/pending-earnings — Show pending (unpaid) affiliate commissions
export async function GET() {
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

    const userId = new ObjectId(payload.userId)
    const db = await getDatabase()
    const salesCollection = db.collection<Sale>('sales')
    const productsCollection = db.collection<Product>('products')

    // Find all sales where this user is the affiliate and payout is pending
    const pendingSales = await salesCollection
      .find({
        affiliateUserId: userId,
        affiliatePayoutStatus: 'pending',
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Find all sales where this user is the affiliate and payout is paid (for total earnings)
    const paidAggregation = await salesCollection.aggregate<{
      _id: null
      totalPaidCents: number
      count: number
    }>([
      { $match: { affiliateUserId: userId, affiliatePayoutStatus: 'paid' } },
      { $group: { _id: null, totalPaidCents: { $sum: '$affiliateShareCents' }, count: { $sum: 1 } } },
    ]).toArray()

    const totalPendingCents = pendingSales.reduce((sum, s) => sum + s.affiliateShareCents, 0)
    const totalPaidCents = paidAggregation[0]?.totalPaidCents ?? 0
    const totalPaidCount = paidAggregation[0]?.count ?? 0

    // Enrich pending sales with product info
    const productIds = [...new Set(pendingSales.map((s) => s.productId.toString()))]
    const products = productIds.length > 0
      ? await productsCollection
          .find({ _id: { $in: productIds.map((id) => new ObjectId(id)) } })
          .toArray()
      : []
    const productsMap = new Map(products.map((p) => [p._id!.toString(), p]))

    const pendingItems = pendingSales.map((s) => {
      const product = productsMap.get(s.productId.toString())
      return {
        saleId: s._id!.toString(),
        productId: s.productId.toString(),
        productTitle: product?.title ?? 'Unknown',
        affiliateShareCents: s.affiliateShareCents,
        createdAt: s.createdAt,
      }
    })

    return NextResponse.json({
      pendingItems,
      totalPendingCents,
      totalPendingCount: pendingSales.length,
      totalPaidCents,
      totalPaidCount,
    })
  } catch (error) {
    console.error('[Affiliates:PendingEarnings] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending earnings' },
      { status: 500 },
    )
  }
}
