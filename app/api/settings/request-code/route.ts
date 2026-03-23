import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authConfig, verifySessionToken, verifyPassword, hashPassword, getUserById } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendMailgunEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.NEXT_PUBLIC_MAILGUN_API
  const domain = process.env.NEXT_PUBLIC_MAILGUN_DOMAIN
  const from = process.env.NEXT_PUBLIC_EMAIL_USERNAME

  if (!apiKey || !domain || !from) {
    throw new Error('Mailgun environment variables not configured')
  }

  const formData = new FormData()
  formData.append('from', from)
  formData.append('to', to)
  formData.append('subject', subject)
  formData.append('html', html)

  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Mailgun error:', errorText)
    throw new Error('Failed to send email')
  }

  return response.json()
}

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

    const user = await getUserById(payload.userId)
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { type } = body // "name" | "password"

    if (type !== 'name' && type !== 'password') {
      return NextResponse.json({ error: 'Tipo de alteração inválido' }, { status: 400 })
    }

    const db = await getDatabase()
    const pendingChanges = db.collection('pending_changes')

    // Build the pending change document
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pendingDoc: Record<string, any> = {
      userId: new ObjectId(payload.userId),
      code,
      type,
      expiresAt,
      createdAt: new Date(),
    }

    if (type === 'name') {
      const newName = typeof body.newName === 'string' ? body.newName.trim() : ''
      if (newName.length < 2 || newName.length > 100) {
        return NextResponse.json(
          { error: 'O nome deve ter entre 2 e 100 caracteres' },
          { status: 400 },
        )
      }
      pendingDoc.newName = newName
    }

    if (type === 'password') {
      const { currentPassword, newPassword } = body

      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: 'Senhas atual e nova são obrigatórias' },
          { status: 400 },
        )
      }

      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return NextResponse.json(
          { error: 'A nova senha deve ter pelo menos 6 caracteres' },
          { status: 400 },
        )
      }

      const isValid = await verifyPassword(currentPassword, user.passwordHash)
      if (!isValid) {
        return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 403 })
      }

      pendingDoc.newPasswordHash = await hashPassword(newPassword)
    }

    // Remove any existing pending changes for this user + type
    await pendingChanges.deleteMany({
      userId: new ObjectId(payload.userId),
      type,
    })

    await pendingChanges.insertOne(pendingDoc)

    // Send email
    const actionLabel = type === 'name' ? 'alteração de nome' : 'alteração de senha'

    await sendMailgunEmail(
      user.email,
      `Código de confirmação — ${actionLabel}`,
      `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
        <h2 style="color: #111827; margin-bottom: 8px;">Código de Confirmação</h2>
        <p style="color: #6b7280; font-size: 14px;">Você solicitou uma ${actionLabel} na sua conta Boas Ideias.</p>
        <div style="background: #111827; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 8px; text-align: center; padding: 24px; border-radius: 8px; margin: 24px 0;">
          ${code}
        </div>
        <p style="color: #6b7280; font-size: 13px;">Este código expira em <strong>10 minutos</strong>.</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">Se você não solicitou esta alteração, ignore este e-mail.</p>
      </div>
      `,
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error requesting code:', error)
    return NextResponse.json({ error: 'Falha ao enviar código de verificação' }, { status: 500 })
  }
}
