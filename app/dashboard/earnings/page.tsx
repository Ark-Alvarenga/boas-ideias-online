import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowUpRight, DollarSign, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getDatabase } from "@/lib/mongodb";
import type { Order, Product, Sale, User, UserTransaction } from "@/lib/types";
import { authConfig, verifySessionToken } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { ConnectStripeCard } from "@/components/dashboard/connect-stripe-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authConfig.cookieName)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload || !ObjectId.isValid(payload.userId)) return null;

  const db = await getDatabase();
  const users = db.collection<User>("users");
  const user = await users.findOne({ _id: new ObjectId(payload.userId) });
  return user ?? null;
}

export default async function EarningsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/earnings")}`);
  }

  const db = await getDatabase();
  const productsCollection = db.collection<Product>("products");
  const transactionsCollection =
    db.collection<UserTransaction>("userTransactions");

  // Use the new atomic single source of truth for total earnings
  const estimatedEarnings = (user.totalEarningsCents || 0) / 100;
  const pendingBalance = (user.pendingBalanceCents || 0) / 100;
  const isPayoutProcessing = user.payoutProcessing || false;

  const recentTxsRaw = await transactionsCollection
    .find({
      userId: user._id,
      status: { $in: ["paid", "pending"] },
      type: { $ne: "payout" },
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();

  // For transactions tied to a sale, we might want to fetch product titles.
  // The UserTransaction has a saleId. Let's just fetch the raw sales if we want product titles.
  const salesCollection = db.collection<Sale>("sales");
  const saleIds = recentTxsRaw
    .map((tx) => tx.saleId)
    .filter(Boolean)
    .map((id) => new ObjectId(id!));
  const relatedSales = await salesCollection
    .find({ _id: { $in: saleIds } })
    .toArray();

  const productIds = [...new Set(relatedSales.map((s) => s.productId))];
  const relatedProducts = await productsCollection
    .find({ _id: { $in: productIds } })
    .toArray();
  const productsMap = new Map(
    relatedProducts.map((p) => [p._id!.toString(), p.title]),
  );
  const salesMap = new Map(
    relatedSales.map((s) => [s._id!.toString(), s.productId.toString()]),
  );

  const recentTransactions = recentTxsRaw.map((tx) => {
    const saleId = tx.saleId;
    const productId = saleId ? salesMap.get(saleId) : null;
    const title = productId
      ? productsMap.get(productId)
      : "Produto Desconhecido";

    return {
      id: tx._id!.toString(),
      title,
      typeLabel:
        tx.type === "affiliate_commission" ? "Comissão de Afiliado" : "Venda",
      netEarnings: tx.amountCents / 100,
      date: tx.createdAt,
    };
  });

  // We can also fetch the exact number of sales/commissions they made instead of 'orders'
  const totalOrderCount = await transactionsCollection.countDocuments({
    userId: user._id,
    type: { $in: ["sale", "affiliate_commission"] },
  });

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Ganhos e Vendas" />

      <main className="mx-auto max-w-7xl p-6 lg:p-8">
        <div className="mb-10">
          <ConnectStripeCard
            stripeAccountId={user!.stripeAccountId}
            stripeOnboardingComplete={user!.stripeOnboardingComplete}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
            <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              GANHOS VITALÍCIOS
            </div>
            <div className="mt-2 text-3xl font-black text-foreground">
              R$ {estimatedEarnings.toFixed(2)}
            </div>
            <div className="mt-2 text-sm font-bold text-primary">
              {totalOrderCount} recebimentos totais
            </div>
          </div>

          <div className="rounded-2xl border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
            <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              SALDO PENDENTE
            </div>
            <div className="mt-2 text-3xl font-black text-foreground">
              R$ {pendingBalance.toFixed(2)}
            </div>
            <div className="mt-2 text-sm font-bold text-muted-foreground">
              Aguardando repasse automático
            </div>
          </div>

          <div className="rounded-2xl border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
            <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              STATUS STRIPE
            </div>
            <div className="mt-2">
              {isPayoutProcessing ? (
                <div className="flex items-center gap-2 text-blue-600 font-black italic animate-pulse">
                  PROCESSANDO PAGAMENTO...
                </div>
              ) : user!.stripeAccountId && user!.stripeOnboardingComplete ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-emerald-500 font-black">
                    <CheckCircle2 className="h-5 w-5 stroke-[3px]" />
                    CONECTADO
                  </div>
                  <p className="text-xs font-bold text-muted-foreground">
                    Repasses automáticos ativados
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="text-amber-500 font-black">PENDENTE</div>
                  <p className="text-xs font-bold text-muted-foreground">
                    Conecte para receber ganhos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl border-2 border-foreground bg-card shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]">
          <div className="border-b-2 border-foreground bg-muted/50 p-6">
            <h3 className="font-serif text-2xl font-black text-foreground">
              Últimas Entradas
            </h3>
            <p className="mt-1 text-sm font-bold text-muted-foreground">
              Histórico detalhado das suas vendas e comissões.
            </p>
          </div>

          <div className="p-0">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center border-t-0 py-20 text-center">
                <div className="mb-4 rounded-full border-2 border-foreground bg-background p-4 shadow-[4px_4px_0px_#000]">
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="font-serif text-xl font-black text-foreground">
                  Nenhuma entrada ainda
                </h4>
                <p className="mt-2 max-w-xs text-sm font-medium text-muted-foreground">
                  Aguardando sua primeira venda para começar o histórico.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-foreground bg-muted/30 text-left">
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">
                        Data
                      </th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">
                        Produto
                      </th>
                      <th className="hidden px-6 py-4 text-xs font-black uppercase tracking-widest md:table-cell">
                        Tipo
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest">
                        Ganhos Líquidos
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-foreground/10">
                    {recentTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-6 py-4 text-sm font-bold tabular-nums text-muted-foreground">
                          {new Date(tx.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-foreground">
                            {tx.title}
                          </div>
                          <div className="md:hidden mt-0.5 text-xs font-bold text-primary">
                            {tx.typeLabel}
                          </div>
                        </td>
                        <td className="hidden px-6 py-4 md:table-cell">
                          <span
                            className={`inline-flex rounded-lg border-2 border-foreground px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${
                              tx.typeLabel === "Venda"
                                ? "bg-blue-400 text-foreground"
                                : "bg-purple-400 text-foreground"
                            }`}
                          >
                            {tx.typeLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-foreground tabular-nums">
                          R$ {tx.netEarnings.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
