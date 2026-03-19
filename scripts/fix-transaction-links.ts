import { MongoClient, ObjectId } from 'mongodb'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function fixTransactionsAndBalances() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("❌ MONGODB_URI not found in environment variables")
    process.exit(1)
  }

  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")
    
    // In lib/mongodb.ts, it uses 'boas-ideias' specifically
    const db = client.db('boas-ideias')
    const transactionsCollection = db.collection('userTransactions')
    const salesCollection = db.collection('sales')
    const usersCollection = db.collection('users')

    console.log("🔍 Finding pending transactions with missing saleId...")
    
    // 1. Find all pending transactions of type 'sale' or 'affiliate_commission' where saleId is null/missing
    const orphanedTransactions = await transactionsCollection.find({
      status: 'pending',
      type: { $in: ['sale', 'affiliate_commission'] },
      $or: [
        { saleId: null },
        { saleId: { $exists: false } }
      ]
    }).toArray()

    console.log(`📊 Found ${orphanedTransactions.length} orphaned transactions.`)

    let linkedCount = 0
    const userIdsToUpdate = new Set<string>()

    for (const tx of orphanedTransactions) {
      const txId = tx._id.toString()
      const userId = tx.userId
      const amount = tx.amountCents
      const type = tx.type

      userIdsToUpdate.add(userId.toString())

      console.log(`   Processing TX ${txId} for User ${userId.toString()} (Amount: ${amount}, Type: ${type})`)

      let saleMatch = null
      
      if (type === 'sale') {
        // Link to creatorId
        saleMatch = await salesCollection.findOne({
          creatorId: userId,
          creatorShareCents: amount,
          status: 'completed'
        }, { sort: { createdAt: -1 } }) // Get the most recent match
      } else if (type === 'affiliate_commission') {
        // Link to affiliateUserId
        saleMatch = await salesCollection.findOne({
          affiliateUserId: userId,
          affiliateShareCents: amount,
          status: 'completed'
        }, { sort: { createdAt: -1 } })
      }

      if (saleMatch) {
        const saleIdStr = saleMatch._id.toString()
        await transactionsCollection.updateOne(
          { _id: tx._id },
          { $set: { saleId: saleIdStr } }
        )
        console.log(`   ✅ Linked TX ${txId} to Sale ${saleIdStr}`)
        linkedCount++
      } else {
        console.warn(`   ⚠️ No matching sale found for TX ${txId}`)
      }
    }

    console.log(`\n✨ Finished linking. Success: ${linkedCount}/${orphanedTransactions.length}`)

    // 2. Synchronize pendingBalanceCents for all affected users (or all users in the system)
    // We'll update the Set with ALL users that have ANY pending transaction to be safe
    const allPendingUsers = await transactionsCollection.distinct('userId', { status: 'pending' })
    allPendingUsers.forEach(id => userIdsToUpdate.add(id.toString()))

    console.log(`\n🔄 Syncing balances for ${userIdsToUpdate.size} users...`)

    for (const userIdStr of userIdsToUpdate) {
      const userId = new ObjectId(userIdStr)
      
      const pendingTxs = await transactionsCollection.find({
        userId: userId,
        status: 'pending'
      }).toArray()

      const newBalance = pendingTxs.reduce((sum, tx) => sum + (tx.amountCents || 0), 0)

      await usersCollection.updateOne(
        { _id: userId },
        { $set: { pendingBalanceCents: newBalance } }
      )

      console.log(`   👤 User ${userIdStr}: New pendingBalanceCents = ${newBalance}`)
    }

    console.log("\n✅ All balances synchronized.")

  } catch (error) {
    console.error("❌ Error during script execution:", error)
  } finally {
    await client.close()
    console.log("🔌 Database connection closed.")
  }
}

fixTransactionsAndBalances()
