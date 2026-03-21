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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <span className="font-serif text-xl font-black tracking-tight text-foreground uppercase">
            Programa de Afiliados
          </span>

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
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6 lg:p-8">
        <Card className="overflow-hidden rounded-3xl border-2 border-foreground bg-card shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]">
          <CardHeader className="border-b-2 border-foreground bg-muted/50 p-6">
            <CardTitle className="flex items-center gap-3 font-serif text-2xl font-black">
              <div className="rounded-xl border-2 border-foreground bg-accent p-2">
                <Share2 className="h-6 w-6 text-foreground" />
              </div>
              Produtos que você promove
            </CardTitle>
            <CardDescription className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Links de afiliado, métricas e comissões acumuladas.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center border-t-0 py-20 text-center px-6">
                <div className="mb-4 rounded-full border-2 border-foreground bg-background p-4 shadow-[4px_4px_0px_#000]">
                  <Share2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="font-serif text-xl font-black text-foreground uppercase tracking-tight">
                  Nenhuma afiliação ativa
                </h4>
                <p className="mt-2 max-w-sm text-sm font-bold text-muted-foreground">
                  Você ainda não é afiliado de nenhum produto. Vá ao marketplace
                  e comece a lucrar indicando ideias boas!
                </p>
                <Button
                  className="mt-8 h-12 rounded-xl border-2 border-foreground bg-primary px-8 font-black text-foreground shadow-[4px_4px_0px_#000]"
                  asChild
                >
                  <Link href="/marketplace">EXPLORAR MARKETPLACE</Link>
                </Button>
              </div>
            ) : (
              <AffiliatesTable rows={rows} />
            )}
          </CardContent>

          {/* TODO: Adicionar tabela de produtos sendo promovidos por afiliados */}
        </Card>
        <Card className="overflow-hidden mt-8 rounded-3xl border-2 border-foreground bg-card shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]">
          <CardHeader className="border-b-2 border-foreground bg-muted/50 p-6">
            <CardTitle className="flex items-center gap-3 font-serif text-2xl font-black">
              <div className="rounded-xl border-2 border-foreground bg-accent p-2">
                <Share2 className="h-6 w-6 text-foreground" />
              </div>
              Produtos seus sendo promovidos por afiliados
            </CardTitle>
            <CardDescription className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Métricas e comissões acumuladas.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center border-t-0 py-20 text-center px-6">
                <div className="mb-4 rounded-full border-2 border-foreground bg-background p-4 shadow-[4px_4px_0px_#000]">
                  <Share2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="font-serif text-xl font-black text-foreground uppercase tracking-tight">
                  Nenhum afiliado ainda
                </h4>
                <p className="mt-2 max-w-sm text-sm font-bold text-muted-foreground">
                  Ative o programa de afiliados no seu produto e deixe outras
                  pessoas venderem para você.
                </p>
                <Button
                  className="mt-8 h-12 rounded-xl border-2 border-foreground bg-primary px-8 font-black text-foreground shadow-[4px_4px_0px_#000]"
                  asChild
                >
                  <Link href="/dashboard/create-product">CRIAR PRODUTO</Link>
                </Button>
              </div>
            ) : (
              <AffiliatesTable rows={rows} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
