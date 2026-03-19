import { ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/mongodb'
import type { User, UserTransaction } from '@/lib/types'
import { getStripe } from '@/lib/stripe'
import { recalculateUserBalance } from '@/lib/hardening'

export async function processUserPayout(userId: string | ObjectId): Promise<boolean> {
  const db = await getDatabase()
  const usersCollection = db.collection<User>('users')
  const userTransactionsCollection = db.collection<UserTransaction>('userTransactions')

  const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId

  console.log("PAYOUT START", { userId: userObjectId.toString() })

  // STEP 1: Fetch user
  try {
    const user = await usersCollection.findOne({ _id: userObjectId })
    
    if (!user) {
      console.log("EXIT: NO USER")
      return false
    }

    const { pendingBalanceCents = 0, stripeAccountId, stripeOnboardingComplete, payoutProcessing } = user

    console.log("USER DATA FULL", user)

    if (!stripeAccountId) {
      console.log("EXIT: NO STRIPE ACCOUNT")
      return false
    }

    if (!stripeOnboardingComplete) {
      console.log("EXIT: ONBOARDING NOT COMPLETE")
      return false
    }

    if (pendingBalanceCents <= 0) {
      console.log("EXIT: NO BALANCE")
      return false
    }

    if (payoutProcessing) {
      console.log("EXIT: PAYOUT LOCKED")
      return false
    }

    // STEP 2: Lock
    const lockResult = await usersCollection.updateOne(
      { _id: userObjectId, payoutProcessing: { $ne: true } },
      { $set: { payoutProcessing: true } }
    )

    if (lockResult.modifiedCount === 0) {
      console.log("EXIT: FAILED TO ACQUIRE DB LOCK")
      return false
    }

    // STEP 2B: Assert consistency
    const verifiedSumCents = await recalculateUserBalance(userObjectId)
    if (verifiedSumCents !== pendingBalanceCents) {
      console.error(`[CRITICAL ERROR] Balance mismatch for user ${userObjectId}. Cached: ${pendingBalanceCents}, Summed: ${verifiedSumCents}. Halting payout.`)
      // Unlock and return
      await usersCollection.updateOne(
        { _id: userObjectId },
        { $set: { payoutProcessing: false } }
      )
      console.log("EXIT: FAILED CONSISTENCY CHECK")
      return false
    }

  // STEP 3: Transfer
  console.log("CREATING STRIPE TRANSFER", {
    amount: pendingBalanceCents,
    destination: stripeAccountId
  })

  try {
    const stripeClient = getStripe()
    const transfer = await stripeClient.transfers.create({
      amount: pendingBalanceCents,
      currency: "brl", // Matching project currency
      destination: stripeAccountId,
      metadata: {
        reason: 'delayed_payout',
        userId: userObjectId.toString(),
      }
    })

    // STEP 4: Success
    console.log("PAYOUT SUCCESS", transfer.id)
    
    // Reset pendingBalance to 0, unlock payoutProcessing
    await usersCollection.updateOne(
      { _id: userObjectId },
      { 
        $set: { payoutProcessing: false, pendingBalanceCents: 0 },
      }
    )

    console.log("BALANCE RESET")

    // Log the transaction
    await userTransactionsCollection.insertOne({
      userId: userObjectId,
      amountCents: pendingBalanceCents,
      type: 'payout',
      status: 'paid',
      stripeTransferId: transfer.id,
      createdAt: new Date()
    })

    // Update all pending transactions to 'paid'
    await userTransactionsCollection.updateMany(
      { userId: userObjectId, status: 'pending' },
      { $set: { status: 'paid' } }
    )

    console.log(`[Payout] Successfully processed payout of ${pendingBalanceCents} for user ${userObjectId} (Transfer ${transfer.id})`)
    return true
  } catch (error) {
    console.error("PAYOUT ERROR", error)
    // STEP 5: Unlock on Error without resetting pending balance
    await usersCollection.updateOne(
      { _id: userObjectId },
      { $set: { payoutProcessing: false } }
    )
    console.log("EXIT: STRIPE TRANSFER FAILED")
    return false
  }
  } catch (fatals) {
    console.error("FATAL ERROR IN processUserPayout:", fatals)
    return false
  }
}
