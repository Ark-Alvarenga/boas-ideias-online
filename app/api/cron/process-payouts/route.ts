import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/mongodb'
import type { User } from '@/lib/types'
import { processUserPayout } from '@/lib/payouts'

export async function GET(request: Request) {
  try {
    // SECURITY: Require Bearer CRON_SECRET header
    const authHeader = request.headers.get('authorization')
    
    if (!process.env.CRON_SECRET) {
      console.error('[CRON ERROR] Missing CRON_SECRET environment variable!');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    const expectedToken = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>('users')

    const salesCollection = db.collection('sales')

    // Include users mapped by any pending payout status to correctly heal invisible sums
    const pendingCreatorIds = await salesCollection.distinct("creatorId", { creatorPayoutStatus: "pending", creatorId: { $ne: null } });
    const pendingAffiliateIds = await salesCollection.distinct("affiliateUserId", { affiliatePayoutStatus: "pending", affiliateUserId: { $ne: null } });
    const pendingReferrerIds = await salesCollection.distinct("referrerUserId", { referralPayoutStatus: "pending", referrerUserId: { $ne: null } });

    const combinedSet = new Set<string>()
    pendingCreatorIds.forEach(id => combinedSet.add(id.toString()))
    pendingAffiliateIds.forEach(id => combinedSet.add(id.toString()))
    pendingReferrerIds.forEach(id => combinedSet.add(id.toString()))

    const uniqueObjIds = Array.from(combinedSet).map(id => new ObjectId(id))

    // Find users ready for payout, incorporating self-healing checks on missing balances
    // CRITICAL FIX: Ensure ALL users with pendingBalanceCents > 0 are considered.
    const pendingUsers = await usersCollection.find({
      $or: [
        { _id: { $in: uniqueObjIds } },
        { pendingBalanceCents: { $gt: 0 } }
      ],
      stripeAccountId: { $exists: true, $type: 'string' },
      stripeOnboardingComplete: true,
      payoutLockedAt: { $exists: false } // Only process unlocked users
    }).toArray()

    let processedCount = 0
    let failureCount = 0

    // Process payouts synchronously or via Promise.all.
    // For large scale, sequential processing prevents Stripe rate limit hits.
    for (const user of pendingUsers) {
      const success = await processUserPayout(user._id!)
      if (success) {
        processedCount++
      } else {
        failureCount++
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      failed: failureCount,
      totalPendingUsers: pendingUsers.length
    })
  } catch (error) {
    console.error('Error running process-payouts cron:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
