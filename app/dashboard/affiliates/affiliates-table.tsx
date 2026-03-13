"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface Row {
  productTitle: string
  affiliateLink: string
  clicks: number
  sales: number
  commission: number
}

export function AffiliatesTable({ rows }: { rows: Row[] }) {
  const [copied, setCopied] = useState<string | null>(null)

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    setCopied(link)
    setTimeout(() => setCopied(null), 2000)
  }

  if (rows.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 text-left text-muted-foreground">
            <th className="pb-3 font-medium">Produto</th>
            <th className="pb-3 font-medium">Link de afiliado</th>
            <th className="pb-3 font-medium text-right">Cliques</th>
            <th className="pb-3 font-medium text-right">Vendas</th>
            <th className="pb-3 font-medium text-right">Comissão</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/50">
              <td className="py-3 font-medium text-foreground">{row.productTitle}</td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <code className="max-w-[200px] truncate rounded bg-muted px-2 py-1 text-xs">
                    {row.affiliateLink}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => copyLink(row.affiliateLink)}
                  >
                    {copied === row.affiliateLink ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </td>
              <td className="py-3 text-right">{row.clicks}</td>
              <td className="py-3 text-right">{row.sales}</td>
              <td className="py-3 text-right font-medium">
                R$ {row.commission.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
