import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import type { User } from './types'
import { ObjectId } from 'mongodb'
import { getDatabase } from './mongodb'

const SESSION_COOKIE_NAME = 'session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

export const authConfig = {
  cookieName: SESSION_COOKIE_NAME,
  ttlSeconds: SESSION_TTL_SECONDS,
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET is not set')
  }
  return secret
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

interface SessionPayload {
  userId: string
  exp: number
}

export function createSessionToken(userId: string): string {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  }

  const secret = getAuthSecret()
  const base = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto
    .createHmac('sha256', secret)
    .update(base)
    .digest('base64url')

  return `${base}.${signature}`
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [base, signature] = token.split('.')
    if (!base || !signature) return null

    const secret = getAuthSecret()
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(base)
      .digest('base64url')

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null
    }

    const payload = JSON.parse(
      Buffer.from(base, 'base64url').toString('utf8'),
    ) as SessionPayload

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  const db = await getDatabase()
  const users = db.collection<User>('users')
  const user = await users.findOne({ _id: new ObjectId(userId) })
  return user ?? null
}

