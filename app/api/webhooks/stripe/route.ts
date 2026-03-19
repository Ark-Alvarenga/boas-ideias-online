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
          event.id,
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
// ─────────────────────────────────────────────────────────────
async function handleCheckoutCompleted(
  session: StripeType.Checkout.Session,
  stripeClient: StripeType,
  eventId: string,
) {
  if (session.payment_status !== "paid") {
    return;
  }

  const metadata = session.metadata ?? {};
  const productId =
    typeof metadata.productId === "string" ? metadata.productId : null;
  const userId = typeof metadata.userId === "string" ? metadata.userId : null;
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
  const transferGroup =
    typeof metadata.transferGroup === "string"
      ? metadata.transferGroup
      : session.id; // fallback for sessions created before this change

  if (!productId || !ObjectId.isValid(productId)) {
    console.error(
      `[Stripe webhook] [${session.id}] Missing or invalid productId in metadata`,
    );
    return;
  }

  const db = await getDatabase();
  const productsCollection = db.collection<Product>("products");
  const ordersCollection = db.collection<Order>("orders");
  const salesCollection = db.collection<Sale>("sales");
  const usersCollection = db.collection<User>("users");
  const processedEventsCollection = db.collection<ProcessedStripeEvent>(
    "processedStripeEvents",
  );
  const userTransactionsCollection =
    db.collection<UserTransaction>("userTransactions");

  // --- Step 1: Idempotency Check ---
  const existingEvent = await processedEventsCollection.findOne({ eventId });
  if (existingEvent) {
    console.log(
      `[Stripe webhook] Event ${eventId} already processed. Skipping.`,
    );
    return;
  }
  // Record event processing early to prevent race conditions
  try {
    await processedEventsCollection.insertOne({
      eventId,
      createdAt: new Date(),
    });
  } catch (err: any) {
    if (err.code === 11000) {
      console.log(
        `[Stripe webhook] Event ${eventId} race condition prevented. Skipping.`,
      );
      return;
    }
    throw err;
  }

  const product = await productsCollection.findOne({
    _id: new ObjectId(productId),
  });

  if (!product) {
    console.error(
      `[Stripe webhook] [${session.id}] Product not found for productId:`,
      productId,
    );
    return;
  }

  // Final Source of Truth checks if webhook successfully processed this sale already
  const existingSale = await salesCollection.findOne({
    stripeSessionId: session.id,
  });
  if (existingSale) {
    console.log(`[Stripe webhook] [${session.id}] Sale already processed`);
    return;
  }

  // Resolve payment intent ID
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : ((session.payment_intent as any)?.id ?? "");

  // ─── Fetch the charge ID from the PaymentIntent ───
  // For BRL transfers in Brazil, Stripe requires source_transaction
  // to be a charge ID (ch_...), NOT a payment intent ID (pi_...).
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
        {
          expand: ["latest_charge"],
        },
      );
      const latestCharge = paymentIntent.latest_charge;
      if (typeof latestCharge === "string") {
        chargeId = latestCharge;
      } else if (
        latestCharge &&
        typeof latestCharge === "object" &&
        "id" in latestCharge
      ) {
        chargeId = (latestCharge as { id: string }).id;
      }
      console.log(
        `[Stripe webhook] [${session.id}] Resolved charge ID: ${chargeId ?? "NONE"} from PaymentIntent: ${paymentIntentId}`,
      );
    } catch (err) {
      console.error(
        `[Stripe webhook] [${session.id}] Failed to retrieve PaymentIntent for charge ID:`,
        err,
      );
    }
  }

  // ─── Calculate Financial Split (all in cents) ───
  const totalAmountCents = resolvePriceCents(product);

  // ─── Ensure Order Exists Safely ───
  let orderId: ObjectId;
  const existingOrder = await ordersCollection.findOne({
    stripeSessionId: session.id,
  });

  if (existingOrder) {
    orderId = existingOrder._id!;
    console.log(
      `[Stripe webhook] [${session.id}] Recovering from partial failure, order already exists:`,
      orderId.toString(),
    );
  } else {
    const newOrder: Order = {
      productId: product._id!,
      productTitle: product.title,
      productPriceCents: totalAmountCents,
      userId: new ObjectId(userId!),
      buyerEmail: buyerEmail ?? "",
      buyerName: typeof buyerName === "string" ? buyerName : "Cliente",
      status: "paid",
      createdAt: new Date(),
      updatedAt: new Date(),
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
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
        // Safe racing: ignore duplicate keys if multiple webhooks hit simultaneously
        const raceOrder = await ordersCollection.findOne({
          stripeSessionId: session.id,
        });
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

  // ─── Finish Financial Split ───
  const platformFeePercent = Math.min(
    100,
    Math.max(0, Number(process.env.PLATFORM_FEE_PERCENT) || 0),
  );
  const platformFeeCents = Math.round(
    (totalAmountCents * platformFeePercent) / 100,
  );

  // Resolve affiliate
  const affiliateUserId =
    typeof metadata.affiliateUserId === "string"
      ? metadata.affiliateUserId
      : null;
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

      // Look up affiliate user to check Stripe account status
      affiliateUser = await usersCollection.findOne({
        _id: new ObjectId(affiliateUserId),
      });
    } else {
      affiliateRecord = null; // Creator can't be affiliate of own product
    }
  }

  const creatorShareCents = Math.max(
    0,
    totalAmountCents - platformFeeCents - affiliateShareCents,
  );

  // Resolve creator
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

  // ─── Create Sale Document ───
  const sale: Sale = {
    orderId,
    productId: product._id!,
    buyerId: new ObjectId(userId!),
    creatorId,
    affiliateUserId: affiliateRecord
      ? new ObjectId(affiliateUserId!)
      : undefined,
    totalAmountCents,
    platformFeeCents,
    affiliateShareCents,
    creatorShareCents,
    stripeSessionId: session.id,
    stripePaymentIntentId: chargeId,
    status: "completed",
    creatorPayoutStatus: "pending",
    affiliatePayoutStatus: affiliateRecord ? "pending" : "not_applicable",
    createdAt: new Date(),
  };

  // ─── UNIVERSAL BALANCE ACCRUAL (CORRIGIDO) ───

  // Só prossegue se chargeId foi resolvido
  if (!chargeId) {
    console.error(
      `[Stripe webhook] [${session.id}] Could not resolve chargeId from PaymentIntent: ${paymentIntentId}, aborting balance accrual.`,
    );
    return; // ⚠️ interrompe aqui para evitar inconsistência
  }

  // Atualiza Sale para usar chargeId correto
  sale.stripePaymentIntentId = chargeId;

  // 1. Accrue Creator Balance
  if (creatorShareCents > 0) {
    sale.creatorPayoutStatus = "pending";
    await usersCollection.updateOne(
      { _id: new ObjectId(creatorId) },
      {
        $inc: {
          pendingBalanceCents: creatorShareCents,
          totalEarningsCents: creatorShareCents,
        },
      },
    );
    await userTransactionsCollection.insertOne({
      userId: new ObjectId(creatorId),
      amountCents: creatorShareCents,
      type: "sale",
      status: "pending",
      saleId: sale._id?.toString(),
      createdAt: new Date(),
    });
  } else {
    sale.creatorPayoutStatus = "pending";
  }

  // 2. Accrue Affiliate Balance
  if (affiliateRecord && affiliateUserId) {
    console.log("UPDATING AFFILIATE BALANCE", {
      affiliateUserId,
      affiliateShareCents,
    });

    const affiliateUserIdObj = new ObjectId(affiliateUserId);
    if (affiliateShareCents > 0) {
      sale.affiliatePayoutStatus = "pending";
      await usersCollection.updateOne(
        { _id: affiliateUserIdObj },
        {
          $inc: {
            pendingBalanceCents: affiliateShareCents,
            totalEarningsCents: affiliateShareCents,
          },
        },
      );
      await userTransactionsCollection.insertOne({
        userId: affiliateUserIdObj,
        amountCents: affiliateShareCents,
        type: "affiliate_commission",
        status: "pending",
        saleId: sale._id?.toString(),
        createdAt: new Date(),
      });
    }
  }

  // Payout triggers have been strictly decoupled into /api/cron/process-payouts
  // and /api/stripe/connect/status endpoints to prevent webhook race conditions.

  try {
    await salesCollection.insertOne(sale);
  } catch (err: any) {
    if (err.code === 11000) {
      console.log(
        `[Stripe webhook] [${session.id}] Race condition prevented: Sale already exists`,
      );
      return;
    }
    throw err;
  }

  // Link sale back to order
  await ordersCollection.updateOne(
    { _id: orderId },
    { $set: { saleId: sale._id } },
  );

  // Update product sales count
  await productsCollection.updateOne(
    { _id: product._id },
    { $inc: { sales: 1 } },
  );

  // Also record in legacy affiliateSales collection for backward compatibility
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
    `[Stripe webhook] [${session.id}] Sale recorded:`,
    JSON.stringify({
      orderId: orderId.toString(),
      saleId: sale._id?.toString(),
      totalAmountCents,
      platformFeeCents,
      creatorShareCents,
      affiliateShareCents,
      affiliatePayoutStatus: sale.affiliatePayoutStatus,
      creatorTransfer: sale.stripeTransferIdCreator ?? "none",
      affiliateTransfer: sale.stripeTransferIdAffiliate ?? "none",
    }),
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
  if (!sale) {
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
  } else {
    console.warn(
      "[Stripe webhook] Account updated, but no matching user found:",
      account.id,
    );
  }
}
