import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDatabase } from '@/lib/mongodb'
import type { User } from '@/lib/types'
import { authConfig, createSessionToken, hashPassword } from '@/lib/auth'
import crypto from 'crypto'

interface RegisterBody {
  name: string
  email: string
  password: string
  ref?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody
    const name = body.name?.trim()
    const email = body.email?.toLowerCase().trim()
    const password = body.password

    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json(
        { error: 'Invalid data. Password must be at least 6 characters.' },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const users = db.collection<User>('users')

    const existing = await users.findOne({ email })
    if (existing) {
      return NextResponse.json(
        { error: 'Email already in use.' },
        { status: 409 },
      )
    }

    let referredBy;
    if (body.ref) {
      const referrer = await users.findOne({ referralCode: body.ref });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    const referralCode = crypto.randomBytes(5).toString('hex');

    const passwordHash = await hashPassword(password)

    const now = new Date()
    const newUser: User = {
      name,
      email,
      passwordHash,

      // 🔥 DEFAULTS CRÍTICOS (OBRIGATÓRIO)
      pendingBalanceCents: 0,
      totalEarningsCents: 0,
      payoutProcessing: false,
      stripeOnboardingComplete: false,
      stripeAccountId: undefined,
      referralCode,
      referredBy,

      createdAt: now,
      updatedAt: now,
    }

    const result = await users.insertOne(newUser)

    const token = createSessionToken(result.insertedId.toString())
    const cookieStore = await cookies()
    cookieStore.set(authConfig.cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: authConfig.ttlSeconds,
    })

    return NextResponse.json(
      {
        success: true,
        user: {
          id: result.insertedId.toString(),
          name,
          email,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error in register:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 },
    )
  }
}

