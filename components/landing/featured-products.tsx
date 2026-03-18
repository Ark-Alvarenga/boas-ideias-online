"use client";

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { ProductCard } from "@/components/marketplace/product-card"
import type { Product } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

interface FeaturedProductCard
  extends Pick<
    Product,
    "title" | "description" | "priceCents" | "category" | "slug" | "creatorName" | "coverImage" | "affiliateEnabled" | "affiliateCommissionPercent" | "sales" | "createdAt"
  > {
  _id?: string
  price?: number
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
              <ProductCard
                key={product._id ?? product.slug}
                id={product._id ?? product.slug}
                title={product.title}
                description={product.description}
                priceCents={product.priceCents ?? (product.price ? Math.round(product.price * 100) : 0)}
                category={product.category}
                slug={product.slug}
                creator={product.creatorName ?? "Criador(a)"}
                coverImage={product.coverImage}
                sales={product.sales}
                createdAt={product.createdAt}
                affiliateEnabled={product.affiliateEnabled}
                affiliateCommissionPercent={product.affiliateCommissionPercent}
              />
            ))}
        </div>
      </div>
    </section>
  )
}
