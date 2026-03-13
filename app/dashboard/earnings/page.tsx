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
import type { Order, Product, User } from "@/lib/types"
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
  const ordersCollection = db.collection<Order>("orders")

  const myProducts = await productsCollection
    .find({ creatorId: user._id })
    .toArray()
  const myProductIds = myProducts.map((p) => p._id!)

  const orders = await ordersCollection
    .find({
      productId: { $in: myProductIds },
      status: "paid",
    })
    .toArray()

  const totalSalesCents = orders.reduce((sum, o) => sum + o.productPrice * 100, 0)
  const totalSales = totalSalesCents / 100
  const platformFeePercent = Math.min(
    100,
    Math.max(0, Number(process.env.PLATFORM_FEE_PERCENT) || 0),
  )
  const platformFeeAmount = totalSales * (platformFeePercent / 100)
  const estimatedEarnings = totalSales - platformFeeAmount

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Lightbulb className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
              Ganhos
            </span>
          </Link>

          <div className="flex items-center gap-3">
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

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
        <div className="mb-8">
          <ConnectStripeCard
            stripeAccountId={user.stripeAccountId}
            stripeOnboardingComplete={user.stripeOnboardingComplete}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vendas totais (produtos)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight text-foreground">
                R$ {totalSales.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {orders.length} venda(s) nos seus produtos
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ganhos estimados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight text-foreground">
                R$ {estimatedEarnings.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Após taxa da plataforma ({platformFeePercent}%)
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
              {user.stripeAccountId && user.stripeOnboardingComplete ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Conectado</span>
                </div>
              ) : user.stripeAccountId ? (
                <p className="text-sm text-amber-600 dark:text-amber-500">
                  Conclua o onboarding no Stripe para receber pagamentos.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Conecte sua conta Stripe acima para receber pagamentos.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
