"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Download, ExternalLink, FileText, Calendar, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

interface PurchaseCardProps {
  product: {
    _id: string
    title: string
    description: string
    coverImage?: string
    pdfUrl?: string
  }
  orderId: string
  purchaseDate: Date
}

export function PurchaseCard({ product, orderId, purchaseDate }: PurchaseCardProps) {
  const formattedDate = format(purchaseDate, "dd 'de' MMMM, yyyy", { locale: ptBR })

  return (
    <Card className="group overflow-hidden rounded-3xl border-2 border-foreground bg-card shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[8px_8px_0px_#fff]">
      <div className="aspect-video w-full overflow-hidden border-b-2 border-foreground bg-muted relative">
        {product.coverImage ? (
          <Image
            src={product.coverImage}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-accent/20">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border-2 border-foreground bg-background px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_#000]">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </div>
        </div>

        <h3 className="mb-2 font-serif text-xl font-black text-foreground line-clamp-1">
          {product.title}
        </h3>
        <p className="mb-6 text-sm font-medium text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        <div className="flex gap-3">
          {product.pdfUrl ? (
            <Button
              className="flex-1 h-12 rounded-xl border-2 border-foreground bg-primary font-black text-foreground shadow-[4px_4px_0px_#000] hover:bg-primary/90 transition-all uppercase tracking-tight"
              asChild
            >
              <a href={`/api/download/${orderId}`} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Baixar Conteúdo
              </a>
            </Button>
          ) : (
            <Button
              className="flex-1 h-12 rounded-xl border-2 border-foreground bg-accent font-black text-foreground shadow-[4px_4px_0px_#000] hover:bg-accent/90 transition-all uppercase tracking-tight"
              asChild
            >
              <a href={`/produto/${product._id}`} target="_blank" rel="noopener noreferrer">
                <Eye className="mr-2 h-4 w-4" />
                Acessar Página
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-xl border-2 border-foreground bg-background shadow-[4px_4px_0px_#000] hover:bg-muted transition-all"
            asChild
          >
            <a href={`/produto/${product._id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function PurchaseCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-3xl border-2 border-foreground bg-card shadow-[4px_4px_0px_#000]">
      <div className="aspect-video w-full border-b-2 border-foreground">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      <CardContent className="p-6">
        <div className="mb-4">
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        <Skeleton className="mb-2 h-7 w-3/4" />
        <Skeleton className="mb-6 h-4 w-full" />
        <div className="flex gap-3">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  )
}
