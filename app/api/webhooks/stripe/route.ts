import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type StripeType from "stripe";
import { getDatabase } from "@/lib/mongodb";
import type {
  Order,
  Product,
  Affiliate,
  AffiliateSale,
  Sale,
  User,
  ProcessedStripeEvent,
  UserTransaction,
} from "@/lib/types";
import { getStripe } from "@/lib/stripe";
import { resolvePriceCents } from "@/lib/currency";
import { ObjectId } from "mongodb";

// ─────────────────────────────────────────────────────────────
// PendingSale: stored when checkout.session.completed arrives
// but the PaymentIntent has no Charge ID yet. The charge.succeeded
// event will pick this up and complete the sale + transfers.
//
// WHY IS THIS NECESSARY?
// In Stripe Connect for Brazil (BRL), transfers MUST use
// `source_transaction: <charge_id>` — a "ch_..." ID.
// At the moment checkout.session.completed fires, Stripe may not
// have created the Charge object yet (it can take a few seconds).
// Rather than blocking or erroring out, we persist the intent so
// that once charge.succeeded arrives we can create the sale safely.
// ─────────────────────────────────────────────────────────────
interface PendingSale {
  _id?: ObjectId;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  transferGroup: string;
  productId: string;
  userId: string;
  creatorId: string | null;
  buyerName: string;
  buyerEmail: string;
  affiliateUserId: string | null;
  createdAt: Date;
}

export async function POST(request: NextRequest) {
  const stripeClient = getStripe();

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Stripe webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    console.warn("[Stripe webhook] Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 },
    );
  }

  let event: StripeType.Event;

  try {
    const payload = await request.text();
    event = stripeClient.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Stripe webhook] Signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as StripeType.Checkout.Session,
          stripeClient,
        );
        break;

      // ──────────────────────────────────────────────────────
      // charge.succeeded fires after the Charge object is fully
      // created. We use it as a fallback to complete any sale
      // that was queued in pendingSales because the charge ID
      // was not available yet when checkout.session.completed fired.
      // ──────────────────────────────────────────────────────
      case "charge.succeeded":
        await handleChargeSucceeded(
          event.data.object as StripeType.Charge,
          stripeClient,
        );
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as StripeType.Charge);
        break;

      case "account.updated":
        await handleAccountUpdated(event.data.object as StripeType.Account);
        break;

      default:
        // Unhandled event type — acknowledge silently
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("[Stripe webhook] Handler failed:", message, stack ?? "");
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Handle checkout.session.completed
//
// Fast path: if the PaymentIntent already has a Charge ID we
//   create the sale + transfers immediately.
// Slow path: if the Charge ID is missing, we store a PendingSale
//   document and return 200 so Stripe doesn't retry this event.
//   The actual sale will be created when charge.succeeded arrives.
// ─────────────────────────────────────────────────────────────
async function handleCheckoutCompleted(
  session: StripeType.Checkout.Session,
  stripeClient: StripeType,
  eventId: string,
) {
  if (session.payment_status !== "paid") {
    console.log(`[Stripe webhook] [${session.id}] Session not paid, skipping`);
    return;
  }

  const metadata = session.metadata ?? {};
  const productId =
    typeof metadata.productId === "string" ? metadata.productId : null;
  const userId =
    typeof metadata.userId === "string" ? metadata.userId : null;
  const creatorIdStr =
    typeof metadata.creatorId === "string" ? metadata.creatorId : null;
  const buyerName =
    typeof metadata.buyerName === "string"
      ? metadata.buyerName
      : (session.customer_details?.name ?? "Cliente");
  const buyerEmail =
    typeof session.customer_details?.email === "string"
      ? session.customer_details.email
      : typeof session.customer_email === "string"
        ? session.customer_email
        : "";
      : typeof session.customer_email === "string"
    ? session.customer_email
    : "";
  const transferGroup =
    typeof metadata.transferGroup === "string"
      ? metadata.transferGroup
      : session.id; // fallback
  const affiliateUserId =
    typeof metadata.affiliateUserId === "string"
      ? metadata.affiliateUserId
      : null;

  if (!productId || !ObjectId.isValid(productId)) {
    console.error(
      `[Stripe webhook] [${session.id}] Missing or invalid productId in metadata`,
    );
    console.error(
      `[Stripe webhook] [${session.id}] Missing or invalid productId in metadata`,
    );
    return;
  }

  const db = await getDatabase();
  const salesCollection = db.collection<Sale>("sales");

  // ── Idempotency guard ──
  const existingSale = await salesCollection.findOne({
    stripeSessionId: session.id,
  });
  if (existingSale) {
    console.log(`[Stripe webhook] [${session.id}] Sale already processed, skipping`);
    return;
  }

  // ── Resolve PaymentIntent ──
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : ((session.payment_intent as any)?.id ?? "");

  // ── Try to get the Charge ID from the PaymentIntent ──
  let chargeId: string | undefined;
  if (!chargeId) {
    console.error(
      `[Stripe webhook] [${session.id}] Could not resolve chargeId from PaymentIntent: ${paymentIntentId}, aborting sale creation.`,
    );
    return; // ⚠️ Não continua, protege payout
  }
  if (paymentIntentId) {
    try {
      const paymentIntent = await stripeClient.paymentIntents.retrieve(
        paymentIntentId,
        { expand: ["latest_charge"] },
      );
      const latestCharge = paymentIntent.latest_charge;
      if (typeof latestCharge === "string") {
        chargeId = latestCharge;
      } else if (
        latestCharge &&
        typeof latestCharge === "object" &&
        "id" in latestCharge
      ) {
      } else if (
        latestCharge &&
        typeof latestCharge === "object" &&
        "id" in latestCharge
      ) {
        chargeId = (latestCharge as { id: string }).id;
      }
      console.log(
        `[Stripe webhook] [${session.id}] Charge ID: ${chargeId ?? "NOT_YET_AVAILABLE"} from PaymentIntent: ${paymentIntentId}`,
      );
    } catch (err) {
      console.error(
        `[Stripe webhook] [${session.id}] Failed to retrieve PaymentIntent:`,
        err,
      );
    }
  }

  // ── Slow path: queue for charge.succeeded ──
  if (!chargeId) {
    console.warn(
      `[Stripe webhook] [${session.id}] Charge ID not yet available — queuing PendingSale for PaymentIntent ${paymentIntentId}`,
    );
    await upsertPendingSale(db, {
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      transferGroup,
      productId: productId!,
      userId: userId ?? "",
      creatorId: creatorIdStr,
      buyerName: typeof buyerName === "string" ? buyerName : "Cliente",
      buyerEmail,
      affiliateUserId,
      createdAt: new Date(),
    });
    // Return 200 — Stripe will NOT retry this event.
    // The sale will be completed when charge.succeeded arrives.
    return;
  }

  // ── Fast path: Charge ID available — create sale now ──
  await createSaleFromCheckoutData(
    {
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      transferGroup,
      productId: productId!,
      userId: userId ?? "",
      creatorId: creatorIdStr,
      buyerName: typeof buyerName === "string" ? buyerName : "Cliente",
      buyerEmail,
      affiliateUserId,
      createdAt: new Date(),
    },
    chargeId,
    db,
    stripeClient,
  );
}

// ─────────────────────────────────────────────────────────────
// Handle charge.succeeded
//
// When Stripe creates a Charge, this event fires. We look up any
// PendingSale linked to the same PaymentIntent and, if found,
// complete the sale + transfers using the now-valid Charge ID.
//
// This is the KEY fallback that ensures no payment goes unrecorded
// simply because the Charge wasn't available at checkout time.
// ─────────────────────────────────────────────────────────────
async function handleChargeSucceeded(
  charge: StripeType.Charge,
  stripeClient: StripeType,
) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : (charge.payment_intent as any)?.id;

  if (!paymentIntentId) {
    console.log("[Stripe webhook] charge.succeeded has no payment_intent, skipping");
    return;
  }

  const chargeId = charge.id;
  console.log(
    `[Stripe webhook] charge.succeeded: chargeId=${chargeId}, paymentIntentId=${paymentIntentId}`,
  );

  const db = await getDatabase();
  const pendingSalesCollection = db.collection<PendingSale>("pendingSales");
  const salesCollection = db.collection<Sale>("sales");

  // ── Idempotency guard: sale already exists for this PaymentIntent ──
  const existingSale = await salesCollection.findOne({
    stripePaymentIntentId: paymentIntentId,
  });
  if (existingSale) {
    console.log(
      `[Stripe webhook] charge.succeeded: Sale already exists for PaymentIntent ${paymentIntentId} — cleaning up pendingSale if any`,
    );
    // Clean up stale pending record if present
    await pendingSalesCollection.deleteOne({ stripePaymentIntentId: paymentIntentId });
    return;
  }

  // ── Look for queued pending sale ──
  const pending = await pendingSalesCollection.findOne({
    stripePaymentIntentId: paymentIntentId,
  });

  if (!pending) {
    // No pending sale — this charge.succeeded may be for a session that
    // already succeeded synchronously (fast path), which is fine.
    console.log(
      `[Stripe webhook] charge.succeeded: No pending sale found for PaymentIntent ${paymentIntentId}, nothing to do`,
    );
    return;
  }

  console.log(
    `[Stripe webhook] charge.succeeded: Found pending sale for session ${pending.stripeSessionId} — completing sale with chargeId ${chargeId}`,
  );

  // ── Complete the sale using the charge ID ──
  await createSaleFromCheckoutData(pending, chargeId, db, stripeClient);

  // ── Remove the pending record ──
  await pendingSalesCollection.deleteOne({ _id: pending._id });
  console.log(
    `[Stripe webhook] charge.succeeded: PendingSale removed for session ${pending.stripeSessionId}`,
  );
}

// ─────────────────────────────────────────────────────────────
// Core sale creation logic (shared by fast and slow paths)
// ─────────────────────────────────────────────────────────────
async function createSaleFromCheckoutData(
  data: Omit<PendingSale, "_id">,
  chargeId: string,
  db: Awaited<ReturnType<typeof getDatabase>>,
  stripeClient: StripeType,
) {
  const {
    stripeSessionId,
    stripePaymentIntentId,
    transferGroup,
    productId,
    userId,
    creatorId: creatorIdStr,
    buyerName,
    buyerEmail,
    affiliateUserId,
  } = data;

  const productsCollection = db.collection<Product>("products");
  const ordersCollection = db.collection<Order>("orders");
  const salesCollection = db.collection<Sale>("sales");
  const usersCollection = db.collection<User>("users");

  const product = await productsCollection.findOne({
    _id: new ObjectId(productId),
  });

  if (!product) {
    console.error(
      `[Stripe webhook] [${stripeSessionId}] Product not found for productId: ${productId}`,
    );
    return;
  }

  // ── Idempotency: check again in case of concurrent calls ──
  const existingSale = await salesCollection.findOne({
    stripeSessionId,
  });
  if (existingSale) {
    console.log(`[Stripe webhook] [${stripeSessionId}] Sale already created, skipping (idempotency)`);
    return;
  }

  // ── Ensure Order Exists Safely ──
  let orderId: ObjectId;
  const existingOrder = await ordersCollection.findOne({ stripeSessionId });

  if (existingOrder) {
    orderId = existingOrder._id!;
    console.log(
      `[Stripe webhook] [${stripeSessionId}] Order already exists: ${orderId.toString()}`,
    );
  } else {
    const totalAmountCentsForOrder = resolvePriceCents(product);
    const newOrder: Order = {
      productId: product._id!,
      productTitle: product.title,
      productPriceCents: totalAmountCentsForOrder,
      userId: new ObjectId(userId),
      buyerEmail: buyerEmail ?? "",
      buyerName: typeof buyerName === "string" ? buyerName : "Cliente",
      status: "paid",
      createdAt: new Date(),
      updatedAt: new Date(),
      stripeSessionId,
      stripePaymentIntentId,
    };

    try {
      const insertResult = await ordersCollection.insertOne(newOrder);
      orderId = insertResult.insertedId;

      await productsCollection.updateOne(
        { _id: product._id },
        { $inc: { sales: 1 } },
      );
    } catch (err: any) {
      if (err.code === 11000) {
        // Race condition — another webhook beat us
        const raceOrder = await ordersCollection.findOne({ stripeSessionId });
        if (raceOrder) {
          orderId = raceOrder._id!;
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  }

  // ── Financial Split ──
  const totalAmountCents = resolvePriceCents(product);
  const platformFeePercent = Math.min(
    100,
    Math.max(0, Number(process.env.PLATFORM_FEE_PERCENT) || 0),
  );
  const platformFeeCents = Math.round(
    (totalAmountCents * platformFeePercent) / 100,
  );
  const platformFeeCents = Math.round(
    (totalAmountCents * platformFeePercent) / 100,
  );

  // ── Resolve affiliate ──
  let affiliateShareCents = 0;
  let affiliateUser: User | null = null;
  let affiliateRecord: Affiliate | null = null;

  if (
    affiliateUserId &&
    ObjectId.isValid(affiliateUserId) &&
    product.affiliateEnabled
  ) {
    const affiliatesCollection = db.collection<Affiliate>("affiliates");
    affiliateRecord = await affiliatesCollection.findOne({
      userId: new ObjectId(affiliateUserId),
      productId: product._id!,
    });

    if (
      affiliateRecord &&
      product.creatorId &&
      !product.creatorId.equals(new ObjectId(affiliateUserId))
    ) {
      const commissionPercent =
        affiliateRecord.commissionPercent ??
        product.affiliateCommissionPercent ??
        0;
      affiliateShareCents = Math.round(
        (totalAmountCents * commissionPercent) / 100,
      );
      affiliateShareCents = Math.round(
        (totalAmountCents * commissionPercent) / 100,
      );

      affiliateUser = await usersCollection.findOne({
        _id: new ObjectId(affiliateUserId),
      });
    } else {
      affiliateRecord = null; // creator cannot be their own affiliate
    }
  }

  const creatorShareCents = Math.max(
    0,
    totalAmountCents - platformFeeCents - affiliateShareCents,
  );
  const creatorShareCents = Math.max(
    0,
    totalAmountCents - platformFeeCents - affiliateShareCents,
  );

  // ── Resolve creator ──
  const creatorId =
    creatorIdStr && ObjectId.isValid(creatorIdStr)
      ? new ObjectId(creatorIdStr)
      : product.creatorId;

  const creator = await usersCollection.findOne({ _id: creatorId });

  // ─── VERIFY CREATOR VS AFFILIATE SPLIT ───
  console.log(`[Stripe webhook] [${session.id}] Financial Split Log:`, {
    total: totalAmountCents,
    platformFee: platformFeeCents,
    creatorAmount: creatorShareCents,
    affiliateAmount: affiliateShareCents,
    sumCheck:
      platformFeeCents + creatorShareCents + affiliateShareCents ===
      totalAmountCents,
    affiliateUserId: affiliateUserId ?? "NONE",
    creatorId: creatorId.toString(),
  });

  if (
    platformFeeCents + creatorShareCents + affiliateShareCents !==
    totalAmountCents
  ) {
    console.error(
      `[Stripe webhook] [CRITICAL] Split amounts do not sum up exactly to total!`,
    );
  }

  // ── Build Sale Document ──
  const sale: Sale = {
    _id: saleId,
    orderId,
    productId: product._id!,
    buyerId: new ObjectId(userId),
    creatorId,
    affiliateUserId: affiliateRecord
      ? new ObjectId(affiliateUserId!)
      : undefined,
    totalAmountCents,
    platformFeeCents,
    affiliateShareCents,
    creatorShareCents,
    stripeSessionId,
    stripePaymentIntentId,
    status: "completed",
    creatorPayoutStatus: "pending",
    affiliatePayoutStatus: affiliateRecord
      ? affiliateUser?.stripeAccountId && affiliateUser?.stripeOnboardingComplete
        ? "paid"
        : "pending"
      : "not_applicable",
    createdAt: new Date(),
  };

  // ── Transfer to creator ──
  if (creator?.stripeAccountId && creatorShareCents > 0) {
    try {
      const creatorTransfer = await stripeClient.transfers.create(
        {
          amount: creatorShareCents,
          currency: "brl",
          destination: creator.stripeAccountId,
          source_transaction: chargeId,
          transfer_group: transferGroup,
          metadata: {
            saleType: "creator",
            orderId: orderId.toString(),
            productId: product._id!.toString(),
          },
        },
        { idempotencyKey: `transfer_creator_${stripeSessionId}` },
      );
      sale.stripeTransferIdCreator = creatorTransfer.id;
      sale.creatorPayoutStatus = "paid";
      console.log(
        `[Stripe webhook] [${stripeSessionId}] Creator transfer created:`,
        JSON.stringify({
          transferId: creatorTransfer.id,
          amount: creatorShareCents,
          destination: creator.stripeAccountId,
          transferGroup,
          sourceTransaction: chargeId,
        }),
      );
    } catch (err) {
      console.error(
        `[Stripe webhook] [${stripeSessionId}] [REQUIRES_MANUAL_INTERVENTION] Creator transfer failed:`,
        err,
      );
      sale.creatorPayoutStatus = "pending";
    }
  } else {
    console.warn(
      `[Stripe webhook] [${stripeSessionId}] Creator transfer skipped: no Stripe account or zero-amount`,
    );
  }

  // ── Transfer to affiliate ──
  if (
    affiliateRecord &&
    affiliateShareCents > 0 &&
    affiliateUser?.stripeAccountId &&
    affiliateUser?.stripeOnboardingComplete
  ) {
    try {
      const affiliateTransfer = await stripeClient.transfers.create(
        {
          amount: affiliateShareCents,
          currency: "brl",
          destination: affiliateUser.stripeAccountId,
          source_transaction: chargeId,
          transfer_group: transferGroup,
          metadata: {
            saleType: "affiliate",
            orderId: orderId.toString(),
            productId: product._id!.toString(),
            affiliateUserId: affiliateUserId!,
          },
        },
        { idempotencyKey: `transfer_affiliate_${stripeSessionId}` },
      );
      sale.stripeTransferIdAffiliate = affiliateTransfer.id;
      sale.affiliatePayoutStatus = "paid";
      sale.affiliatePaidAt = new Date();
    } catch (err) {
      console.error(
        `[Stripe webhook] [${stripeSessionId}] [REQUIRES_MANUAL_INTERVENTION] Affiliate transfer failed:`,
        err,
      );
      sale.affiliatePayoutStatus = "pending";
    }
  }

  // ── Persist sale ──
  try {
    await salesCollection.insertOne(sale);
  } catch (err: any) {
    if (err.code === 11000) {
      console.log(
        `[Stripe webhook] [${stripeSessionId}] Race condition: Sale already inserted`,
      );
      return;
    }
    throw err;
  }

  // ── Link sale back to order ──
  await ordersCollection.updateOne(
    { _id: orderId },
    { $set: { saleId: sale._id } },
  );

  // ── Legacy affiliateSales collection ──
  if (affiliateRecord && affiliateShareCents > 0) {
    const affiliateSalesCollection =
      db.collection<AffiliateSale>("affiliateSales");
    const saleDoc: AffiliateSale = {
      affiliateId: affiliateRecord._id!,
      productId: product._id!,
      orderId,
      affiliateUserId: affiliateRecord.userId,
      creatorUserId: product.creatorId,
      saleAmountCents: totalAmountCents,
      commissionAmountCents: affiliateShareCents,
      createdAt: new Date(),
    };
    await affiliateSalesCollection.insertOne(saleDoc);
  }

  console.log(
    `[Stripe webhook] [${stripeSessionId}] Sale recorded:`,
    JSON.stringify({
      orderId: orderId.toString(),
      saleId: sale._id?.toString(),
      chargeId,
      totalAmountCents,
      platformFeeCents,
      creatorShareCents,
      affiliateShareCents,
      creatorPayoutStatus: sale.creatorPayoutStatus,
      affiliatePayoutStatus: sale.affiliatePayoutStatus,
      creatorTransfer: sale.stripeTransferIdCreator ?? "none",
      affiliateTransfer: sale.stripeTransferIdAffiliate ?? "none",
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// Upsert PendingSale (idempotent via stripeSessionId)
// ─────────────────────────────────────────────────────────────
async function upsertPendingSale(
  db: Awaited<ReturnType<typeof getDatabase>>,
  data: Omit<PendingSale, "_id">,
) {
  const pendingSalesCollection = db.collection<PendingSale>("pendingSales");
  await pendingSalesCollection.updateOne(
    { stripeSessionId: data.stripeSessionId },
    { $setOnInsert: data },
    { upsert: true },
  );
  console.log(
    `[Stripe webhook] PendingSale upserted for session ${data.stripeSessionId} / PaymentIntent ${data.stripePaymentIntentId}`,
  );
}

// ─────────────────────────────────────────────────────────────
// Handle charge.refunded
// ─────────────────────────────────────────────────────────────
async function handleChargeRefunded(charge: StripeType.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : (charge.payment_intent as any)?.id;

  if (!paymentIntentId) {
    console.warn("[Stripe webhook] charge.refunded missing payment_intent");
    return;
  }

  const db = await getDatabase();
  const salesCollection = db.collection<Sale>("sales");
  const ordersCollection = db.collection<Order>("orders");

  const sale = await salesCollection.findOne({
    stripePaymentIntentId: paymentIntentId,
  });
  const sale = await salesCollection.findOne({
    stripePaymentIntentId: paymentIntentId,
  });
  if (!sale) {
    console.warn(
      "[Stripe webhook] No sale found for refunded payment_intent:",
      paymentIntentId,
    );
    console.warn(
      "[Stripe webhook] No sale found for refunded payment_intent:",
      paymentIntentId,
    );
    return;
  }

  const refundStatus = charge.refunded ? "refunded" : "partially_refunded";

  await salesCollection.updateOne(
    { _id: sale._id },
    { $set: { status: refundStatus } },
  );

  await ordersCollection.updateOne(
    { _id: sale.orderId },
    { $set: { status: "refunded", updatedAt: new Date() } },
  );

  console.log(
    "[Stripe webhook] Refund processed:",
    JSON.stringify({
      saleId: sale._id?.toString(),
      paymentIntentId,
      status: refundStatus,
    }),
  );
  console.log(
    "[Stripe webhook] Refund processed:",
    JSON.stringify({
      saleId: sale._id?.toString(),
      paymentIntentId,
      status: refundStatus,
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// Handle account.updated
// ─────────────────────────────────────────────────────────────
async function handleAccountUpdated(account: StripeType.Account) {
  const db = await getDatabase();
  const usersCollection = db.collection<User>("users");

  const isComplete = account.details_submitted && account.charges_enabled;

  const result = await usersCollection.updateOne(
    { stripeAccountId: account.id },
    {
      $set: {
        stripeOnboardingComplete: isComplete,
        updatedAt: new Date(),
      },
    },
    },
  );

if (result.matchedCount > 0) {
  console.log(
    "[Stripe webhook] Account updated:",
    JSON.stringify({
      stripeAccountId: account.id,
      stripeOnboardingComplete: isComplete,
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
    }),
  );
  console.log(
    "[Stripe webhook] Account updated:",
    JSON.stringify({
      stripeAccountId: account.id,
      stripeOnboardingComplete: isComplete,
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
    }),
  );
} else {
  console.warn(
    "[Stripe webhook] Account updated, but no matching user found:",
    account.id,
  );
  console.warn(
    "[Stripe webhook] Account updated, but no matching user found:",
    account.id,
  );
}
}
