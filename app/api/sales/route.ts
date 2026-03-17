import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { Sale } from '@/lib/types'
import { authConfig, verifySessionToken } from '@/lib/auth'

// GET /api/sales — List sales for the authenticated creator
export async function GET(request: Request) {
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
    const { searchParams } = new URL(request.url)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = Math.max(0, parseInt(searchParams.get('skip') || '0'))
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const db = await getDatabase()
    const salesCollection = db.collection<Sale>('sales')

    const query: Record<string, unknown> = { creatorId: userId }

    // Optional date range filter
    if (from || to) {
      const dateFilter: Record<string, Date> = {}
      if (from) dateFilter.$gte = new Date(from)
      if (to) dateFilter.$lte = new Date(to)
      query.createdAt = dateFilter
    }

    const [sales, total] = await Promise.all([
      salesCollection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      salesCollection.countDocuments(query),
    ])

    return NextResponse.json({
      sales: sales.map((s) => ({
        ...s,
        _id: s._id?.toString(),
        orderId: s.orderId?.toString(),
        productId: s.productId?.toString(),
        buyerId: s.buyerId?.toString(),
        creatorId: s.creatorId?.toString(),
        affiliateUserId: s.affiliateUserId?.toString() ?? null,
      })),
      total,
      hasMore: skip + limit < total,
    })
  } catch (error) {
    console.error('[Sales:GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 },
    )
  }
}
