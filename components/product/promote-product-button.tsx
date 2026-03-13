"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Loader2, Check } from "lucide-react"

interface PromoteProductButtonProps {
  productId: string
  productSlug: string
  affiliateEnabled: boolean
  isCreator: boolean
}

export function PromoteProductButton({
  productId,
  productSlug,
  affiliateEnabled,
  isCreator,
}: PromoteProductButtonProps) {
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!affiliateEnabled || isCreator) return null

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/affiliates/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Não foi possível entrar no programa.")
        return
      }
      setJoined(true)
      setLink(data.affiliateLink ?? null)
      if (data.affiliateLink) {
        navigator.clipboard.writeText(data.affiliateLink)
      }
    } catch (err) {
      setError("Erro ao conectar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <Button
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : joined ? (
          <Check className="mr-2 h-4 w-4 text-green-600" />
        ) : (
          <Share2 className="mr-2 h-4 w-4" />
        )}
        {loading ? "Entrando..." : joined ? "Link copiado!" : "Promover este produto"}
      </Button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      {joined && link && (
        <p className="mt-2 text-xs text-muted-foreground">
          Seu link de afiliado foi copiado. Também em: Painel → Afiliados.
        </p>
      )}
    </div>
  )
}
