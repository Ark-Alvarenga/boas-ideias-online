import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Sparkles } from "lucide-react"
import { LaurelWreath } from "@/components/ui/greek-patterns"

const featuredProducts = [
  {
    id: 1,
    title: "Kit Completo de Prompts para IA",
    description: "500+ prompts otimizados para ChatGPT e Claude para criadores de conteúdo.",
    price: 97,
    category: "Prompts",
    slug: "kit-prompts-ia",
    creator: "Lucas Silva",
    gradient: "from-primary/10 via-primary/5 to-transparent"
  },
  {
    id: 2,
    title: "Guia do Empreendedor Digital",
    description: "Do zero à primeira venda online. Estratégias comprovadas de monetização.",
    price: 147,
    category: "Guia",
    slug: "guia-empreendedor-digital",
    creator: "Maria Santos",
    gradient: "from-secondary/20 via-secondary/10 to-transparent"
  },
  {
    id: 3,
    title: "Templates Notion para Produtividade",
    description: "Sistema completo de organização pessoal e profissional no Notion.",
    price: 67,
    category: "Templates",
    slug: "templates-notion",
    creator: "Pedro Costa",
    gradient: "from-primary/10 via-primary/5 to-transparent"
  },
  {
    id: 4,
    title: "Curso PDF: Marketing de Conteúdo",
    description: "Aprenda a criar conteúdo que vende e constrói autoridade online.",
    price: 197,
    category: "Curso",
    slug: "curso-marketing-conteudo",
    creator: "Ana Oliveira",
    gradient: "from-secondary/20 via-secondary/10 to-transparent"
  },
]

export function FeaturedProducts() {
  return (
    <section className="bg-background py-16 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-secondary" />
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
          {featuredProducts.map((product) => (
            <Link key={product.id} href={`/produto/${product.slug}`}>
              <Card className="group h-full overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${product.gradient}`}>
                  {/* Subtle marble texture */}
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                  />
                  <div className="flex h-full flex-col items-center justify-center">
                    <LaurelWreath className="mb-2 h-6 w-16 text-foreground/20" />
                    <span className="font-serif text-5xl font-semibold text-foreground/10">
                      {product.title.charAt(0)}
                    </span>
                  </div>
                  <div className="absolute left-4 top-4">
                    <span className="inline-flex rounded-md bg-background/95 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
                      {product.category}
                    </span>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="line-clamp-2 font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {product.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                    <span className="text-xs text-muted-foreground">
                      por <span className="font-medium text-foreground">{product.creator}</span>
                    </span>
                    <span className="text-lg font-semibold text-secondary">
                      R${product.price}
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
