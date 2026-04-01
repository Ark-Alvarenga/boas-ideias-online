import { MongoClient } from 'mongodb';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

async function run() {
  console.log("🚀 Starting referral code generation for existing users...");
  const client = new MongoClient(MONGODB_URI as string);

  try {
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');

    // Find users who don't have a referralCode
    const usersWithoutCode = await usersCollection.find({
      $or: [
        { referralCode: { $exists: false } },
        { referralCode: null },
        { referralCode: "" }
      ]
    }).toArray();

    if (usersWithoutCode.length === 0) {
      console.log("✅ All users already have a referralCode. Nothing to do.");
      return;
    }

    console.log(`Found ${usersWithoutCode.length} users without a referralCode. Updating...`);

    let updatedCount = 0;

    for (const user of usersWithoutCode) {
      const newCode = crypto.randomBytes(5).toString('hex');
      
      const result = await usersCollection.updateOne(
        { _id: user._id },
        { $set: { referralCode: newCode } }
      );

      if (result.modifiedCount === 1) {
        updatedCount++;
      }
    }

    console.log(`✅ Successfully updated ${updatedCount} users with a new referralCode.`);
  } catch (error) {
    console.error("❌ Error running script:", error);
  } finally {
    await client.close();
    console.log("👋 Disconnected from database.");
  }
}

run();
