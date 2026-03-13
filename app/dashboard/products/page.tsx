import Link from "next/link"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Lightbulb, ArrowUpRight, Edit, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getDatabase } from "@/lib/mongodb"
import type { Product, User } from "@/lib/types"
import { authConfig, verifySessionToken } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { ProductAffiliateCell } from "@/components/dashboard/product-affiliate-cell"

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

export default async function ProductsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/products")}`)
  }

  const db = await getDatabase()
  const productsCollection = db.collection<Product>("products")

  const products = await productsCollection
    .find({ creatorId: user._id })
    .sort({ createdAt: -1 })
    .toArray()

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Lightbulb className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
              Meus produtos
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              asChild
            >
              <Link href="/marketplace">
                Ver Marketplace
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/product-affiliates">Afiliados</Link>
            </Button>
            <Button size="sm" className="shadow-sm" asChild>
              <Link href="/dashboard/create-product">
                + Novo produto
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
        {!user.stripeOnboardingComplete && (
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            Conecte sua conta Stripe para publicar e vender seus produtos. Produtos criados sem Stripe conectado ficam como rascunho.
            <Link
              href="/dashboard"
              className="ml-1 font-medium underline-offset-4 hover:underline"
            >
              Conectar Stripe
            </Link>
          </div>
        )}
        <Card className="border-border/50 bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Meus produtos</CardTitle>
            <CardDescription>
              Veja seus produtos, acompanhe vendas e acesse rapidamente as páginas de venda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/40 p-6 text-sm text-muted-foreground">
                Você ainda não publicou nenhum produto.{" "}
                <Link
                  href="/dashboard/create-product"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Crie o primeiro agora
                </Link>
                .
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product._id!.toString()}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-background p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500/15 to-indigo-500/15">
                        <span className="font-serif text-lg font-semibold text-foreground/30">
                          {product.title.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {product.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span>R${product.price}</span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span>{product.sales} vendas</span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span>
                            Status:{" "}
                            {product.status === "active"
                              ? "Ativo"
                              : product.status === "draft"
                              ? "Rascunho"
                              : "Arquivado"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden min-w-[140px] sm:block">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">Afiliados</p>
                        <ProductAffiliateCell
                          productSlug={product.slug}
                          affiliateEnabled={product.affiliateEnabled ?? false}
                          affiliateCommissionPercent={product.affiliateCommissionPercent ?? 20}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs"
                        >
                          <Edit className="mr-1 h-3.5 w-3.5" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs"
                          asChild
                        >
                          <Link href={`/produto/${product.slug}`}>
                            <ExternalLink className="mr-1 h-3.5 w-3.5" />
                            Ver
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

