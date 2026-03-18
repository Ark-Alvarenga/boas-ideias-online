import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function cleanDatabase() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI not found in environment")

  const client = new MongoClient(uri)
  try {
    await client.connect()
    console.log("Connected to MongoDB")
    const db = client.db()

    // 1. Delete dummy products
    const deleteResult = await db.collection("products").deleteMany({
      $or: [
        { title: { $regex: /teste/i } },
        { title: { $regex: /^[0-9]+$/ } } // "123", "87687"
      ]
    })
    console.log(`Deleted ${deleteResult.deletedCount} dummy products.`)

    // 2. Fix typo
    const updateResult = await db.collection("products").updateOne(
      { title: { $regex: /Incrididle/i } },
      { $set: { title: "Dog Training Incredible!" } }
    )
    console.log(`Updated ${updateResult.modifiedCount} product typo.`)
  } catch (error) {
    console.error("Error cleaning database:", error)
  } finally {
    await client.close()
  }
}

cleanDatabase()
