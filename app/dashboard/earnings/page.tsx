import Link from "next/link"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Lightbulb, ArrowUpRight, DollarSign, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { getDatabase } from "@/lib/mongodb"
import type { Order, Product, Sale, User, UserTransaction } from "@/lib/types"
import { authConfig, verifySessionToken } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { ConnectStripeCard } from "@/components/dashboard/connect-stripe-card"

async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(authConfig.cookieName)?.value
  if (!token) return null

  const payload = verifySessionToken(token)
  if (!payload || !ObjectId.isValid(payload.userId)) return null

  const db = await getDatabase()
  const users = db.collection<User>("users")
  const user = await users.findOne({ _id: new ObjectId(payload.userId) })
  return user ?? null
}

export default async function EarningsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/earnings")}`)
  }

  const db = await getDatabase()
  const productsCollection = db.collection<Product>("products")
  const transactionsCollection = db.collection<UserTransaction>("userTransactions")

  // Use the new atomic single source of truth for total earnings
  const estimatedEarnings = (user.totalEarningsCents || 0) / 100
  const pendingBalance = (user.pendingBalanceCents || 0) / 100
  const isPayoutProcessing = user.payoutProcessing || false

  const recentTxsRaw = await transactionsCollection
    .find({ userId: user._id, status: { $in: ["paid", "pending"] }, type: { $ne: "payout" } })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray()

  // For transactions tied to a sale, we might want to fetch product titles.
  // The UserTransaction has a saleId. Let's just fetch the raw sales if we want product titles.
  const salesCollection = db.collection<Sale>("sales")
  const saleIds = recentTxsRaw.map(tx => tx.saleId).filter(Boolean).map(id => new ObjectId(id!))
  const relatedSales = await salesCollection.find({ _id: { $in: saleIds } }).toArray()

  const productIds = [...new Set(relatedSales.map(s => s.productId))]
  const relatedProducts = await productsCollection.find({ _id: { $in: productIds } }).toArray()
  const productsMap = new Map(relatedProducts.map(p => [p._id!.toString(), p.title]))
  const salesMap = new Map(relatedSales.map(s => [s._id!.toString(), s.productId.toString()]))

  const recentTransactions = recentTxsRaw.map(tx => {
    const saleId = tx.saleId
    const productId = saleId ? salesMap.get(saleId) : null
    const title = productId ? productsMap.get(productId) : "Produto Desconhecido"

    return {
      id: tx._id!.toString(),
      title,
      typeLabel: tx.type === 'affiliate_commission' ? 'Comissão de Afiliado' : 'Venda',
      netEarnings: tx.amountCents / 100,
      date: tx.createdAt
    }
  })

  // We can also fetch the exact number of sales/commissions they made instead of 'orders'
  const totalOrderCount = await transactionsCollection.countDocuments({
    userId: user._id,
    type: { $in: ["sale", "affiliate_commission"] }
  })

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Lightbulb className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
              Ganhos
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link href="/marketplace">
                Ver Marketplace
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Painel</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mb-8">
          <ConnectStripeCard
            stripeAccountId={user.stripeAccountId}
            stripeOnboardingComplete={user.stripeOnboardingComplete}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ganhos Vitalícios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight text-foreground">
                R$ {estimatedEarnings.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {totalOrderCount} recebimentos (vendas/comissões)
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saldo Pendente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight text-foreground">
                R$ {pendingBalance.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Aguardando repasse
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status Stripe
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPayoutProcessing ? (
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500">
                  <span className="font-medium animate-pulse">Processando pagamento...</span>
                </div>
              ) : user.stripeAccountId && user.stripeOnboardingComplete ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Conectado</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Repasses processados automaticamente</p>
                </div>
              ) : pendingBalance > 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-500">
                    R$ {pendingBalance.toFixed(2)} prontos para saque
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Conecte o Stripe para receber seus pagamentos.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Conecte sua conta Stripe acima para receber pagamentos.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 border-t border-border/50 pt-8">
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">
                Últimas Entradas
              </CardTitle>
              <CardDescription>
                Histórico detalhado das suas vendas mais recentes com os descontos de plataforma e afiliados aplicados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/40 py-10 text-center">
                  <p className="text-sm font-medium text-foreground">Nenhuma venda ainda</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Publicize seu produto e aguarde sua primeira venda para ver o histórico.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 text-left text-muted-foreground">
                        <th className="pb-3 pr-4 font-medium">Data</th>
                        <th className="pb-3 pr-4 font-medium">Produto</th>
                        <th className="hidden pb-3 pr-4 font-medium md:table-cell">Tipo</th>
                        <th className="pb-3 px-4 text-right font-medium">Ganhos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {recentTransactions.map((tx) => (
                        <tr key={tx.id} className="transition-colors hover:bg-muted/30">
                          <td className="py-3 pr-4 text-xs tabular-nums text-muted-foreground whitespace-nowrap">
                            {new Date(tx.date).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })}
                          </td>
                          <td className="py-3 pr-4 font-medium text-foreground">
                            <div>{tx.title}</div>
                            <div className="md:hidden text-xs text-muted-foreground mt-0.5">{tx.typeLabel}</div>
                          </td>
                          <td className="hidden py-3 pr-4 md:table-cell">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tx.typeLabel === 'Venda'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                              }`}>
                              {tx.typeLabel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-500 tabular-nums">
                            R$ {tx.netEarnings.toFixed(2)}
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
  )
}
