import Link from "next/link"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ShoppingCart,
  CheckCircle2,
  Star,
  Download,
  Shield,
  ArrowLeft,
  Users,
} from "lucide-react"
import { getDatabase } from "@/lib/mongodb"
import type { Product, User } from "@/lib/types"
import { authConfig, verifySessionToken } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { PromoteProductButton } from "@/components/product/promote-product-button"

interface ProductPageProps {
  params: { slug: string }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params

  const db = await getDatabase()
  const collection = db.collection<Product>("products")

  const product = await collection.findOne({ slug, status: "active" })

  if (!product) {
    return notFound()
  }

  let currentUser: User | null = null
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(authConfig.cookieName)?.value
    if (token) {
      const payload = verifySessionToken(token)
      if (payload && ObjectId.isValid(payload.userId)) {
        const u = await db.collection<User>("users").findOne({ _id: new ObjectId(payload.userId) })
        currentUser = u ?? null
      }
    }
  } catch {
    // ignore
  }
  const isCreator = currentUser ? product.creatorId.equals(currentUser._id!) : false

  await collection.updateOne({ slug }, { $inc: { views: 1 } })

  const relatedProductsCursor = collection
    .find({
      category: product.category,
      slug: { $ne: slug },
      status: "active",
    })
    .limit(3)

  const relatedProducts = await relatedProductsCursor.toArray()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-10 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-10">
            <Link 
              href="/marketplace" 
              className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Marketplace
            </Link>
          </nav>

          <div className="grid gap-16 lg:grid-cols-5">
            {/* Product Info */}
            <div className="space-y-10 lg:col-span-3">
              {/* Product Cover */}
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-linear-to-br from-blue-500/15 to-indigo-500/15">
                {product.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.coverImage}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-serif text-8xl font-semibold text-foreground/10">
                      {product.title.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute left-5 top-5">
                  <span className="inline-flex rounded-md bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Title and Creator */}
              <div>
                <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {product.title}
                </h1>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                    {product.creatorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {product.creatorName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Criador de conteúdo digital
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 rounded-xl border border-border/50 bg-muted/30 p-5">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="font-semibold text-foreground">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount} avaliações)
                  </span>
                </div>
                <div className="h-5 w-px bg-border" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="font-semibold text-foreground">
                    {product.sales}
                  </span>{" "}
                  vendas
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="mb-5 text-lg font-semibold text-foreground">
                  Sobre este produto
                </h2>
                <div className="space-y-4">
                  {product.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="leading-relaxed text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* What you will learn */}
              <div>
                <h2 className="mb-5 text-lg font-semibold text-foreground">
                  O que está incluído
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {(product.features || []).map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Purchase Card */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <Card className="border-border/50 bg-card shadow-xl shadow-primary/5">
                  <CardContent className="p-6 lg:p-8">
                    <div className="mb-8">
                      <p className="mb-1 text-sm text-muted-foreground">Preço</p>
                      <span className="text-4xl font-semibold tracking-tight text-foreground">
                        R${product.price}
                      </span>
                    </div>

                    <Button 
                      size="lg" 
                      className="h-12 w-full shadow-sm"
                      asChild
                    >
                      <Link href={`/checkout/${product.slug}`}>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Comprar Agora
                      </Link>
                    </Button>

                    <div className="my-8 h-px bg-border/50" />

                    <ul className="space-y-4">
                      <li className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Download className="h-4 w-4 text-primary" />
                        Download imediato após compra
                      </li>
                      <li className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4 text-primary" />
                        Garantia de 7 dias
                      </li>
                    </ul>

                    <PromoteProductButton
                      productId={product._id!.toString()}
                      productSlug={product.slug}
                      affiliateEnabled={product.affiliateEnabled ?? false}
                      isCreator={isCreator}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <section className="mt-20 border-t border-border/50 pt-16 lg:mt-28 lg:pt-20">
            <h2 className="mb-10 font-serif text-2xl font-semibold tracking-tight text-foreground">
              Produtos Relacionados
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id?.toString() ?? relatedProduct.slug}
                  href={`/produto/${relatedProduct.slug}`}
                >
                  <Card className="group h-full overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-primary/5">
                    <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-muted/60 to-muted/30">
                      <div className="flex h-full items-center justify-center">
                        <span className="font-serif text-5xl font-semibold text-foreground/10">
                          {relatedProduct.title.charAt(0)}
                        </span>
                      </div>
                      <div className="absolute left-4 top-4">
                        <span className="inline-flex rounded-md bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                          {relatedProduct.category}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="line-clamp-2 font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {relatedProduct.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        por{" "}
                        <span className="font-medium text-foreground">
                          {relatedProduct.creatorName}
                        </span>
                      </p>
                      <p className="mt-3 text-lg font-semibold text-foreground">
                        R${relatedProduct.price}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
