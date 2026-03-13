import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type StripeType from "stripe";
import { getDatabase } from "@/lib/mongodb";
import type { Order, Product, Affiliate, AffiliateSale } from "@/lib/types";
import { ObjectId } from "mongodb";

let stripe: StripeType | null = null;

function getStripe(): StripeType {
  if (!stripe) {
    const Stripe = require("stripe") as typeof StripeType;
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripe = new Stripe(secretKey, {
      apiVersion: "2024-06-20",
    });
  }
  return stripe;
}

export async function POST(request: NextRequest) {
  const stripeClient = getStripe();

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
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
    console.error("Error verifying Stripe webhook:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as StripeType.Checkout.Session;

      if (session.payment_status !== "paid") {
        return NextResponse.json({ received: true });
      }

      const metadata = session.metadata || {};
      const productId = metadata.productId;
      const userId = metadata.userId;
      const buyerName =
        metadata.buyerName || session.customer_details?.name || "Cliente";
      const buyerEmail =
        session.customer_details?.email || session.customer_email;

      if (!productId || !ObjectId.isValid(productId)) {
        console.error("Missing or invalid productId in metadata");
        return NextResponse.json({ received: true });
      }

      const db = await getDatabase();
      const productsCollection = db.collection<Product>("products");
      const ordersCollection = db.collection<Order>("orders");

      const product = await productsCollection.findOne({
        _id: new ObjectId(productId),
      });

      if (!product) {
        console.error("Product not found for webhook order");
        return NextResponse.json({ received: true });
      }

      // Prevent duplicate orders on retried webhooks
      const existingOrder = await ordersCollection.findOne({
        stripeSessionId: session.id,
      } as any);
      if (existingOrder) {
        return NextResponse.json({ received: true });
      }

      const newOrder: Order = {
        productId: product._id!,
        productTitle: product.title,
        productPrice: product.price,
        userId:
          userId && ObjectId.isValid(userId) ? new ObjectId(userId) : undefined,
        buyerEmail: buyerEmail || "",
        buyerName,
        status: "paid",
        createdAt: new Date(),
        updatedAt: new Date(),
        // @ts-expect-error - extended field on Order
        stripeSessionId: session.id,
      };

      const insertResult = await ordersCollection.insertOne(newOrder);
      const orderId = insertResult.insertedId;

      await productsCollection.updateOne(
        { _id: product._id },
        { $inc: { sales: 1 } },
      );

      const affiliateUserId = metadata.affiliateUserId;

      if (
        affiliateUserId &&
        ObjectId.isValid(affiliateUserId) &&
        product.affiliateEnabled
      ) {
        const affiliatesCollection = db.collection<Affiliate>("affiliates");
        const affiliateSalesCollection =
          db.collection<AffiliateSale>("affiliateSales");

        const affiliate = await affiliatesCollection.findOne({
          userId: new ObjectId(affiliateUserId),
          productId: product._id!,
        });

        if (
          affiliate &&
          !product.creatorId.equals(new ObjectId(affiliateUserId))
        ) {
          const commissionPercent =
            affiliate.commissionPercent ??
            product.affiliateCommissionPercent ??
            0;

          const commissionAmount = (product.price * commissionPercent) / 100;

          const saleDoc: AffiliateSale = {
            affiliateId: affiliate._id!,
            productId: product._id!,
            orderId: orderId,
            affiliateUserId: affiliate.userId,
            creatorUserId: product.creatorId,
            saleAmount: product.price,
            commissionAmount,
            createdAt: new Date(),
          };

          await affiliateSalesCollection.insertOne(saleDoc);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling Stripe webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
