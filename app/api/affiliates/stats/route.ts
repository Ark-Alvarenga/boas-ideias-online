import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import type { Affiliate, AffiliateClick, AffiliateSale, Product } from '@/lib/types'
import { authConfig, verifySessionToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { ObjectId } from 'mongodb'
import { getBaseUrl } from '@/lib/utils'

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
    const affiliatesCollection = db.collection<Affiliate>('affiliates')
    const clicksCollection = db.collection<AffiliateClick>('affiliateClicks')
    const salesCollection = db.collection<AffiliateSale>('affiliateSales')
    const productsCollection = db.collection<Product>('products')

    const affiliates = await affiliatesCollection
      .find({ userId })
      .toArray()

    const productIds = affiliates.map((a) => a.productId)
    const products =
      productIds.length > 0
        ? await productsCollection
            .find({ _id: { $in: productIds } })
            .toArray()
        : []
    const productsById = new Map(products.map((p) => [p._id!.toString(), p]))

    const affiliateIds = affiliates.map((a) => a._id!)
    const [clicksPerAffiliate, salesPerAffiliate] = await Promise.all([
      clicksCollection.aggregate<{ _id: ObjectId; count: number }>([
        { $match: { affiliateId: { $in: affiliateIds } } },
        { $group: { _id: '$affiliateId', count: { $sum: 1 } } },
      ]).toArray(),
      salesCollection.aggregate<{ _id: ObjectId; count: number; totalCommission: number }>([
        { $match: { affiliateId: { $in: affiliateIds } } },
        {
          $group: {
            _id: '$affiliateId',
            count: { $sum: 1 },
            totalCommission: { $sum: '$commissionAmount' },
          },
        },
      ]).toArray(),
    ])

    const clicksMap = new Map(clicksPerAffiliate.map((c) => [c._id.toString(), c.count]))
    const salesMap = new Map(
      salesPerAffiliate.map((s) => [s._id.toString(), { count: s.count, totalCommission: s.totalCommission }]),
    )

    const baseUrl = getBaseUrl()
    const rows = affiliates.map((aff) => {
      const product = productsById.get(aff.productId.toString())
      const slug = product?.slug ?? ''
      const link = `${baseUrl}/produto/${slug}?ref=${payload.userId}`
      const clicks = clicksMap.get(aff._id!.toString()) ?? 0
      const salesData = salesMap.get(aff._id!.toString()) ?? { count: 0, totalCommission: 0 }
      return {
        affiliateId: aff._id!.toString(),
        productId: aff.productId.toString(),
        productTitle: product?.title ?? '',
        productSlug: slug,
        affiliateLink: link,
        clicks,
        sales: salesData.count,
        totalCommission: salesData.totalCommission,
        commissionPercent: aff.commissionPercent,
      }
    })

    const totalClicks = rows.reduce((s, r) => s + r.clicks, 0)
    const totalSales = rows.reduce((s, r) => s + r.sales, 0)
    const totalEarnings = rows.reduce((s, r) => s + r.totalCommission, 0)

    return NextResponse.json({
      rows,
      totalClicks,
      totalSales,
      totalEarnings,
    })
  } catch (error) {
    console.error('Affiliate stats error:', error)
    return NextResponse.json(
      { error: 'Failed to load affiliate stats' },
      { status: 500 },
    )
  }
}
