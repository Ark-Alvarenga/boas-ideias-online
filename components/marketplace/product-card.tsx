import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface ProductCardProps {
  id: string
  title: string
  description: string
  price: number
  category: string
  slug: string
  creator: string
  coverImage?: string
}

const categoryGradients: Record<string, string> = {
  "Prompts": "from-blue-500/15 to-indigo-500/15",
  "Guia": "from-amber-500/15 to-orange-500/15",
  "Templates": "from-emerald-500/15 to-teal-500/15",
  "Curso": "from-rose-500/15 to-pink-500/15",
  "Toolkit": "from-violet-500/15 to-purple-500/15",
}

export function ProductCard({ 
  title, 
  description, 
  price, 
  category, 
  slug, 
  creator 
}: ProductCardProps) {
  const gradient = categoryGradients[category] || "from-gray-500/15 to-slate-500/15"
  
  return (
    <Card className="group h-full overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-primary/5">
      <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${gradient}`}>
        <div className="flex h-full items-center justify-center">
          <span className="font-serif text-6xl font-semibold text-foreground/10">
            {title.charAt(0)}
          </span>
        </div>
        <div className="absolute left-4 top-4">
          <span className="inline-flex rounded-md bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
            {category}
          </span>
        </div>
      </div>
      
      <CardContent className="flex flex-col p-5">
        <h3 className="line-clamp-2 font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          por <span className="font-medium text-foreground">{creator}</span>
        </p>
        
        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
          <span className="text-xl font-semibold text-foreground">
            R${price}
          </span>
          <Button size="sm" variant="ghost" className="text-primary hover:text-primary" asChild>
            <Link href={`/produto/${slug}`}>
              Ver mais
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
