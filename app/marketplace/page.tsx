"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/marketplace/product-card";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import type { Product } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

interface ApiProduct
  extends Omit<Product, "_id" | "creatorId" | "creatorName"> {
  _id?: string;
  creatorName?: string;
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<string | undefined>("recentes");
  const [page, setPage] = useState<number>(1);

  const pageSize = 12;

  const loadProducts = async (params?: {
    search?: string;
    category?: string;
    sort?: string;
    page?: number;
  }) => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const searchParams = new URLSearchParams();

      if (params?.search) searchParams.set("search", params.search);
      if (params?.category) searchParams.set("category", params.category);
      if (params?.sort) searchParams.set("sort", params.sort);
      const currentPage = params?.page ?? 1;
      const safePage = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1;
      searchParams.set("limit", String(pageSize));
      searchParams.set("skip", String((safePage - 1) * pageSize));

      const res = await fetch(`/api/products?${searchParams.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const message =
          (json && (json.error as string)) ||
          (res.status === 429
            ? "Muitas requisições ao mesmo tempo. Tente novamente em alguns segundos."
            : "Não foi possível carregar os produtos agora.");
        throw new Error(message);
      }

      const data = await res.json();

      setProducts(data.products ?? []);
      setTotal(data.total ?? 0);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
      setTotal(0);
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os produtos agora.";
      setLoadError(message);
      toast({
        title: "Não foi possível carregar os produtos",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts({ search, category, sort, page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleChangePage = (nextPage: number) => {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    setPage(safePage);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero section */}
        <section className="border-b border-border/50 bg-muted/30 py-10 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
        <section className="py-8 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MarketplaceFilters
              onSearch={(value) => {
                setPage(1);
                setSearch(value || undefined);
              }}
              onCategoryChange={(value) => {
                setPage(1);
                setCategory(value === "todos" ? undefined : value);
              }}
              onSortChange={(value) => {
                setPage(1);
                setSort(value === "relevancia" ? undefined : value);
              }}
              onClear={() => {
                setPage(1);
              }}
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

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading &&
                  Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={`skeleton-${idx}`}
                      className="h-[340px] rounded-xl border border-border/50 bg-card/50"
                    >
                      <div className="h-44 w-full animate-pulse bg-muted/60" />
                      <div className="space-y-3 p-5">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-muted/60" />
                        <div className="h-4 w-full animate-pulse rounded bg-muted/60" />
                        <div className="h-4 w-2/3 animate-pulse rounded bg-muted/60" />
                        <div className="mt-6 h-10 w-full animate-pulse rounded bg-muted/60" />
                      </div>
                    </div>
                  ))}
                {!isLoading && loadError && (
                  <div className="col-span-full rounded-lg border border-dashed border-border/60 bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                    {loadError}{" "}
                    <button
                      type="button"
                      onClick={() => loadProducts({ search, category, sort, page })}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Tentar novamente
                    </button>
                    .
                  </div>
                )}
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
                      sales={product.sales}
                      createdAt={product.createdAt}
                    />
                  ))}

                {!isLoading && !loadError && products.length === 0 && (
                  <div className="col-span-full rounded-lg border border-dashed border-border/60 bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                    Nenhum produto encontrado com os filtros selecionados.
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center">
                <nav
                  className="flex items-center gap-1.5"
                  aria-label="Pagination"
                >
                  <button
                    type="button"
                    onClick={() => handleChangePage(page - 1)}
                    disabled={page <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                  >
                    {"<"}
                  </button>

                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    const isActive = pageNumber === page;
                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => handleChangePage(pageNumber)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => handleChangePage(page + 1)}
                    disabled={page >= totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                  >
                    {">"}
                  </button>
                </nav>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
