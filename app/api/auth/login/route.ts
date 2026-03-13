import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDatabase } from '@/lib/mongodb'
import type { User } from '@/lib/types'
import { authConfig, createSessionToken, verifyPassword } from '@/lib/auth'

interface LoginBody {
  email: string
  password: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody
    const email = body.email?.toLowerCase().trim()
    const password = body.password

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const users = db.collection<User>('users')

    const user = await users.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 },
      )
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 },
      )
    }

    const token = createSessionToken(user._id!.toString())
    const cookieStore = cookies()
    cookieStore.set(authConfig.cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: authConfig.ttlSeconds,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user._id!.toString(),
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Error in login:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 },
    )
  }
}

