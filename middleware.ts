import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const ref = searchParams.get('ref')

  const productMatch = pathname.match(/^\/produto\/([^/]+)$/)
  if (productMatch && ref) {
    const slug = productMatch[1]
    const url = new URL('/api/affiliate/click', request.url)
    url.searchParams.set('ref', ref)
    url.searchParams.set('slug', slug)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/produto/:slug*',
}
