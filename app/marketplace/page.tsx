"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/marketplace/product-card";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import type { Product } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

interface ApiProduct extends Omit<
  Product,
  "_id" | "creatorId" | "creatorName"
> {
  _id?: string;
  creatorName?: string;
  affiliateEnabled?: boolean;
  affiliateCommissionPercent?: number;
}

function MarketplaceContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Read state from URL
  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;
  const sort = searchParams.get("sort") || "relevancia";
  const pageStr = searchParams.get("page");
  const page = pageStr && !isNaN(Number(pageStr)) ? Number(pageStr) : 1;

  const pageSize = 12;

  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    }
    return newSearchParams.toString();
  };

  const updateFilters = (params: Record<string, string | null>) => {
    const qs = createQueryString(params);
    router.replace(`${pathname}?${qs}`, { scroll: false });
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const fetchParams = new URLSearchParams();
      if (search) fetchParams.set("search", search);
      if (category) fetchParams.set("category", category);
      if (sort) fetchParams.set("sort", sort);

      const safePage = Number.isFinite(page) && page > 0 ? page : 1;
      fetchParams.set("limit", String(pageSize));
      fetchParams.set("skip", String((safePage - 1) * pageSize));

      const res = await fetch(`/api/products?${fetchParams.toString()}`, {
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
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleChangePage = (nextPage: number) => {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    updateFilters({ page: safePage > 1 ? String(safePage) : null });
  };

  return (
    <>
      {/* Hero section */}
      <section className="py-10 lg:py-12 text-center md:text-left">
        <div className="section-container">
          <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 font-bold text-primary mb-6 border-2 border-primary shadow-[2px_2px_0px_text-primary]">
            MARKETPLACE
          </div>
          <h1 className="font-serif text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
            Ideias que já estão <br className="hidden md:block" />
            <span className="text-primary">gerando vendas.</span>
          </h1>
          <p className="max-w-2xl text-lg font-medium text-muted-foreground md:mx-0 mx-auto md:text-xl leading-relaxed">
            Pessoas normais estão ganhando dinheiro com coisas simples. Veja o
            que está funcionando e comece hoje mesmo.
          </p>
        </div>
      </section>

      {/* Filters and Products */}
      <section className="section-y">
        <div className="section-container">
          {/* Filters in a subtle card */}
          <div className="rounded-2xl border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] mb-12">
            <MarketplaceFilters
              initialQuery={search}
              initialCategory={category}
              initialSort={sort}
              onSearch={(value) => {
                updateFilters({ search: value || null, page: null });
              }}
              onCategoryChange={(value) => {
                updateFilters({
                  category: value === "todos" ? null : value,
                  page: null,
                });
              }}
              onSortChange={(value) => {
                updateFilters({
                  sort: value === "relevancia" ? null : value,
                  page: null,
                });
              }}
              onClear={() => {
                updateFilters({
                  search: null,
                  category: null,
                  sort: null,
                  page: null,
                });
              }}
            />
          </div>

          <div className="mt-8">
            <p className="mb-6 text-sm text-muted-foreground">
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
                    className="h-[380px] rounded-xl border border-border/50 bg-card/50"
                  >
                    <div className="h-44 w-full animate-pulse rounded-t-xl bg-muted/60" />
                    <div className="space-y-3 p-5">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-muted/60" />
                      <div className="h-5 w-1/3 animate-pulse rounded bg-muted/60" />
                      <div className="h-4 w-full animate-pulse rounded bg-muted/60" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-muted/60" />
                      <div className="mt-4 h-10 w-full animate-pulse rounded bg-muted/60" />
                    </div>
                  </div>
                ))}
              {!isLoading && loadError && (
                <div className="col-span-full rounded-lg border border-dashed border-border/60 bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                  {loadError}{" "}
                  <button
                    type="button"
                    onClick={() => loadProducts()}
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
                    priceCents={product.priceCents}
                    category={product.category}
                    slug={product.slug}
                    creator={product.creatorName ?? "Criador(a)"}
                    coverImage={product.coverImage}
                    sales={product.sales}
                    createdAt={product.createdAt}
                    affiliateEnabled={product.affiliateEnabled}
                    affiliateCommissionPercent={
                      product.affiliateCommissionPercent
                    }
                  />
                ))}

              {!isLoading && !loadError && products.length === 0 && (
                <>
                  <div className="col-span-full mb-4 rounded-lg bg-primary/10 p-6 text-center border-2 border-primary">
                    <h3 className="text-lg font-bold text-primary">
                      A vitrine está esperando por você!
                    </h3>
                    <p className="mt-1 text-sm font-medium text-primary/80">
                      Nenhum produto real encontrado nesta categoria. Aqui estão
                      alguns exemplos do que você poderia vender hoje:
                    </p>
                  </div>
                  {/* Mock products to simulate activity */}
                  {[
                    {
                      id: "mock1",
                      title: "Guia de Viagem Fim de Semana",
                      creator: "Ana Silva",
                      price: 2990,
                      sales: 14,
                      cat: "Ideias simples",
                    },
                    {
                      id: "mock2",
                      title: "Planilha de Gastos Mensais",
                      creator: "Carlos D.",
                      price: 1990,
                      sales: 8,
                      cat: "Começando do zero",
                    },
                    {
                      id: "mock3",
                      title: "Templates de E-mail para Freelancers",
                      creator: "Marina",
                      price: 4700,
                      sales: 3,
                      cat: "Primeiras vendas fáceis",
                    },
                  ].map((mock) => (
                    <div
                      key={mock.id}
                      className="group relative flex h-full flex-col overflow-hidden rounded-xl border-2 border-foreground bg-card shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] dark:shadow-[4px_4px_0px_#fff]"
                    >
                      <div className="flex h-44 w-full items-center justify-center bg-muted">
                        <span className="font-serif text-4xl font-black text-muted-foreground/30">
                          {mock.title.charAt(0)}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                            {mock.cat}
                          </span>
                        </div>
                        <h3 className="line-clamp-2 font-serif text-xl font-bold">
                          {mock.title}
                        </h3>
                        <p className="mt-2 text-xl font-black tracking-tight text-foreground">
                          R$ {(mock.price / 100).toFixed(2).replace(".", ",")}
                        </p>
                        <div className="mt-auto pt-6 flex w-full items-center text-sm font-bold text-muted-foreground">
                          <span className="truncate">{mock.creator}</span>
                          <span className="ml-auto inline-flex items-center gap-1.5 text-green-600 dark:text-green-500">
                            ⭐ {mock.sales} vendas hoje
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-14 flex justify-center">
              <nav
                className="flex items-center gap-1.5"
                aria-label="Pagination"
              >
                <button
                  type="button"
                  onClick={() => handleChangePage(page - 1)}
                  disabled={page <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
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
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
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
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                >
                  {">"}
                </button>
              </nav>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Suspense
          fallback={
            <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
              Carregando marketplace...
            </div>
          }
        >
          <MarketplaceContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
