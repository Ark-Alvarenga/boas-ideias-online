import Link from "next/link"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Lightbulb, ArrowUpRight, DollarSign, MousePointer, ShoppingCart, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { getDatabase } from "@/lib/mongodb"
import type { Affiliate, AffiliateClick, AffiliateSale, Product, User } from "@/lib/types"
import { authConfig, verifySessionToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(authConfig.cookieName)?.value
  if (!token) return null
  const payload = verifySessionToken(token)
  if (!payload || !ObjectId.isValid(payload.userId)) return null
  const db = await getDatabase()
  const user = await db.collection<User>("users").findOne({ _id: new ObjectId(payload.userId) })
  return user ?? null
}

export default async function AffiliateEarningsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/affiliate-earnings")}`)
  }

  const db = await getDatabase()
  const userId = user._id!
  const affiliates = await db.collection<Affiliate>("affiliates").find({ userId }).toArray()
  const affiliateIds = affiliates.map((a) => a._id!)

  const [totalClicks, totalSales, totalEarnings, topProducts] = await Promise.all([
    db.collection<AffiliateClick>("affiliateClicks").countDocuments({ affiliateId: { $in: affiliateIds } }),
    db.collection<AffiliateSale>("affiliateSales").countDocuments({ affiliateId: { $in: affiliateIds } }),
    db
      .collection<AffiliateSale>("affiliateSales")
      .aggregate<{ total: number }>([
        { $match: { affiliateId: { $in: affiliateIds } } },
        { $group: { _id: null, total: { $sum: "$commissionAmount" } } },
      ])
      .toArray()
      .then((r) => r[0]?.total ?? 0),
    db
      .collection<AffiliateSale>("affiliateSales")
      .aggregate<{ productId: ObjectId; count: number; total: number }>([
        { $match: { affiliateId: { $in: affiliateIds } } },
        { $group: { _id: "$productId", count: { $sum: 1 }, total: { $sum: "$commissionAmount" } } },
        { $sort: { total: -1 } },
        { $limit: 5 },
      ])
      .toArray(),
  ])

  const productIds = topProducts.map((p) => p._id)
  const products =
    productIds.length > 0
      ? await db.collection<Product>("products").find({ _id: { $in: productIds } }).toArray()
      : []
  const productsById = new Map(products.map((p) => [p._id!.toString(), p]))
  const topProductsWithNames = topProducts.map((p) => ({
    title: productsById.get(p._id.toString())?.title ?? "Produto",
    sales: p.count,
    earnings: p.total,
  }))

  const conversionRate = totalClicks > 0 ? ((totalSales / totalClicks) * 100).toFixed(1) : "0"

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Lightbulb className="h-4 w-4 text-primary-foreground" />
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
              <p className="text-2xl font-semibold text-foreground">{totalClicks}</p>
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
              <p className="text-2xl font-semibold text-foreground">{totalSales}</p>
              <p className="text-xs text-muted-foreground">Taxa: {conversionRate}%</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Ganhos totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">
                R$ {totalEarnings.toFixed(2)}
              </p>
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
                    <span className="font-medium text-foreground">{p.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {p.sales} venda(s) · R$ {p.earnings.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
