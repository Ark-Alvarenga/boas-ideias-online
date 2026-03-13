"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/marketplace/product-card";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import type { Product } from "@/lib/types";

interface ApiProduct extends Product {
  _id?: string;
  creatorName?: string;
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<string | undefined>("recentes");

  const loadProducts = async (params?: {
    search?: string;
    category?: string;
    sort?: string;
  }) => {
    try {
      setIsLoading(true);

      const searchParams = new URLSearchParams();

      if (params?.search) searchParams.set("search", params.search);
      if (params?.category) searchParams.set("category", params.category);
      if (params?.sort) searchParams.set("sort", params.sort);

      const res = await fetch(`/api/products?${searchParams.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load products");
      }

      const data = await res.json();

      setProducts(data.products ?? []);
      setTotal(data.total ?? 0);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts({ search, category, sort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero section */}
        <section className="border-b border-border/50 bg-muted/30 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Marketplace
            </p>

            <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Explore Ideias Poderosas
            </h1>

            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Descubra cursos, guias e recursos digitais criados por
              especialistas para impulsionar seu negócio online.
            </p>
          </div>
        </section>

        {/* Filters and Products */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <MarketplaceFilters
              onSearch={(value) => setSearch(value || undefined)}
              onCategoryChange={(value) =>
                setCategory(value === "todos" ? undefined : value)
              }
              onSortChange={(value) =>
                setSort(value === "relevancia" ? undefined : value)
              }
            />

            <div className="mt-10">
              <p className="mb-8 text-sm text-muted-foreground">
                {isLoading ? (
                  <span>Carregando produtos...</span>
                ) : (
                  <>
                    Mostrando{" "}
                    <span className="font-medium text-foreground">
                      {products.length}
                    </span>{" "}
                    de{" "}
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    produtos
                  </>
                )}
              </p>

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
                    />
                  ))}

                {!isLoading && products.length === 0 && (
                  <div className="col-span-full rounded-lg border border-dashed border-border/60 bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                    Nenhum produto encontrado com os filtros selecionados.
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-16 flex justify-center">
              <nav
                className="flex items-center gap-1.5"
                aria-label="Pagination"
              >
                <button className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  1
                </button>

                <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground">
                  2
                </button>

                <button className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  3
                </button>

                <span className="px-2 text-sm text-muted-foreground">...</span>

                <button className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  12
                </button>
              </nav>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
