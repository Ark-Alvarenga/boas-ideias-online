import { NextResponse } from 'next/server'
import type StripeType from 'stripe'
import { getDatabase } from '@/lib/mongodb'
import type { User } from '@/lib/types'
import { authConfig, verifySessionToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { ObjectId } from 'mongodb'
import { getStripe } from '@/lib/stripe'
import { processUserPayout } from '@/lib/payouts'

/** GET: Return Stripe Connect status and sync onboarding from Stripe. */
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

    const db = await getDatabase()
    const usersCollection = db.collection<User>('users')
    const user = await usersCollection.findOne({
      _id: new ObjectId(payload.userId),
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 },
      )
    }

    let stripeAccountId = user.stripeAccountId ?? null
    let stripeOnboardingComplete = user.stripeOnboardingComplete ?? false

    if (stripeAccountId) {
      try {
        const stripeClient = getStripe()
        const account = await stripeClient.accounts.retrieve(stripeAccountId)
        const complete =
          account.details_submitted === true &&
          account.charges_enabled === true
          
        if (complete && !stripeOnboardingComplete) {
          await usersCollection.updateOne(
            { _id: user._id },
            {
              $set: {
                stripeOnboardingComplete: true,
                updatedAt: new Date(),
              },
            },
          )
          stripeOnboardingComplete = true
        }

        // ALWAYS trigger payout if fully connected, have a balance, and StripeAccountId exists (wrapper)
        if (stripeOnboardingComplete && (user.pendingBalanceCents || 0) > 0) {
          console.log("TRIGGERING PAYOUT AFTER CONNECT", user._id)
          // AWAIT payout to prevent Vercel from killing the serverless background promise early
          try {
            await processUserPayout(user._id!)
          } catch (err) {
            console.error('[Stripe Status] Awaited processUserPayout failed:', err)
          }
        }
      } catch (err) {
        console.error('Stripe account retrieve error:', err)
      }
    }

    return NextResponse.json({
      stripeAccountId,
      stripeOnboardingComplete,
    })
  } catch (error) {
    console.error('Stripe Connect status error:', error)
    return NextResponse.json(
      { error: 'Failed to get Stripe Connect status' },
      { status: 500 },
    )
  }
}
