import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { Sale } from '@/lib/types'
import { authConfig, verifySessionToken } from '@/lib/auth'

// GET /api/sales/summary — Aggregated revenue summary for the authenticated creator
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

    const pipeline = [
      { $match: { creatorId: userId, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenueCents: { $sum: '$totalAmountCents' },
          totalCreatorShareCents: { $sum: '$creatorShareCents' },
          totalPlatformFeeCents: { $sum: '$platformFeeCents' },
          totalAffiliateShareCents: { $sum: '$affiliateShareCents' },
        },
      },
    ]

    const result = await salesCollection.aggregate(pipeline).toArray()
    const summary = result[0] ?? {
      totalSales: 0,
      totalRevenueCents: 0,
      totalCreatorShareCents: 0,
      totalPlatformFeeCents: 0,
      totalAffiliateShareCents: 0,
    }

    // Remove the _id field from the aggregate result
    const { _id, ...data } = summary

    return NextResponse.json(data)
  } catch (error) {
    console.error('[Sales:Summary] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales summary' },
      { status: 500 },
    )
  }
}
