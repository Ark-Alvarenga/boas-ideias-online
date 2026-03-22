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
    <div className="overflow-x-auto">
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
  )
}
