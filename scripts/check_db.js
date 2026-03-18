import { MongoClient } from 'mongodb'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(__dirname, '../.env.local') })

async function checkDatabase() {
  const uri = process.env.MONGODB_URI
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db()

  const products = await db.collection("products").find({}).toArray()
  console.log(products.map(p => p.title))
  await client.close()
}
checkDatabase()
