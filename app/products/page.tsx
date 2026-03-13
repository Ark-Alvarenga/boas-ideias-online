"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/marketplace/product-card";
import type { Product } from "@/lib/types";

interface ApiProduct extends Product {
  _id?: string;
  creatorName?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadProducts = async () => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/products", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load products");
      }

      const data = await res.json();

      setProducts(data.products ?? []);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="border-b border-border/50 bg-muted/30 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Produtos
            </p>

            <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Todos os produtos digitais
            </h1>

            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Explore todos os produtos publicados na plataforma, prontos para
              download imediato.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-6 text-sm text-muted-foreground">
              {isLoading ? (
                <span>Carregando produtos...</span>
              ) : (
                <>
                  Encontrados{" "}
                  <span className="font-medium text-foreground">
                    {products.length}
                  </span>{" "}
                  produtos
                </>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {!isLoading &&
                products.map((product) => (
                  <ProductCard
                    key={product._id?.toString() ?? product.slug}
                    id={product._id?.toString() ?? product.slug}
                    title={product.title}
                    description={product.description}
                    price={product.price}
                    category={product.category}
                    slug={product.slug}
                    creator={product.creatorName ?? "Criador(a)"}
                    coverImage={product.coverImage}
                  />
                ))}

              {!isLoading && products.length === 0 && (
                <div className="col-span-full rounded-lg border border-dashed border-border/60 bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                  Nenhum produto encontrado.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

