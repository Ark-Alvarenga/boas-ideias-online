import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authConfig, verifySessionToken } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(authConfig.cookieName)?.value
    if (!token) {
      return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 })
    }

    const payload = verifySessionToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
    }

    const body = await request.json()
    const bio = typeof body.bio === 'string' ? body.bio.trim().slice(0, 500) : ''

    const db = await getDatabase()
    await db.collection('users').updateOne(
      { _id: new ObjectId(payload.userId) },
      { $set: { bio, updatedAt: new Date() } },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating bio:', error)
    return NextResponse.json({ error: 'Falha ao atualizar biografia' }, { status: 500 })
  }
}
