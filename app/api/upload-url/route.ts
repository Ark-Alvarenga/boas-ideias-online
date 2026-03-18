import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { cookies } from 'next/headers'
import { authConfig, verifySessionToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50MB limit as requested

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    const contentType = searchParams.get('contentType')
    const sizeStr = searchParams.get('size')

    if (!filename || !contentType || !sizeStr) {
      return NextResponse.json(
        { error: 'Missing required query parameters (filename, contentType, size)' },
        { status: 400 }
      )
    }

    if (contentType !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files (application/pdf) are allowed' },
        { status: 400 }
      )
    }

    const size = parseInt(sizeStr, 10)
    if (isNaN(size) || size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

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

    const bucket = process.env.AWS_S3_BUCKET || process.env.AWS_BUCKET_NAME
    const region = process.env.AWS_REGION

    if (!bucket || !region) {
      return NextResponse.json(
        { error: 'S3 is not configured' },
        { status: 500 },
      )
    }

    // Sanitize filename: convert to lowercase, remove accents, leave alphanumeric and dots/dashes
    const sanitizedFilename = filename
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9.-]/g, '_')

    const userId = payload.userId
    const key = `products/${userId}/${Date.now()}-${sanitizedFilename}`

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      // Metadata could be added here if needed
    })

    // URL expires in 15 minutes
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 })
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`

    return NextResponse.json(
      {
        success: true,
        url: signedUrl,
        key,
        publicUrl,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 },
    )
  }
}
