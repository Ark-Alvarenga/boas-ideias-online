import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Search } from "lucide-react";
import { getDatabase } from "@/lib/mongodb";
import { authConfig, verifySessionToken } from "@/lib/auth";
import { ObjectId } from "mongodb";
import type { Order, Product, User } from "@/lib/types";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { TrackPageView } from "@/components/track-page-view";
import { Card, CardContent } from "@/components/ui/card";
import { PurchaseCard, PurchaseCardSkeleton } from "./purchase-card";
import { Suspense } from "react";

async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authConfig.cookieName)?.value;
  if (!token) return null;
  const payload = verifySessionToken(token);
  if (!payload || !ObjectId.isValid(payload.userId)) return null;
  const db = await getDatabase();
  const user = await db
    .collection<User>("users")
    .findOne({ _id: new ObjectId(payload.userId) });
  return user ?? null;
}

async function getPurchasedProducts(userId: ObjectId) {
  const db = await getDatabase();

  // Fetch paid orders for this user
  const orders = await db
    .collection<Order>("orders")
    .find({ userId, status: "paid" })
    .sort({ createdAt: -1 })
    .toArray();

  if (orders.length === 0) return [];

  // Fetch product details for these orders
  const productIds = orders.map((o) => o.productId);
  const products = await db
    .collection<Product>("products")
    .find({ _id: { $in: productIds } })
    .toArray();

  const productsMap = new Map(products.map((p) => [p._id!.toString(), p]));

  return orders
    .map((order) => ({
      orderId: order._id!.toString(),
      purchaseDate: order.createdAt,
      product: productsMap.get(order.productId.toString()),
    }))
    .filter((item) => item.product !== undefined);
}

export default async function PurchasesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/purchases")}`);
  }

  const purchases = await getPurchasedProducts(user._id!);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader
        title="Minhas Compras"
        actions={
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-foreground font-bold shadow-[2px_2px_0px_#000]"
            asChild
          >
            <Link href="/marketplace">Marketplace</Link>
          </Button>
        }
      />
      <TrackPageView
        event="purchases_viewed"
        properties={{ purchases_count: purchases.length }}
      />

      <main className="mx-auto max-w-7xl p-6 lg:p-8">
        {purchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Card className="max-w-md rounded-3xl border-2 border-dashed border-foreground bg-muted/30 p-12 shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]">
              <CardContent className="flex flex-col items-center p-0">
                <div className="mb-6 rounded-full border-2 border-foreground bg-background p-6 shadow-[4px_4px_0px_#000]">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="mb-2 font-serif text-2xl font-black uppercase tracking-tight">
                  Nenhuma compra ainda
                </h2>
                <p className="mb-8 font-medium text-muted-foreground">
                  Você ainda não adquiriu nenhum produto. Explore o marketplace
                  e comece sua jornada!
                </p>
                <Button
                  className="h-14 w-full rounded-2xl border-2 border-foreground bg-primary text-lg font-black text-white shadow-[4px_4px_0px_#000] hover:bg-primary/90 transition-all uppercase tracking-widest"
                  asChild
                >
                  <Link href="/marketplace">Ver Marketplace</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {purchases.map((purchase) => (
              <PurchaseCard
                key={purchase.orderId}
                orderId={purchase.orderId}
                purchaseDate={purchase.purchaseDate}
                product={purchase.product as any}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
