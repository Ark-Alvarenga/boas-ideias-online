import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"
import { formatCentsToBRL } from "@/lib/currency"
import { PromoteProductButton } from "@/components/product/promote-product-button"

interface ProductCardProps {
  id: string
  title: string
  description: string
  priceCents: number
  category: string
  slug?: string
  creator: string
  coverImage?: string
  sales?: number
  createdAt?: string | Date
  affiliateEnabled?: boolean
  affiliateCommissionPercent?: number
}

const categoryGradients: Record<string, string> = {
  "Prompts": "from-blue-500/15 to-indigo-500/15",
  "Guia": "from-amber-500/15 to-orange-500/15",
  "Templates": "from-emerald-500/15 to-teal-500/15",
  "Curso": "from-rose-500/15 to-pink-500/15",
  "Toolkit": "from-violet-500/15 to-purple-500/15",
}

export function ProductCard({
  id,
  title,
  description,
  priceCents,
  category,
  slug,
  creator,
  coverImage,
  sales,
  createdAt,
  affiliateEnabled,
  affiliateCommissionPercent,
}: ProductCardProps) {
  const gradient = categoryGradients[category] || "from-gray-500/15 to-slate-500/15"

  const createdAtDate =
    typeof createdAt === "string" ? new Date(createdAt) : createdAt
  const isNew =
    createdAtDate instanceof Date &&
    !Number.isNaN(createdAtDate.getTime()) &&
    Date.now() - createdAtDate.getTime() <= 1000 * 60 * 60 * 24 * 14
  const isPopular = typeof sales === "number" && sales >= 10

  return (
    <Card className="group h-full overflow-hidden border-border/50 bg-card hover:border-border hover:shadow-lg hover:shadow-primary/5">
      <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${gradient}`}>
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-6xl font-semibold text-foreground/10">
              {title.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="inline-flex rounded-md bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm capitalize">
            {category}
          </span>
          {isNew && (
            <span className="inline-flex rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-700 backdrop-blur-sm dark:text-emerald-400">
              Novo
            </span>
          )}
          {isPopular && (
            <span className="inline-flex rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
              Mais vendido
            </span>
          )}
        </div>
      </div>

      <CardContent className="flex flex-col p-5">
        <h3 className="line-clamp-2 font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>

        {/* Price immediately under title */}
        <p className="mt-2 text-xl font-bold tracking-tight text-foreground">
          R$ {formatCentsToBRL(priceCents)}
        </p>

        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <p className="mt-3 text-sm text-muted-foreground">
          por <span className="font-medium text-foreground">{creator}</span>
          {typeof sales === "number" && (
            <span className="ml-2 text-xs text-muted-foreground">· {sales} vendas</span>
          )}
        </p>

        <div className="mt-4 flex flex-col gap-3 border-t border-border/50 pt-4">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Zap className="h-3 w-3 text-primary" />
              Acesso imediato
            </span>
            <Button size="sm" className="min-h-[44px] shadow-sm flex-1" asChild>
              <Link href={`/produto/${slug || id}`}>
                Comprar agora
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          {affiliateEnabled && (
            <div className="-mx-2 -mb-2 mt-1">
              <PromoteProductButton
                productId={id}
                productSlug={slug || ""}
                affiliateEnabled={true}
                isCreator={false} // Will be handled inside the button via API if they are creator
                customText={`Promover e ganhar ${affiliateCommissionPercent ?? 0}%`}
                compact
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
