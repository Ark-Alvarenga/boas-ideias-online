import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authConfig } from '@/lib/auth'

export async function POST() {
  try {
    const cookieStore = cookies()
    cookieStore.set(authConfig.cookieName, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in logout:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 },
    )
  }
}

