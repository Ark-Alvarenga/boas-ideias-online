import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authConfig, verifySessionToken, getUserById } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(authConfig.cookieName)?.value

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const payload = verifySessionToken(token)
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const user = await getUserById(payload.userId)
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id!.toString(),
        name: user.name,
        email: user.email,
        bio: user.bio || '',
      },
    })
  } catch (error) {
    console.error('Error in me:', error)
    return NextResponse.json(
      { error: 'Failed to load user' },
      { status: 500 },
    )
  }
}

