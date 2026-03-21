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
      .aggregate<{ _id: ObjectId; count: number; total: number }>([
        { $match: { affiliateId: { $in: affiliateIds } } },
        {
          $group: {
            _id: "$affiliateId",
            count: { $sum: 1 },
            total: { $sum: "$commissionAmount" },
          },
        },
      ])
      .toArray(),
  ]);
  const clicksMap = new Map(clicksAgg.map((c) => [c._id.toString(), c.count]));
  const salesMap = new Map(
    salesAgg.map((s) => [s._id.toString(), { count: s.count, total: s.total }]),
  );

  const baseUrl = getBaseUrl();
  const rows = affiliates.map((aff) => {
    const product = productsById.get(aff.productId.toString());
    const slug = product?.slug ?? "";
    return {
      productTitle: product?.title ?? "",
      affiliateLink: `${baseUrl}/produto/${slug}?ref=${userId.toString()}`,
      clicks: clicksMap.get(aff._id!.toString()) ?? 0,
      sales: salesMap.get(aff._id!.toString())?.count ?? 0,
      commission: salesMap.get(aff._id!.toString())?.total ?? 0,
    };
  });
  return rows;
}

export default async function AffiliatesDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/affiliates")}`);
  }

  const rows = await getAffiliateData(user._id!);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
            Programa de afiliados
          </span>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/marketplace">
                Ver Marketplace
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
        <Card className="border-border/50 bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Share2 className="h-5 w-5 text-primary" />
              Produtos que você promove
            </CardTitle>
            <CardDescription>
              Links de afiliado, cliques, vendas e comissões.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AffiliatesTable rows={rows} />
            {rows.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Você ainda não é afiliado de nenhum produto. Encontre produtos
                com programa de afiliados no{" "}
                <Link
                  href="/marketplace"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  marketplace
                </Link>{" "}
                e clique em &quot;Promover este produto&quot;.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
