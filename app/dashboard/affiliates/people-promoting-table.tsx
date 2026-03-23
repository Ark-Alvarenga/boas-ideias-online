"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface AffiliateRow {
  affiliateName: string
  clicks: number
  sales: number
  totalSaleValue: number
  affiliateEarnings: number
  creatorEarnings: number
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
      {data.map((product) => {
        const totals = product.affiliates.reduce(
          (acc, aff) => ({
            clicks: acc.clicks + aff.clicks,
            sales: acc.sales + aff.sales,
            totalSaleValue: acc.totalSaleValue + aff.totalSaleValue,
            affiliateEarnings: acc.affiliateEarnings + aff.affiliateEarnings,
            creatorEarnings: acc.creatorEarnings + aff.creatorEarnings,
          }),
          { clicks: 0, sales: 0, totalSaleValue: 0, affiliateEarnings: 0, creatorEarnings: 0 },
        )

        return (
          <Card key={product.productId} className="overflow-hidden rounded-3xl border-2 border-foreground bg-card shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
            <CardHeader className="border-b-2 border-foreground bg-primary/10 p-6">
              <CardTitle className="font-serif text-xl font-black text-foreground">
                {product.productTitle}
              </CardTitle>
              <CardDescription className="text-sm font-bold text-muted-foreground">
                {product.affiliates.length} afiliado(s) · {totals.sales} vendas · Seus ganhos: R$ {totals.creatorEarnings.toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-foreground bg-muted/30 text-left">
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Afiliado</th>
                      <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Cliques</th>
                      <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Vendas</th>
                      <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Receita Total</th>
                      <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Comissão Afiliado</th>
                      <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Seus Ganhos</th>
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
                        <td className="px-6 py-4 text-right font-black tabular-nums text-muted-foreground">
                          R$ {aff.totalSaleValue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-black tabular-nums text-amber-600 dark:text-amber-400">
                          R$ {aff.affiliateEarnings.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                          R$ {aff.creatorEarnings.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y-2 divide-foreground/10">
                {product.affiliates.map((aff, i) => (
                  <div key={i} className="p-5 space-y-3">
                    <div className="font-bold text-foreground text-base">{aff.affiliateName}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border-2 border-foreground/20 bg-muted/30 p-3">
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cliques</div>
                        <div className="mt-1 text-lg font-black tabular-nums">{aff.clicks}</div>
                      </div>
                      <div className="rounded-xl border-2 border-foreground/20 bg-muted/30 p-3">
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vendas</div>
                        <div className="mt-1 text-lg font-black tabular-nums">{aff.sales}</div>
                      </div>
                      <div className="rounded-xl border-2 border-foreground/20 bg-muted/30 p-3">
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Receita Total</div>
                        <div className="mt-1 text-sm font-black tabular-nums text-muted-foreground">R$ {aff.totalSaleValue.toFixed(2)}</div>
                      </div>
                      <div className="rounded-xl border-2 border-amber-500/30 bg-amber-500/5 p-3">
                        <div className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Comissão</div>
                        <div className="mt-1 text-sm font-black tabular-nums text-amber-600 dark:text-amber-400">R$ {aff.affiliateEarnings.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 p-3">
                      <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Seus Ganhos</div>
                      <div className="mt-1 text-xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">R$ {aff.creatorEarnings.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
