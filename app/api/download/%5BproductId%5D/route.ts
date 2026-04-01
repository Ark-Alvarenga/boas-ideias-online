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
  params: Promise<{ productId: string }>
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { productId } = await context.params
    
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'ID de produto inválido' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const token = cookieStore.get(authConfig.cookieName)?.value
    if (!token) {
      return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 })
    }

    const payload = verifySessionToken(token)
    if (!payload || !ObjectId.isValid(payload.userId)) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
    }

    const userId = new ObjectId(payload.userId)
    const db = await getDatabase()
    
    // 1. Get Product
    const product = await db.collection<Product>('products').findOne({ _id: new ObjectId(productId) })
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // 2. Auth Check: Is Creator OR Has Paid Order?
    const isCreator = product.creatorId.equals(userId)
    let hasPurchased = false

    if (!isCreator) {
      const order = await db.collection<Order>('orders').findOne({
        productId: product._id,
        userId: userId,
        status: 'paid'
      })
      if (order) hasPurchased = true
    }

    if (!isCreator && !hasPurchased) {
      return NextResponse.json(
        { error: 'Você não tem permissão para baixar este arquivo' },
        { status: 403 }
      )
    }

    if (!product.pdfUrl) {
      return NextResponse.json({ error: 'Arquivo não disponível' }, { status: 404 })
    }

    // 3. Generate Signed URL
    const bucket = process.env.AWS_S3_BUCKET || process.env.AWS_BUCKET_NAME
    if (!bucket) throw new Error('S3 bucket not configured')

    const url = new URL(product.pdfUrl)
    const key = url.pathname.replace(/^\/+/, '')

    const command = new GetObjectCommand({ Bucket: bucket, Key: key })
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 })

    return NextResponse.json({ downloadUrl: signedUrl })
  } catch (error) {
    console.error('[Download Secure] Error:', error)
    return NextResponse.json({ error: 'Erro ao processar download' }, { status: 500 })
  }
}
