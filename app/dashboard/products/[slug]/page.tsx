import Link from "next/link"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Lightbulb, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { authConfig, verifySessionToken } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import type { Product, User } from "@/lib/types"
import { ObjectId } from "mongodb"
import { ProductEditForm } from "@/components/dashboard/product-edit-form"

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

export default async function DashboardProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const user = await getCurrentUser()
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/dashboard/products/${slug}`)}`)
  }

  const db = await getDatabase()
  const productsCollection = db.collection<Product>("products")

  const product = await productsCollection.findOne({
    slug,
    creatorId: user._id!,
  })

  if (!product) {
    redirect("/dashboard/products")
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/dashboard/products" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Lightbulb className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
              Gerenciar produto
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
            <Button size="sm" asChild>
              <Link href={`/produto/${product.slug}`}>Ver página pública</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 lg:px-8 lg:py-12">
        <Card className="border-border/50 bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{product.title}</CardTitle>
            <CardDescription>
              Atualize informações do produto e acompanhe estatísticas básicas. Alterações salvas aqui são refletidas no marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductEditForm
              slug={product.slug}
              initialTitle={product.title}
              initialDescription={product.description}
              initialPrice={product.price}
              initialCategory={product.category}
              status={product.status}
              views={product.views}
              sales={product.sales}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

