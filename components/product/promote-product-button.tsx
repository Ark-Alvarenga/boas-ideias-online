"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Loader2, Check } from "lucide-react"

import { useToast } from "@/hooks/use-toast"

interface PromoteProductButtonProps {
  productId: string
  productSlug: string
  affiliateEnabled: boolean
  isCreator: boolean
  customText?: string
  compact?: boolean
}

export function PromoteProductButton({
  productId,
  productSlug,
  affiliateEnabled,
  isCreator,
  customText,
  compact,
}: PromoteProductButtonProps) {
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

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
        const message = data.error ?? "Não foi possível entrar no programa."
        setError(message)
        toast({
          title: "Erro ao promover",
          description: message,
          variant: "destructive",
        })
        return
      }
      setJoined(true)
      setLink(data.affiliateLink ?? null)
      if (data.affiliateLink) {
        navigator.clipboard.writeText(data.affiliateLink)
        toast({
          title: "Link de afiliado gerado! 🚀",
          description: "O link foi copiado para sua área de transferência.",
          variant: "success",
        })
      }
    } catch (err) {
      const message = "Erro ao conectar."
      setError(message)
      toast({
        title: "Erro de conexão",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={compact ? "w-full" : "mt-4"}>
      <Button
        variant="outline"
        size="sm"
        className={compact ? "w-full min-h-[44px]" : "w-full sm:w-auto"}
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
        {loading 
          ? "Entrando..." 
          : joined 
            ? "Link copiado!" 
            : (customText || "Promover este produto")
        }
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
