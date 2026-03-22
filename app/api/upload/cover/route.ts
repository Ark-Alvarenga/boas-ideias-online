import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import { cookies } from 'next/headers'
import { authConfig, verifySessionToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

const MAX_COVER_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export const runtime = 'nodejs'

export async function POST(request: Request) {
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

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Missing file' },
        { status: 400 },
      )
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Apenas arquivos PNG, JPG e WEBP são permitidos' },
        { status: 400 },
      )
    }

    if (file.size > MAX_COVER_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File too large (max 10MB)' },
        { status: 400 },
      )
    }

    const bucket = process.env.AWS_S3_BUCKET
    const region = process.env.AWS_REGION

    if (!bucket || !region) {
      return NextResponse.json(
        { error: 'S3 is not configured' },
        { status: 500 },
      )
    }

    const userId = payload.userId
    const extension = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
    const key = `products/${userId}/covers/${Date.now()}-${randomUUID()}.${extension}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    )

    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        key,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error uploading cover image to S3:', error)
    return NextResponse.json(
      { error: 'Failed to upload cover image' },
      { status: 500 },
    )
  }
}

