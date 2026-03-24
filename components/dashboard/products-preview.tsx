import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCentsToBRL } from "@/lib/currency"

interface Product {
  _id?: string
  slug: string
  title: string
  description: string
  coverImage?: string
  priceCents: number
  status: "active" | "draft" | "archived"
}

export function ProductsPreview({ products }: { products: Product[] }) {
  const previewProducts = products.slice(0, 4)

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg">Meus produtos</CardTitle>
          <CardDescription>
            Veja seus produtos e acesse rapidamente as páginas de venda.
          </CardDescription>
        </div>

        {products.length > 4 && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/products">Ver todos</Link>
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/40 p-8 text-center sm:p-10">
            <h3 className="text-lg font-semibold text-foreground">Sua vitrine está vazia.</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              O primeiro passo para a sua primeira venda online começa aqui. Leva literalmente 2 minutos. O que você vai vender hoje?
            </p>
            <Button className="mt-6" asChild>
              <Link href="/dashboard/create-product">Criar Meu Primeiro Produto 🚀</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {previewProducts.map((product) => (
              <div
                key={product._id ?? product.slug}
                className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-background"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  {product.coverImage ? (
                    <Image
                      src={product.coverImage}
                      alt={product.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-500/15 to-indigo-500/15">
                      <span className="text-4xl font-semibold text-foreground/10">
                        {(product.title ?? "").charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col p-3">
                  <h3 className="line-clamp-2 text-sm font-semibold">
                    {product.title}
                  </h3>

                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>R${formatCentsToBRL(product.priceCents)}</span>

                    <span className="rounded-full bg-muted px-2 py-0.5">
                      {product.status === "active"
                        ? "Ativo"
                        : product.status === "draft"
                        ? "Rascunho"
                        : "Arquivado"}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 h-8 text-xs"
                    asChild
                  >
                    <Link href={`/dashboard/products/${product.slug}`}>
                      Gerenciar
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
