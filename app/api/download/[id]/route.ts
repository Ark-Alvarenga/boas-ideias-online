import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { Order, Product } from '@/lib/types'
import { cookies } from 'next/headers'
import { authConfig, verifySessionToken } from '@/lib/auth'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

interface RouteContext {
  params: Promise<{ id: string }>
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

// GET /api/download/[id] - Redirect to signed S3 URL for purchased product
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    
    // Validate order ID format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      )
    }

    // Require authentication
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

    const currentUserId = new ObjectId(payload.userId)

    const db = await getDatabase()
    const ordersCollection = db.collection<Order>('orders')
    const productsCollection = db.collection<Product>('products')

    // Find the order
    const order = await ordersCollection.findOne({
      _id: new ObjectId(id),
      status: 'paid',
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or not paid' },
        { status: 404 }
      )
    }

    // Ensure the requester is the buyer associated with this order
    if (!order.userId || !order.userId.equals(currentUserId)) {
      return NextResponse.json(
        { error: 'You are not authorized to download this file' },
        { status: 403 },
      )
    }

    // Get product details
    const product = await productsCollection.findOne({
      _id: order.productId,
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 },
      )
    }

    if (!product.pdfUrl) {
      return NextResponse.json(
        { error: 'No file available for this product' },
        { status: 404 },
      )
    }

    const bucket = process.env.AWS_S3_BUCKET
    const region = process.env.AWS_REGION
    if (!bucket || !region) {
      return NextResponse.json(
        { error: 'Storage not configured' },
        { status: 500 },
      )
    }

    // Assume pdfUrl is of form https://bucket.s3.region.amazonaws.com/key
    const url = new URL(product.pdfUrl)
    const key = url.pathname.replace(/^\/+/, '')

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60,
    })

    // If the client asked for JSON, return a JSON payload instead of redirect
    if (request.headers.get('accept')?.includes('application/json')) {
      return NextResponse.json({
        success: true,
        productTitle: product.title,
        downloadUrl: signedUrl,
      })
    }

    // Default: redirect to the signed URL (browser navigation)
    return NextResponse.redirect(signedUrl)
  } catch (error) {
    console.error('Error processing download:', error)
    return NextResponse.json(
      { error: 'Failed to process download request' },
      { status: 500 }
    )
  }
}
