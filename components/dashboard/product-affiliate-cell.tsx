"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

interface ProductAffiliateCellProps {
  productSlug: string
  affiliateEnabled: boolean
  affiliateCommissionPercent: number
}

export function ProductAffiliateCell({
  productSlug,
  affiliateEnabled: initialEnabled,
  affiliateCommissionPercent: initialPercent,
}: ProductAffiliateCellProps) {
  const [enabled, setEnabled] = useState(initialEnabled ?? false)
  const [percent, setPercent] = useState(String(initialPercent ?? 20))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    const num = Math.min(100, Math.max(0, Number(percent) || 0))
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/products/${productSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateEnabled: enabled,
          affiliateCommissionPercent: num,
        }),
      })
      if (res.ok) {
        setPercent(String(num))
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
        />
        <span className="text-xs text-muted-foreground">Afiliados</span>
      </div>
      {enabled && (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={100}
            step={1}
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            className="h-8 w-16 text-xs"
          />
          <span className="text-xs text-muted-foreground">%</span>
        </div>
      )}
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : saved ? "Salvo" : "Salvar"}
      </Button>
    </div>
  )
}
