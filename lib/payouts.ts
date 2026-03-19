import { ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/mongodb'
import type { User, UserTransaction, Sale } from '@/lib/types'
import { getStripe } from '@/lib/stripe'
import { recalculateUserBalance } from '@/lib/hardening'

export async function processUserPayout(userId: string | ObjectId): Promise<boolean> {
  const db = await getDatabase()
  const usersCollection = db.collection<User>('users')
  const userTransactionsCollection = db.collection<UserTransaction>('userTransactions')
  const salesCollection = db.collection<Sale>('sales')

  const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId

  console.log("PAYOUT START", { userId: userObjectId.toString() })

  try {
    console.log("BEFORE FINDONE", userObjectId.toString())
    const user = await usersCollection.findOne({ _id: userObjectId })
    console.log("AFTER FINDONE", user)
    
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

    // STEP 3: Iterate through individual pending sales to construct source_transaction BRL payloads
    const pendingSales = await salesCollection.find({
      $or: [
        { creatorId: userObjectId, creatorPayoutStatus: "pending" },
        { affiliateUserId: userObjectId, affiliatePayoutStatus: "pending" }
      ],
      stripePaymentIntentId: { $regex: /^ch_/ }
    }).toArray()
    
    if (pendingSales.length === 0) {
      console.log("EXIT: NO VALID PENDING SALES WITH PAYMENT INTENTS FOUND, UNLOCKING")
      await usersCollection.updateOne({ _id: userObjectId }, { $set: { payoutProcessing: false } })
      return false
    }

    const stripeClient = getStripe()
    let successfullyTransferredCents = 0
    let hasError = false

    for (const sale of pendingSales) {
      let amountToTransfer = 0;
      let isCreator = false;
      let isAffiliate = false;

      // Extract isolated role balances logically mapping object identities
      const creatorMatch = sale.creatorId && sale.creatorId.toString() === userObjectId.toString();
      const affiliateMatch = sale.affiliateUserId && sale.affiliateUserId.toString() === userObjectId.toString();

      if (creatorMatch && sale.creatorPayoutStatus === "pending" && sale.creatorShareCents > 0) {
        amountToTransfer += sale.creatorShareCents;
        isCreator = true;
      }

      if (affiliateMatch && sale.affiliatePayoutStatus === "pending" && sale.affiliateShareCents > 0) {
        amountToTransfer += sale.affiliateShareCents;
        isAffiliate = true;
      }

      if (amountToTransfer > 0 && sale.stripePaymentIntentId) {
        console.log("CREATING STRIPE TRANSFER", {
          amount: amountToTransfer,
          destination: stripeAccountId,
          source_transaction: sale.stripePaymentIntentId,
          saleId: sale._id?.toString()
        })

        try {
          // BRL Stripe accounts absolutely mandate the `source_transaction` attribute mirroring local checkout session origins.
          const transfer = await stripeClient.transfers.create({
            amount: amountToTransfer,
            currency: "brl",
            destination: stripeAccountId,
            source_transaction: sale.stripePaymentIntentId,
            metadata: {
              reason: 'delayed_payout_brasil',
              userId: userObjectId.toString(),
              saleId: sale._id!.toString()
            }
          })

          console.log("PAYOUT SUCCESS", transfer.id)
          successfullyTransferredCents += amountToTransfer;

          // Mutate the sale pipeline tracking status securely
          const updateQuery: any = {}
          if (isCreator) {
            updateQuery.creatorPayoutStatus = "paid"
            updateQuery.stripeTransferIdCreator = transfer.id
          }
          if (isAffiliate) {
            updateQuery.affiliatePayoutStatus = "paid"
            updateQuery.stripeTransferIdAffiliate = transfer.id
          }

          await salesCollection.updateOne(
            { _id: sale._id },
            { $set: updateQuery }
          )

          // Drop an isolated payload transaction for tracking the transfer sequence
          await userTransactionsCollection.insertOne({
            userId: userObjectId,
            amountCents: amountToTransfer,
            type: 'payout',
            status: 'paid',
            stripeTransferId: transfer.id,
            saleId: sale._id?.toString(),
            createdAt: new Date()
          })
          
          // Set mapping offline pending chunks reflecting this distinct source transaction array logic to paid
          await userTransactionsCollection.updateMany(
            { userId: userObjectId, saleId: sale._id?.toString(), status: 'pending' },
            { $set: { status: 'paid' } }
          )

        } catch (transferErr) {
          console.error(`PAYOUT ERROR ON SALE ${sale._id}`, transferErr)
          // Intentionally do not hard-throw allowing other valid source transactions to loop safely
          hasError = true
        }
      }
    }

    // Step 4: Finalize pendingBalance offset
    if (successfullyTransferredCents > 0) {
      await usersCollection.updateOne(
        { _id: userObjectId },
        { 
          $inc: { pendingBalanceCents: -successfullyTransferredCents },
          $set: { payoutProcessing: false }
        }
      )
      console.log("BALANCE RESET", { deducted: successfullyTransferredCents })
    } else {
      // Nothing was successfully emitted into Stipe due to isolated pipeline failures
      await usersCollection.updateOne(
        { _id: userObjectId },
        { $set: { payoutProcessing: false } }
      )
    }

    return !hasError && successfullyTransferredCents > 0
  } catch (fatals) {
    console.error("FATAL ERROR IN processUserPayout:", fatals)
    try { await usersCollection.updateOne({ _id: userObjectId }, { $set: { payoutProcessing: false } }) } catch (e) {}
    return false
  }
}
