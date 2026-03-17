import { NextResponse } from 'next/server'
import type StripeType from 'stripe'
import { getDatabase } from '@/lib/mongodb'
import type { User } from '@/lib/types'
import { authConfig, verifySessionToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { ObjectId } from 'mongodb'
import { getStripe } from '@/lib/stripe'

export async function POST() {
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

    const stripeClient = getStripe()
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    let stripeAccountId = user.stripeAccountId

    if (!stripeAccountId) {
      const account = await stripeClient.accounts.create({
        type: 'express',
        email: user.email,
      })
      stripeAccountId = account.id

      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            stripeAccountId,
            updatedAt: new Date(),
          },
        },
      )
    }

    const accountLink = await stripeClient.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/dashboard`,
      return_url: `${baseUrl}/dashboard`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      success: true,
      stripeAccountId,
      onboardingUrl: accountLink.url,
    })
  } catch (error) {
    console.error('Stripe Connect create-account error:', error)
    return NextResponse.json(
      { error: 'Failed to create Stripe Connect account' },
      { status: 500 },
    )
  }
}
