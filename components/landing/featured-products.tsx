"use client";

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Sparkles, Zap } from "lucide-react"
import type { Product } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

interface FeaturedProductCard
  extends Pick<
    Product,
    "title" | "description" | "price" | "category" | "slug" | "creatorName" | "coverImage"
  > {
  _id?: string
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<FeaturedProductCard[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let cancelled = false

    const loadFeatured = async () => {
      try {
        const res = await fetch("/api/featured-products?limit=4", {
          cache: "no-store",
        })
        if (!res.ok) {
          const json = await res.json().catch(() => null)
          const message =
            (json && (json.error as string)) ||
            (res.status === 429
              ? "Muitas requisições ao mesmo tempo. Tente novamente em alguns segundos."
              : "Não foi possível carregar os produtos em destaque agora.")
          throw new Error(message)
        }
        const data = await res.json()
        if (!cancelled) {
          setProducts((data.products ?? []) as FeaturedProductCard[])
        }
      } catch (error) {
        console.error("Error loading featured products:", error)
        if (!cancelled) {
          setProducts([])
        }
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os produtos em destaque agora."
        toast({
          title: "Não foi possível carregar os destaques",
          description: message,
          variant: "destructive",
        })
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadFeatured()

    return () => {
      cancelled = true
    }
  }, [])

  const hasProducts = !isLoading && products.length > 0

  return (
    <section className="section-y bg-background">
      <div className="section-container">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-accent" />
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Em destaque
              </p>
            </div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Produtos mais populares
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Descubra os recursos digitais que estão ajudando milhares de criadores.
            </p>
          </div>
          <Button variant="outline" className="shrink-0 border-primary/20 hover:bg-primary/5" asChild>
            <Link href="/marketplace">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading && (
            <div className="col-span-full text-sm text-muted-foreground">
              Carregando produtos em destaque...
            </div>
          )}

          {!isLoading && !hasProducts && (
            <div className="col-span-full rounded-lg border border-dashed border-border/60 bg-muted/40 p-6 text-sm text-muted-foreground">
              Em breve você verá aqui produtos em destaque selecionados do marketplace.
            </div>
          )}

          {hasProducts &&
            products.map((product) => (
              <Link key={product._id ?? product.slug} href={`/produto/${product.slug}`}>
                <Card className="group h-full overflow-hidden border-border/50 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/10 via-muted/40 to-transparent">
                    {product.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.coverImage}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="font-serif text-5xl font-semibold text-foreground/10">
                          {product.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                      <span className="inline-flex rounded-md bg-background/95 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="line-clamp-2 font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                      {product.title}
                    </h3>
                    {/* Price immediately under title */}
                    <p className="mt-2 text-xl font-bold tracking-tight text-foreground">
                      R${product.price}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {product.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                      <span className="text-xs text-muted-foreground">
                        por <span className="font-medium text-foreground">{product.creatorName}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                        <Zap className="h-3 w-3" />
                        Acesso Imediato
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </div>
    </section>
  )
}
