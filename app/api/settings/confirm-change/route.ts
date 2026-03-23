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
    const code = typeof body.code === 'string' ? body.code.trim() : ''

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
    }

    const db = await getDatabase()
    const pendingChanges = db.collection('pending_changes')
    const users = db.collection('users')

    // Find valid pending change
    const pending = await pendingChanges.findOne({
      userId: new ObjectId(payload.userId),
      code,
      expiresAt: { $gt: new Date() },
    })

    if (!pending) {
      return NextResponse.json(
        { error: 'Código inválido ou expirado. Solicite um novo código.' },
        { status: 400 },
      )
    }

    // Apply the change
    if (pending.type === 'name') {
      await users.updateOne(
        { _id: new ObjectId(payload.userId) },
        { $set: { name: pending.newName, updatedAt: new Date() } },
      )
    } else if (pending.type === 'password') {
      await users.updateOne(
        { _id: new ObjectId(payload.userId) },
        { $set: { passwordHash: pending.newPasswordHash, updatedAt: new Date() } },
      )
    }

    // Clean up
    await pendingChanges.deleteMany({
      userId: new ObjectId(payload.userId),
      type: pending.type,
    })

    return NextResponse.json({ success: true, type: pending.type })
  } catch (error) {
    console.error('Error confirming change:', error)
    return NextResponse.json({ error: 'Falha ao confirmar alteração' }, { status: 500 })
  }
}
