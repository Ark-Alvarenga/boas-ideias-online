import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowUpRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getDatabase } from "@/lib/mongodb";
import type {
  Affiliate,
  AffiliateClick,
  AffiliateSale,
  Product,
  User,
} from "@/lib/types";
import { authConfig, verifySessionToken } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { AffiliatesTable } from "./affiliates-table";
import { PeoplePromotingTable } from "./people-promoting-table";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PlusCircle, Users } from "lucide-react";
import { TrackPageView } from "@/components/track-page-view";

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

import { getBaseUrl } from "@/lib/utils";

async function getAffiliateData(userId: ObjectId) {
  const db = await getDatabase();
  const affiliates = await db
    .collection<Affiliate>("affiliates")
    .find({ userId })
    .toArray();
  const productIds = affiliates.map((a) => a.productId);
  const products =
    productIds.length > 0
      ? await db
          .collection<Product>("products")
          .find({ _id: { $in: productIds } })
          .toArray()
      : [];
  const productsById = new Map(products.map((p) => [p._id!.toString(), p]));
  const affiliateIds = affiliates.map((a) => a._id!);

  const [clicksAgg, salesAgg] = await Promise.all([
    db
      .collection<AffiliateClick>("affiliateClicks")
      .aggregate<{ _id: ObjectId; count: number }>([
        { $match: { affiliateId: { $in: affiliateIds } } },
        { $group: { _id: "$affiliateId", count: { $sum: 1 } } },
      ])
      .toArray(),
    db
      .collection<AffiliateSale>("affiliateSales")
      .aggregate<{
        _id: ObjectId;
        count: number;
        totalRevenueCents: number;
        totalCommissionCents: number;
      }>([
        { $match: { affiliateId: { $in: affiliateIds } } },
        {
          $group: {
            _id: "$affiliateId",
            count: { $sum: 1 },
            totalRevenueCents: { $sum: "$saleAmountCents" },
            totalCommissionCents: { $sum: "$commissionAmountCents" },
          },
        },
      ])
      .toArray(),
  ]);
  const clicksMap = new Map(clicksAgg.map((c) => [c._id.toString(), c.count]));
  const salesMap = new Map(
    salesAgg.map((s) => [
      s._id.toString(),
      {
        count: s.count,
        revenue: s.totalRevenueCents / 100,
        commission: s.totalCommissionCents / 100,
      },
    ]),
  );

  const baseUrl = getBaseUrl();
  const rows = affiliates.map((aff) => {
    const product = productsById.get(aff.productId.toString());
    const slug = product?.slug ?? "";
    const stats = salesMap.get(aff._id!.toString());
    return {
      productTitle: product?.title ?? "",
      affiliateLink: `${baseUrl}/produto/${slug}?ref=${userId.toString()}`,
      clicks: clicksMap.get(aff._id!.toString()) ?? 0,
      sales: stats?.count ?? 0,
      revenue: stats?.revenue ?? 0,
      commission: stats?.commission ?? 0,
    };
  });
  return rows;
}

async function getPeoplePromotingData(userId: ObjectId) {
  const db = await getDatabase();
  const myProducts = await db
    .collection<Product>("products")
    .find({ creatorId: userId })
    .toArray();

  if (myProducts.length === 0) return [];

  const myProductIds = myProducts.map((p) => p._id!);
  const productsById = new Map(myProducts.map((p) => [p._id!.toString(), p]));

  // Get all affiliates for these products
  const affiliates = await db
    .collection<Affiliate>("affiliates")
    .find({ productId: { $in: myProductIds } })
    .toArray();

  if (affiliates.length === 0) return [];

  const affiliateIds = affiliates.map((a) => a._id!);
  const affiliateUserIds = affiliates.map((a) => a.userId);

  // Fetch affiliate user names
  const users = await db
    .collection<User>("users")
    .find({ _id: { $in: affiliateUserIds } })
    .project({ name: 1 })
    .toArray();
  const usersById = new Map(users.map((u) => [u._id!.toString(), u.name]));

  const [clicksAgg, salesAgg] = await Promise.all([
    db
      .collection<AffiliateClick>("affiliateClicks")
      .aggregate<{ _id: ObjectId; count: number }>([
        { $match: { affiliateId: { $in: affiliateIds } } },
        { $group: { _id: "$affiliateId", count: { $sum: 1 } } },
      ])
      .toArray(),
    db
      .collection<AffiliateSale>("affiliateSales")
      .aggregate<{
        _id: ObjectId;
        count: number;
        totalSaleCents: number;
        totalCommissionCents: number;
      }>([
        { $match: { affiliateId: { $in: affiliateIds } } },
        {
          $group: {
            _id: "$affiliateId",
            count: { $sum: 1 },
            totalSaleCents: { $sum: "$saleAmountCents" },
            totalCommissionCents: { $sum: "$commissionAmountCents" },
          },
        },
      ])
      .toArray(),
  ]);

  const clicksMap = new Map(clicksAgg.map((c) => [c._id.toString(), c.count]));
  const salesMap = new Map(
    salesAgg.map((s) => [
      s._id.toString(),
      {
        count: s.count,
        totalSaleValue: s.totalSaleCents / 100,
        affiliateEarnings: s.totalCommissionCents / 100,
      },
    ]),
  );

  const PLATFORM_FEE_RATE = 0.10; // 10% platform fee

  // Group by product
  const result = myProducts.map((product) => {
    const productAffiliates = affiliates.filter(
      (a) => a.productId.toString() === product._id!.toString(),
    );
    const affiliateRows = productAffiliates.map((aff) => {
      const stats = salesMap.get(aff._id!.toString());
      const totalSaleValue = stats?.totalSaleValue ?? 0;
      const affiliateEarnings = stats?.affiliateEarnings ?? 0;
      const platformFee = totalSaleValue * PLATFORM_FEE_RATE;
      const creatorEarnings = Math.max(0, totalSaleValue - affiliateEarnings - platformFee);
      return {
        affiliateName: usersById.get(aff.userId.toString()) ?? "Afiliado",
        clicks: clicksMap.get(aff._id!.toString()) ?? 0,
        sales: stats?.count ?? 0,
        totalSaleValue,
        affiliateEarnings,
        creatorEarnings,
      };
    });

    return {
      productId: product._id!.toString(),
      productTitle: product.title,
      affiliates: affiliateRows,
    };
  });

  return result.filter((p) => p.affiliates.length > 0);
}

export default async function AffiliatesDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/affiliates")}`);
  }

  const [affiliateData, promotingData] = await Promise.all([
    getAffiliateData(user._id!),
    getPeoplePromotingData(user._id!),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        title="Programa de Afiliados"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-foreground font-bold shadow-[2px_2px_0px_#000]"
              asChild
            >
              <Link href="/marketplace">
                Marketplace
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        }
      />

      <main className="mx-auto max-w-7xl p-6 lg:p-8 space-y-12">
        <TrackPageView event="affiliate_dashboard_viewed" />
        {/* Section 1: Products You Promote */}
        <section>
          <div className="mb-6">
            <h2 className="font-serif text-3xl font-black tracking-tight text-foreground">
              Produtos que você promove
            </h2>
            <p className="text-muted-foreground font-medium">
              Sua performance como afiliado de outros criadores.
            </p>
          </div>

          <Card className="overflow-hidden rounded-3xl border-2 border-foreground bg-card shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]">
            <CardContent className="p-0">
              {affiliateData.length === 0 ? (
                <div className="flex flex-col items-center justify-center border-t-0 py-20 text-center px-6">
                  <div className="mb-4 rounded-full border-2 border-foreground bg-background p-4 shadow-[4px_4px_0px_#000]">
                    <Share2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h4 className="font-serif text-xl font-black text-foreground uppercase tracking-tight">
                    Nenhuma afiliação ativa
                  </h4>
                  <p className="mt-2 max-w-sm text-sm font-bold text-muted-foreground">
                    Você ainda não é afiliado de nenhum produto. Vá ao
                    marketplace e comece a lucrar indicando ideias boas!
                  </p>
                  <Button
                    className="mt-8 h-12 rounded-xl border-2 border-foreground bg-accent px-8 font-black text-foreground shadow-[4px_4px_0px_#000] hover:bg-accent/80 "
                    asChild
                  >
                    <Link href="/marketplace">EXPLORAR MARKETPLACE</Link>
                  </Button>
                </div>
              ) : (
                <AffiliatesTable rows={affiliateData} />
              )}
            </CardContent>
          </Card>
        </section>

        <hr className="border-2 border-foreground/10" />

        {/* Section 2: Your Products Being Promoted */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-3xl font-black tracking-tight text-foreground">
                Seus produtos sendo promovidos
              </h2>
              <p className="text-muted-foreground font-medium">
                Performance dos afiliados que estão vendendo por você.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex border-2 border-foreground font-bold shadow-[2px_2px_0px_#000]"
              asChild
            >
              <Link href="/dashboard/products">Gerenciar Produtos</Link>
            </Button>
          </div>

          {promotingData.length === 0 ? (
            <Card className="rounded-3xl border-2 border-dashed border-foreground bg-muted/30 py-16 shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full border-2 border-foreground bg-background p-4 shadow-[4px_4px_0px_#000]">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-xl font-black uppercase tracking-tight">
                  Nenhum afiliado ainda
                </h3>
                <p className="mt-2 max-w-sm text-sm font-bold text-muted-foreground">
                  Ative o programa de afiliados nos seus produtos para que
                  outros possam te ajudar a vender e escalar seu negócio.
                </p>
                <Button
                  className="mt-8 h-12 rounded-xl border-2 border-foreground bg-background px-8 font-black text-foreground shadow-[4px_4px_0px_#000]"
                  asChild
                >
                  <Link href="/dashboard/products">VER MEUS PRODUTOS</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <PeoplePromotingTable data={promotingData} />
          )}
        </section>
      </main>
    </div>
  );
}
