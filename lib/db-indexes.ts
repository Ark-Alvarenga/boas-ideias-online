import type { Db } from 'mongodb'

/**
 * Ensures production indexes exist on MongoDB collections.
 * Safe to call on every app startup; createIndex is idempotent.
 * Does not break existing data.
 */
export async function ensureIndexes(db: Db): Promise<void> {
  try {
    const orders = db.collection('orders')
    await orders.createIndex({ userId: 1 }, { background: true })
    await orders.createIndex(
      { stripeSessionId: 1 },
      { unique: true, sparse: true, background: true }
    )

    const products = db.collection('products')
    await products.createIndex({ slug: 1 }, { background: true })
    await products.createIndex({ status: 1 }, { background: true })
    await products.createIndex({ creatorId: 1 }, { background: true })

    const users = db.collection('users')
    await users.createIndex({ email: 1 }, { unique: true, background: true })
  } catch (err) {
    console.error('[db-indexes] Failed to ensure indexes:', err)
    // Do not throw: app can run without indexes; logs for debugging
  }
}
