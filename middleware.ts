import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AFFILIATE_REF_COOKIE } from '@/lib/affiliate'
import { ObjectId } from 'mongodb' // To validate if ref looks like an ID

// Simple in-memory rate limiting (works per-isolate edge/node)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record) {
    rateLimitMap.set(ip, { count: 1, lastReset: now })
    return true
  }
  
  if (now - record.lastReset > windowMs) {
    record.count = 1
    record.lastReset = now
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // --- 1. Rate Limiting ---
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown-ip'
  // Higher limit for GET (pages often fire many parallel fetches),
  // stricter for state-changing requests.
  const limit = request.method === 'GET' ? 60 : 10
  if (!checkRateLimit(ip, limit, 1000)) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  // --- 2. CSRF Protection for state-changing API routes ---
  if (['POST', 'PATCH', 'DELETE', 'PUT'].includes(request.method)) {
    // Exclude Stripe webhook from CSRF check (it uses its own signature validation)
    if (!pathname.startsWith('/api/webhooks/stripe') && pathname.startsWith('/api/')) {
      const origin = request.headers.get('origin')
      const host = request.headers.get('host')
      
      // If there is an origin, it must match the host
      if (origin) {
        try {
          const originHost = new URL(origin).host
          if (originHost !== host) {
            console.warn(`[CSRF] Blocked cross-origin request from ${origin} to ${host}`)
            return new NextResponse('CSRF Check Failed', { status: 403 })
          }
        } catch {
          return new NextResponse('Invalid Origin', { status: 400 })
        }
      }
    }
  }

  // --- 3. Affiliate Links ---
  // Catch '?ref=xxx' on *any* page load (e.g. /checkout/[slug]?ref=xxx)
  // and set the cookie directly so it's not lost.
  const ref = searchParams.get('ref')
  let response = NextResponse.next()

  if (ref && /^[a-fA-F0-9]{24}$/.test(ref)) {
    // Only set if valid ObjectId format
    response.cookies.set(AFFILIATE_REF_COOKIE, ref, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
