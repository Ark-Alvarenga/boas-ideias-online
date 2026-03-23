"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Row {
  productTitle: string
  affiliateLink: string
  clicks: number
  sales: number
  revenue: number
  commission: number
}

export function AffiliatesTable({ rows }: { rows: Row[] }) {
  const [copied, setCopied] = useState<string | null>(null)
  const { toast } = useToast()

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    setCopied(link)
    toast({
      title: "Link Copiado! 🚀",
      description: "O link de afiliado ja esta na sua area de transferencia.",
      variant: "success",
    })
    setTimeout(() => setCopied(null), 2000)
  }

  if (rows.length === 0) return null

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-foreground bg-muted/30 text-left">
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Produto</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Link de Afiliado</th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Cliques</th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Vendas</th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Faturamento</th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Comissão</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-foreground/10">
            {rows.map((row, i) => (
              <tr key={i} className="transition-colors hover:bg-muted/30">
                <td className="px-6 py-4 font-serif text-lg font-black text-foreground">{row.productTitle}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="max-w-[200px] truncate rounded-lg border-2 border-foreground bg-muted px-3 py-1.5 font-mono text-xs font-bold shadow-[2px_2px_0px_#000]">
                      {row.affiliateLink}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 border-2 border-foreground shadow-[2px_2px_0px_#000] hover:bg-primary"
                      onClick={() => copyLink(row.affiliateLink)}
                    >
                      {copied === row.affiliateLink ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-foreground" />
                      )}
                    </Button>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-black tabular-nums">{row.clicks}</td>
                <td className="px-6 py-4 text-right font-black tabular-nums">{row.sales}</td>
                <td className="px-6 py-4 text-right font-black tabular-nums">
                  R$ {row.revenue.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  R$ {row.commission.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y-2 divide-foreground/10">
        {rows.map((row, i) => (
          <div key={i} className="p-5 space-y-3">
            <div className="font-serif text-lg font-black text-foreground">{row.productTitle}</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate rounded-lg border-2 border-foreground bg-muted px-3 py-2 font-mono text-xs font-bold shadow-[2px_2px_0px_#000]">
                {row.affiliateLink}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 border-2 border-foreground shadow-[2px_2px_0px_#000] hover:bg-primary"
                onClick={() => copyLink(row.affiliateLink)}
              >
                {copied === row.affiliateLink ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4 text-foreground" />
                )}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border-2 border-foreground/20 bg-muted/30 p-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cliques</div>
                <div className="mt-1 text-lg font-black tabular-nums">{row.clicks}</div>
              </div>
              <div className="rounded-xl border-2 border-foreground/20 bg-muted/30 p-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vendas</div>
                <div className="mt-1 text-lg font-black tabular-nums">{row.sales}</div>
              </div>
              <div className="rounded-xl border-2 border-foreground/20 bg-muted/30 p-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Faturamento</div>
                <div className="mt-1 text-sm font-black tabular-nums">R$ {row.revenue.toFixed(2)}</div>
              </div>
              <div className="rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 p-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Comissão</div>
                <div className="mt-1 text-sm font-black tabular-nums text-emerald-600 dark:text-emerald-400">R$ {row.commission.toFixed(2)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
