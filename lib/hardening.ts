import { ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/mongodb'
import type { UserTransaction } from '@/lib/types'

export async function getUserPendingBalance(userId: string | ObjectId): Promise<number> {
  const db = await getDatabase()
  const userTransactionsCollection = db.collection<UserTransaction>('userTransactions')

  const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId

  const pendingTransactions = await userTransactionsCollection.find({
    userId: userObjectId,
    status: 'pending'
  }).toArray()

  let sumCents = 0
  for (const tx of pendingTransactions) {
    if (tx.type === 'sale' || tx.type === 'affiliate_commission') {
      sumCents += tx.amountCents
    } else if (tx.type === 'payout') {
      // Payouts should strictly only sit in 'paid' status, but if a 'pending' payout existed, it would deduct.
      // Currently, we don't hold payouts in pending state (they either succeed or rollback).
    }
  }

  return sumCents
}
