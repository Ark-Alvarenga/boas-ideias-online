import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  ArrowUpRight,
  DollarSign,
  MousePointer,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
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
  Product,
  User,
  UserTransaction,
} from "@/lib/types";
import { authConfig, verifySessionToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

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

export default async function AffiliateEarningsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent("/dashboard/affiliate-earnings")}`,
    );
  }

  const db = await getDatabase();
  const userId = user._id!;
  const affiliates = await db
    .collection<Affiliate>("affiliates")
    .find({ userId })
    .toArray();
  const affiliateIds = affiliates.map((a) => a._id!);

  const pendingBalance = (user.pendingBalanceCents || 0) / 100;

  const userTransactionsCollection =
    db.collection<UserTransaction>("userTransactions");

  const [totalClicks, affiliateTxs, recentTxsRaw] = await Promise.all([
    db
      .collection<AffiliateClick>("affiliateClicks")
      .countDocuments({ affiliateId: { $in: affiliateIds } }),
    userTransactionsCollection
      .find({
        userId: user._id,
        type: "affiliate_commission",
        status: { $in: ["paid", "pending"] },
      })
      .toArray(),
    userTransactionsCollection
      .find({
        userId: user._id,
        type: "affiliate_commission",
        status: { $in: ["paid", "pending"] },
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray(),
  ]);

  const totalSales = affiliateTxs.length;
  const totalEarnings =
    affiliateTxs.reduce((sum, tx) => sum + tx.amountCents, 0) / 100;

  // Calculate top products
  const productEarnings = new Map<string, { count: number; total: number }>();
  // Since UserTransaction only has saleId, we need to resolve products via Sales
  const salesCol = db.collection("sales");
  const saleIds = [
    ...new Set(affiliateTxs.map((tx) => tx.saleId).filter(Boolean)),
  ].map((id) => new ObjectId(id!));
  const relatedSalesRaw = await salesCol
    .find({ _id: { $in: saleIds } })
    .toArray();
  const saleToProductMap = new Map(
    relatedSalesRaw.map((s) => [s._id.toString(), s.productId.toString()]),
  );

  // Now calculate top
  for (const tx of affiliateTxs) {
    if (!tx.saleId) continue;
    const pid = saleToProductMap.get(tx.saleId);
    if (!pid) continue;
    const existing = productEarnings.get(pid) || { count: 0, total: 0 };
    productEarnings.set(pid, {
      count: existing.count + 1,
      total: existing.total + tx.amountCents,
    });
  }

  const topProducts = Array.from(productEarnings.entries())
    .map(([pid, stats]) => ({ _id: new ObjectId(pid), ...stats }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const productIdsToFetch = new Set([
    ...topProducts.map((p) => p._id.toString()),
    ...recentTxsRaw
      .map((tx) => saleToProductMap.get(tx.saleId!) || "")
      .filter(Boolean),
  ]);

  const products =
    productIdsToFetch.size > 0
      ? await db
          .collection<Product>("products")
          .find({
            _id: {
              $in: Array.from(productIdsToFetch).map((id) => new ObjectId(id)),
            },
          })
          .toArray()
      : [];
  const productsById = new Map(products.map((p) => [p._id!.toString(), p]));
  const topProductsWithNames = topProducts.map((p) => ({
    title: productsById.get(p._id.toString())?.title ?? "Produto",
    sales: p.count,
    earnings: p.total / 100,
  }));

  const recentTransactions = recentTxsRaw.map((tx) => {
    const pId = tx.saleId ? saleToProductMap.get(tx.saleId) : null;
    return {
      id: tx._id!.toString(),
      title: pId
        ? (productsById.get(pId)?.title ?? "Produto Desconhecido")
        : "Produto Desconhecido",
      earnings: tx.amountCents / 100,
      date: tx.createdAt,
    };
  });

  const conversionRate =
    totalClicks > 0 ? ((totalSales / totalClicks) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="font-serif text-xl font-black tracking-tight uppercase">
              Ganhos de Afiliado
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-foreground font-bold shadow-[2px_2px_0px_#000]"
              asChild
            >
              <Link href="/dashboard/affiliates">Meus Links</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-foreground bg-primary font-bold shadow-[2px_2px_0px_#000]"
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
        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="rounded-2xl border-2 border-foreground bg-card shadow-[4px_4px_0px_#000]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                <MousePointer className="h-4 w-4" />
                Cliques Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-4xl font-black text-foreground">
                {totalClicks}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-2 border-foreground bg-primary shadow-[4px_4px_0px_#000]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground">
                <ShoppingCart className="h-4 w-4" />
                Vendas Realizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-4xl font-black text-foreground">
                {totalSales}
              </p>
              <p className="mt-1 text-xs font-black uppercase tracking-widest text-foreground/70">
                TAXA DE CONV.: {conversionRate}%
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-2 border-foreground bg-card shadow-[4px_4px_0px_#000]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Comissões Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-4xl font-black text-foreground tabular-nums text-emerald-600">
                R$ {pendingBalance.toFixed(2)}
              </p>
              {pendingBalance > 0 &&
                (!user.stripeAccountId || !user.stripeOnboardingComplete) && (
                  <p className="mt-2 rounded-lg border-2 border-amber-600 bg-amber-50 p-2 text-[10px] font-black uppercase tracking-tight text-amber-700">
                    CONECTE O STRIPE PARA RECEBER
                  </p>
                )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr,2fr]">
          <Card className="overflow-hidden rounded-2xl border-2 border-foreground bg-card shadow-[4px_4px_0px_#000]">
            <CardHeader className="border-b-2 border-foreground bg-muted/50 pb-4">
              <CardTitle className="flex items-center gap-3 font-serif text-xl font-black">
                <TrendingUp className="h-5 w-5 text-primary" />
                Mais Vendidos
              </CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Top 5 produtos convertidos.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {topProductsWithNames.length === 0 ? (
                <p className="py-12 text-center text-xs font-bold text-muted-foreground uppercase">
                  Nenhuma venda ainda.
                </p>
              ) : (
                <ul className="divide-y-2 divide-foreground/10">
                  {topProductsWithNames.map((p, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between px-6 py-4 hover:bg-muted/30"
                    >
                      <div className="flex flex-col">
                        <span className="font-serif font-black text-foreground">
                          {p.title}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          {p.sales} Vendas
                        </span>
                      </div>
                      <span className="font-black text-emerald-600 tabular-nums">
                        R$ {p.earnings.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl border-2 border-foreground bg-card shadow-[8px_8px_0px_#000]">
            <CardHeader className="border-b-2 border-foreground bg-muted/50 pb-4">
              <CardTitle className="font-serif text-xl font-black">
                Últimas Comissões
              </CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Histórico recente das suas indicações premiadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {recentTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <p className="text-sm font-black text-foreground uppercase">
                    Ainda sem comissões
                  </p>
                  <p className="mt-1 text-xs font-bold text-muted-foreground">
                    Divulgue seus links para começar.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-foreground/10 bg-muted/20 text-left">
                        <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Data
                        </th>
                        <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Produto
                        </th>
                        <th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Sua Comissão
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-foreground/5">
                      {recentTransactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="transition-colors hover:bg-muted/30"
                        >
                          <td className="px-6 py-4 text-[10px] font-black tabular-nums text-muted-foreground uppercase">
                            {new Date(tx.date).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </td>
                          <td className="px-6 py-4 font-serif font-black text-foreground truncate max-w-[150px]">
                            {tx.title}
                          </td>
                          <td className="px-6 py-4 text-right font-black text-emerald-600 tabular-nums">
                            R$ {tx.earnings.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
