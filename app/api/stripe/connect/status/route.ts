import { NextResponse } from 'next/server'
import type StripeType from 'stripe'
import { getDatabase } from '@/lib/mongodb'
import type { User } from '@/lib/types'
import { authConfig, verifySessionToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { ObjectId } from 'mongodb'

let stripe: StripeType | null = null

function getStripe(): StripeType {
  if (!stripe) {
    const Stripe = require('stripe') as typeof StripeType
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not set')
    stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' })
  }
  return stripe
}

/** GET: Return Stripe Connect status and sync onboarding from Stripe. */
export async function GET() {
  try {
    const cookieStore = cookies()
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
