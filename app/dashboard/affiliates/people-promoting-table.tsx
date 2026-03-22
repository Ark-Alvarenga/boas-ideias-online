"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users } from "lucide-react"

interface AffiliateRow {
  affiliateName: string
  clicks: number
  sales: number
  revenue: number
}

interface ProductAffiliates {
  productId: string
  productTitle: string
  affiliates: AffiliateRow[]
}

export function PeoplePromotingTable({ data }: { data: ProductAffiliates[] }) {
  if (data.length === 0) return null

  return (
    <div className="space-y-8">
      {data.map((product) => (
        <Card key={product.productId} className="overflow-hidden rounded-3xl border-2 border-foreground bg-card shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
          <CardHeader className="border-b-2 border-foreground bg-primary/10 p-6">
            <CardTitle className="font-serif text-xl font-black text-foreground">
              {product.productTitle}
            </CardTitle>
            <CardDescription className="text-sm font-bold text-muted-foreground">
              {product.affiliates.length} afiliado(s) promovendo este produto
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-foreground bg-muted/30 text-left">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Afiliado</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Cliques</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Vendas</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Receita Gerada</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-foreground/10">
                  {product.affiliates.map((aff, i) => (
                    <tr key={i} className="transition-colors hover:bg-muted/30">
                      <td className="px-6 py-4 font-bold text-foreground">
                        {aff.affiliateName}
                      </td>
                      <td className="px-6 py-4 text-right font-black tabular-nums">{aff.clicks}</td>
                      <td className="px-6 py-4 text-right font-black tabular-nums">{aff.sales}</td>
                      <td className="px-6 py-4 text-right font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                        R$ {aff.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
