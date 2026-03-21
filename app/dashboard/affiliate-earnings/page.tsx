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
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <img
                src="/images/logo.jpg"
                alt="Boas Ideias Online"
                className="h-8 w-8"
              />
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
              Ganhos de afiliado
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/affiliates">Meus links</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/marketplace">
                Marketplace
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MousePointer className="h-4 w-4" />
                Total de cliques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">
                {totalClicks}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ShoppingCart className="h-4 w-4" />
                Conversões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">
                {totalSales}
              </p>
              <p className="text-xs text-muted-foreground">
                Taxa: {conversionRate}%
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Saldo Universal Pendente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">
                R$ {pendingBalance.toFixed(2)}
              </p>
              {pendingBalance > 0 &&
                (!user.stripeAccountId || !user.stripeOnboardingComplete) && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-500 font-medium">
                    Conecte o Stripe para receber.
                  </p>
                )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50 bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Produtos que mais vendem
            </CardTitle>
            <CardDescription>
              Top 5 produtos por comissão gerada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topProductsWithNames.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhuma venda de afiliado ainda.
              </p>
            ) : (
              <ul className="space-y-3">
                {topProductsWithNames.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3"
                  >
                    <span className="font-medium text-foreground">
                      {p.title}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {p.sales} venda(s) · R$ {p.earnings.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 border-t border-border/50 pt-8">
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">
                Últimas Indicações Convertidas
              </CardTitle>
              <CardDescription>
                Histórico recente das suas comissões geradas por indicação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/40 py-10 text-center">
                  <p className="text-sm font-medium text-foreground">
                    Ainda sem comissões
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Divulgue seus links de parceiro para começar a ganhar.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 text-left text-muted-foreground">
                        <th className="pb-3 pr-4 font-medium">Data</th>
                        <th className="pb-3 pr-4 font-medium">Produto</th>
                        <th className="pb-3 px-4 text-right font-medium">
                          Sua Comissão
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {recentTransactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="transition-colors hover:bg-muted/30"
                        >
                          <td className="py-3 pr-4 text-xs tabular-nums text-muted-foreground whitespace-nowrap">
                            {new Date(tx.date).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3 pr-4 font-medium text-foreground">
                            {tx.title}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-500 tabular-nums">
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
