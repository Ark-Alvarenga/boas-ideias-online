import { ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/mongodb'
import type { User, UserTransaction, Sale } from '@/lib/types'
import { getStripe } from '@/lib/stripe'
import { getUserPendingBalance } from '@/lib/hardening'

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

    const { stripeAccountId, stripeOnboardingComplete, payoutProcessing } = user

    console.log("USER DATA FULL", user)

    if (!stripeAccountId) {
      console.log("EXIT: NO STRIPE ACCOUNT")
      return false
    }

    if (!stripeOnboardingComplete) {
      console.log("EXIT: ONBOARDING NOT COMPLETE")
      return false
    }

    // Check standard boolean or time lock
    const now = new Date()
    if (user.payoutLockedAt && user.payoutLockedAt >= new Date(now.getTime() - 60 * 60 * 1000)) {
      console.log("EXIT: PAYOUT LOCKED")
      return false
    }

    // STEP 2: Lock
    const lockResult = await usersCollection.updateOne(
      { 
        _id: userObjectId,
        $or: [
          { payoutLockedAt: { $exists: false } },
          { payoutLockedAt: { $lt: new Date(now.getTime() - 60 * 60 * 1000) } }
        ]
      },
      { $set: { payoutLockedAt: now, payoutProcessing: true } }
    )

    if (lockResult.modifiedCount === 0) {
      console.log("EXIT: FAILED TO ACQUIRE DB LOCK")
      return false
    }

    // ── 1. HARD RECONCILIATION AT START ──
    const allSales = await salesCollection.find({
      $and: [
        {
          $or: [
            { creatorId: userObjectId },
            { affiliateUserId: userObjectId },
            { referrerUserId: userObjectId }
          ]
        },
        {
          $or: [
            { availableAt: { $exists: false } },
            { availableAt: { $lte: new Date() } }
          ]
        }
      ]
    }).toArray()

    for (const sale of allSales) {
      if (!sale._id) continue
      const saleIdStr = sale._id.toString()

      // Creator side
      if (sale.creatorId && sale.creatorId.toString() === userObjectId.toString()) {
        if (sale.creatorPayoutStatus === 'paid') {
          const res = await userTransactionsCollection.updateMany(
            { userId: userObjectId, saleId: saleIdStr, type: 'sale', status: 'pending' },
            { $set: { status: 'paid' } }
          )
          if (res.modifiedCount > 0) console.error(`[INCONSISTENCY FIXED] Sale ${saleIdStr} creator paid, but tx was pending.`)
        } else if (sale.creatorPayoutStatus === 'pending') {
          const res = await userTransactionsCollection.updateMany(
            { userId: userObjectId, saleId: saleIdStr, type: 'sale', status: 'paid' },
            { $set: { status: 'pending' } }
          )
          if (res.modifiedCount > 0) console.error(`[INCONSISTENCY FIXED] Sale ${saleIdStr} creator pending, but tx was paid.`)
        }
      }

      // Affiliate side
      if (sale.affiliateUserId && sale.affiliateUserId.toString() === userObjectId.toString()) {
        if (sale.affiliatePayoutStatus === 'paid') {
          const res = await userTransactionsCollection.updateMany(
            { userId: userObjectId, saleId: saleIdStr, type: 'affiliate_commission', status: 'pending' },
            { $set: { status: 'paid' } }
          )
          if (res.modifiedCount > 0) console.error(`[INCONSISTENCY FIXED] Sale ${saleIdStr} affiliate paid, but tx was pending.`)
        } else if (sale.affiliatePayoutStatus === 'pending') {
          const res = await userTransactionsCollection.updateMany(
            { userId: userObjectId, saleId: saleIdStr, type: 'affiliate_commission', status: 'paid' },
            { $set: { status: 'pending' } }
          )
          if (res.modifiedCount > 0) console.error(`[INCONSISTENCY FIXED] Sale ${saleIdStr} affiliate pending, but tx was paid.`)
        }
      }

      // Referral side
      if (sale.referrerUserId && sale.referrerUserId.toString() === userObjectId.toString()) {
        if (sale.referralPayoutStatus === 'paid') {
          const res = await userTransactionsCollection.updateMany(
            { userId: userObjectId, saleId: saleIdStr, type: 'referral_commission', status: 'pending' },
            { $set: { status: 'paid' } }
          )
          if (res.modifiedCount > 0) console.error(`[INCONSISTENCY FIXED] Sale ${saleIdStr} referral paid, but tx was pending.`)
        } else if (sale.referralPayoutStatus === 'pending') {
          const res = await userTransactionsCollection.updateMany(
            { userId: userObjectId, saleId: saleIdStr, type: 'referral_commission', status: 'paid' },
            { $set: { status: 'pending' } }
          )
          if (res.modifiedCount > 0) console.error(`[INCONSISTENCY FIXED] Sale ${saleIdStr} referral pending, but tx was paid.`)
        }
      }
    }

    // ── 2. RECALCULATE BALANCE AFTER RECONCILING ──
    const trueBalanceCents = await getUserPendingBalance(userObjectId)
    if (trueBalanceCents !== user.pendingBalanceCents) {
      console.error(`[INCONSISTENCY FIXED] User ${userObjectId} cached balance was ${user.pendingBalanceCents}, corrected to ${trueBalanceCents} from transactions.`)
      await usersCollection.updateOne({ _id: userObjectId }, { $set: { pendingBalanceCents: trueBalanceCents } })
    }

    // Exit if there is NO true balance remaining
    if (trueBalanceCents <= 0) {
      console.log("EXIT: NO VALID BALANCE AFTER RECONCILIATION")
      await usersCollection.updateOne({ _id: userObjectId }, { $unset: { payoutLockedAt: "" }, $set: { payoutProcessing: false } })
      return false
    }

    // STEP 3: Iterate through individual pending sales to construct source_transaction BRL payloads
    const pendingSales = await salesCollection.find({
      $and: [
        {
          $or: [
            { creatorId: userObjectId, creatorPayoutStatus: "pending" },
            { affiliateUserId: userObjectId, affiliatePayoutStatus: "pending" },
            { referrerUserId: userObjectId, referralPayoutStatus: "pending" }
          ]
        },
        {
          $or: [
            { stripeChargeId: { $regex: /^ch_/ } },
            { stripePaymentIntentId: { $regex: /^ch_/ } }
          ]
        },
        {
          $or: [
            { availableAt: { $exists: false } },
            { availableAt: { $lte: new Date() } }
          ]
        }
      ]
    }).toArray()
    
    if (pendingSales.length === 0) {
      console.log("EXIT: NO VALID PENDING SALES WITH PAYMENT INTENTS FOUND, UNLOCKING")
      await usersCollection.updateOne({ _id: userObjectId }, { $unset: { payoutLockedAt: "" }, $set: { payoutProcessing: false } })
      return false
    }

    const stripeClient = getStripe()
    let successfullyTransferredCents = 0
    let hasError = false

    for (const sale of pendingSales) {
      let amountToTransfer = 0;
      let isCreator = false;
      let isAffiliate = false;
      let isReferral = false;

      // Extract isolated role balances logically mapping object identities
      const creatorMatch = sale.creatorId && sale.creatorId.toString() === userObjectId.toString();
      const affiliateMatch = sale.affiliateUserId && sale.affiliateUserId.toString() === userObjectId.toString();
      const referralMatch = sale.referrerUserId && sale.referrerUserId.toString() === userObjectId.toString();

      if (creatorMatch && sale.creatorPayoutStatus === "pending" && sale.creatorShareCents > 0) {
        amountToTransfer += sale.creatorShareCents;
        isCreator = true;
      }

      if (affiliateMatch && sale.affiliatePayoutStatus === "pending" && sale.affiliateShareCents > 0) {
        amountToTransfer += sale.affiliateShareCents;
        isAffiliate = true;
      }

      if (referralMatch && sale.referralPayoutStatus === "pending" && sale.referralShareCents !== undefined && sale.referralShareCents > 0) {
        amountToTransfer += sale.referralShareCents;
        isReferral = true;
      }

      const chargeId = sale.stripeChargeId || sale.stripePaymentIntentId

      if (amountToTransfer > 0 && chargeId) {
        const roles = []
        if (isCreator) roles.push('creator')
        if (isAffiliate) roles.push('affiliate')
        if (isReferral) roles.push('referral')
        const roleString = roles.join('_')
        const idempotencyKey = `transfer_${sale._id}_${chargeId}_${roleString}`

        console.log("CREATING STRIPE TRANSFER", {
          amount: amountToTransfer,
          destination: stripeAccountId,
          source_transaction: chargeId,
          saleId: sale._id?.toString(),
          idempotencyKey
        })

        try {
          // BRL Stripe accounts mandate `source_transaction`
          const transfer = await stripeClient.transfers.create(
            {
              amount: amountToTransfer,
              currency: "brl",
              destination: stripeAccountId,
              source_transaction: chargeId,
              metadata: {
                reason: 'delayed_payout_brasil',
                userId: userObjectId.toString(),
                saleId: sale._id!.toString(),
                roles: roleString
              }
            },
            { idempotencyKey }
          )

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
          if (isReferral) {
            updateQuery.referralPayoutStatus = "paid"
            updateQuery.stripeTransferIdReferral = transfer.id
          }

          // Complete safety: Update sale, then user, then transactions synchronously
          await salesCollection.updateOne(
            { _id: sale._id },
            { $set: updateQuery }
          )

          // Immediately decrement user balance accurately and safely
          await usersCollection.updateOne(
            { _id: userObjectId },
            { $inc: { pendingBalanceCents: -amountToTransfer } }
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
          
          // Set mapping offline pending chunks reflecting this logic to paid atomically for THIS sale
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

    // ── Step 4: RECONCILIATION STEP ──
    const pendingTransactions = await userTransactionsCollection.find({
      userId: userObjectId,
      status: 'pending',
      type: { $in: ['sale', 'affiliate_commission', 'referral_commission'] }
    }).toArray()

    for (const tx of pendingTransactions) {
      if (!tx.saleId || !ObjectId.isValid(tx.saleId)) continue

      const parentSale = await salesCollection.findOne({ _id: new ObjectId(tx.saleId) })
      if (!parentSale) continue

      let shouldMarkPaid = false
      if (tx.type === 'sale' && parentSale.creatorPayoutStatus === 'paid') {
        shouldMarkPaid = true
      }
      if (tx.type === 'affiliate_commission' && parentSale.affiliatePayoutStatus === 'paid') {
        shouldMarkPaid = true
      }
      if (tx.type === 'referral_commission' && parentSale.referralPayoutStatus === 'paid') {
        shouldMarkPaid = true
      }

      if (shouldMarkPaid) {
        await userTransactionsCollection.updateOne(
          { _id: tx._id },
          { $set: { status: 'paid' } }
        )
      }
    }

    // ── 3. SAFETY RECONCILIATION AT END ──
    const finalPendingBalanceCents = await getUserPendingBalance(userObjectId)

    await usersCollection.updateOne(
      { _id: userObjectId },
      { 
        $unset: { payoutLockedAt: "" },
        $set: { 
          pendingBalanceCents: finalPendingBalanceCents,
          payoutProcessing: false
        }
      }
    )
    console.log("RECONCILIATION COMPLETE. NEW BALANCE:", finalPendingBalanceCents)

    return !hasError && successfullyTransferredCents > 0
  } catch (fatals) {
    console.error("FATAL ERROR IN processUserPayout:", fatals)
    try { await usersCollection.updateOne({ _id: userObjectId }, { $set: { payoutProcessing: false } }) } catch (e) {}
    return false
  }
}
