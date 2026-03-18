import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProductCard } from "@/components/marketplace/product-card"
import {
  ShoppingCart,
  CheckCircle2,
  Star,
  Download,
  Shield,
  ArrowLeft,
  Users,
  Zap,
  Lock,
  Infinity,
} from "lucide-react"
import { getDatabase } from "@/lib/mongodb"
import type { Product, User } from "@/lib/types"
import { authConfig, verifySessionToken } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { PromoteProductButton } from "@/components/product/promote-product-button"
import { formatCentsToBRL } from "@/lib/currency"

interface ProductPageProps {
  params: Promise<{ slug: string }> | { slug: string }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolved = await Promise.resolve(params)
  const slug = resolved?.slug

  if (!slug || typeof slug !== "string" || !slug.trim()) {
    redirect("/marketplace")
  }

  const db = await getDatabase()
  const collection = db.collection<Product>("products")

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

  // Fetch product regardless of status
  let product = await collection.findOne({ slug })
  if (!product && ObjectId.isValid(slug)) {
    product = await collection.findOne({ _id: new ObjectId(slug) })
  }

  if (!product) {
    return notFound()
  }

  const isCreator = currentUser ? product.creatorId.equals(currentUser._id!) : false

  // Only active products are publicly visible; draft/archived return 404 unless user is the creator
  if (product.status !== "active" && !isCreator) {
    return notFound()
  }

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
      
      <main className="py-8 lg:py-12">
        <div className="section-container">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link 
              href="/marketplace" 
              className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Marketplace
            </Link>
          </nav>

          {product.status !== "active" && isCreator && (
            <div className="mb-8 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-amber-600 flex items-center gap-3">
              <Shield className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">
                Você está visualizando este produto em modo <strong>{product.status === "draft" ? "Rascunho" : "Arquivado"}</strong> porque você é o criador. Ele não está visível publicamente.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-14">
            {/* Product Info */}
            <div className="space-y-8 lg:col-span-3">
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

              {/* Title, Price (mobile), and Creator */}
              <div>
                <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {product.title}
                </h1>

                {/* Mobile-only price (visible without scrolling to sidebar) */}
                <div className="mt-4 flex items-center gap-4 lg:hidden">
                  <span className="text-3xl font-bold tracking-tight text-foreground">
                    R${product.price}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <Zap className="h-3 w-3" />
                    Acesso imediato
                  </span>
                </div>

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
                <h2 className="mb-4 text-lg font-semibold text-foreground">
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
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  O que está incluído
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {(product.features || []).map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 rounded-lg bg-muted/40 px-4 py-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Purchase Card — Sticky sidebar */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24">
                <Card className="border-border/50 bg-card shadow-xl shadow-primary/5">
                  <CardContent className="p-6 lg:p-8">
                    <div className="mb-2">
                      <p className="mb-1 text-sm text-muted-foreground">Preço</p>
                      <span className="text-4xl font-bold tracking-tight text-foreground">
                        {(product.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    <Button 
                      size="xl" 
                      className="mt-6 w-full shadow-sm"
                      asChild
                    >
                      <Link href={`/checkout/${product.slug}`}>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Comprar Agora
                      </Link>
                    </Button>

                    <div className="my-6 h-px bg-border/50" />

                    {/* Trust elements */}
                    <ul className="space-y-3.5">
                      <li className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Zap className="h-4 w-4 text-primary" />
                        <span>Acesso imediato após compra</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Download className="h-4 w-4 text-primary" />
                        <span>Download instantâneo do PDF</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Infinity className="h-4 w-4 text-primary" />
                        <span>Acesso vitalício ao conteúdo</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Garantia de 7 dias</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4 text-primary" />
                        <span>Pagamento seguro via Stripe</span>
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
          {relatedProducts.length > 0 && (
            <section className="mt-20 border-t border-border/50 pt-14 lg:mt-24 lg:pt-16">
              <h2 className="mb-8 font-serif text-2xl font-semibold tracking-tight text-foreground">
                Produtos Relacionados
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct._id?.toString() ?? relatedProduct.slug}
                    id={relatedProduct._id?.toString() ?? relatedProduct.slug}
                    title={relatedProduct.title}
                    description={relatedProduct.description}
                    priceCents={relatedProduct.priceCents}
                    category={relatedProduct.category}
                    slug={relatedProduct.slug}
                    creator={relatedProduct.creatorName}
                    coverImage={relatedProduct.coverImage}
                    sales={relatedProduct.sales}
                    createdAt={relatedProduct.createdAt}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Mobile sticky CTA */}
      <div className="mobile-sticky-cta">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Preço</p>
            <p className="text-xl font-bold tracking-tight text-foreground">R${product.price}</p>
          </div>
          <Button size="lg" className="shadow-sm" asChild>
            <Link href={`/checkout/${product.slug}`}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Comprar Agora
            </Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
