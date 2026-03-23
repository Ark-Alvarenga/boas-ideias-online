import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import type { Product, Affiliate, AffiliateClick } from '@/lib/types'
import { AFFILIATE_REF_COOKIE } from '@/lib/affiliate'
import { ObjectId } from 'mongodb'

const COOKIE_MAX_AGE_DAYS = 30

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ref = searchParams.get('ref')
  const slug = searchParams.get('slug')

  if (!ref || !slug) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!ObjectId.isValid(ref)) {
    return NextResponse.redirect(new URL(`/produto/${slug}`, request.url))
  }

  const refUserId = new ObjectId(ref)

  try {
    const db = await getDatabase()
    const productsCollection = db.collection<Product>('products')
    const affiliatesCollection = db.collection<Affiliate>('affiliates')
    const clicksCollection = db.collection<AffiliateClick>('affiliateClicks')

    const product = await productsCollection.findOne({
      slug,
      status: 'active',
    })

    if (!product) {
      return NextResponse.redirect(new URL(`/produto/${slug}`, request.url))
    }

    const affiliate = await affiliatesCollection.findOne({
      userId: refUserId,
      productId: product._id!,
    })

    if (!affiliate) {
      return NextResponse.redirect(new URL(`/produto/${slug}`, request.url))
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'unknown'
    const userAgent = request.headers.get('user-agent') ?? ''

    // Dedup: skip if same (ip, affiliateId, productId) within the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentClick = await clicksCollection.findOne({
      affiliateId: affiliate._id!,
      productId: product._id!,
      ip,
      createdAt: { $gte: oneHourAgo },
    })

    if (!recentClick) {
      const clickDoc: AffiliateClick = {
        affiliateId: affiliate._id!,
        productId: product._id!,
        refUserId,
        ip,
        userAgent,
        createdAt: new Date(),
      }
      await clicksCollection.insertOne(clickDoc)
    }

    const redirectUrl = new URL(`/produto/${slug}`, request.url)
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set(AFFILIATE_REF_COOKIE, ref, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error('Affiliate click error:', error)
    return NextResponse.redirect(new URL(`/produto/${slug}`, request.url))
  }
}
