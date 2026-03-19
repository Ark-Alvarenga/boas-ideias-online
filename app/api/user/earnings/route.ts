import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import type { User, UserTransaction } from '@/lib/types'
import { authConfig, verifySessionToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(authConfig.cookieName)?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = verifySessionToken(token)
    if (!payload || !ObjectId.isValid(payload.userId)) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>('users')
    const userTransactionsCollection = db.collection<UserTransaction>('userTransactions')

    const user = await usersCollection.findOne({ _id: new ObjectId(payload.userId) })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const transactions = await userTransactionsCollection
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()
      
    console.log("USER TRANSACTIONS", transactions)

    return NextResponse.json({
      pendingBalance: (user.pendingBalanceCents || 0) / 100,
      totalEarnings: (user.totalEarningsCents || 0) / 100,
      payoutProcessing: user.payoutProcessing || false,
      transactions: transactions.map(tx => ({
        id: tx._id?.toString(),
        amount: tx.amountCents / 100,
        type: tx.type,
        status: tx.status,
        date: tx.createdAt
      }))
    })
  } catch (error) {
    console.error('Error fetching user earnings:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
