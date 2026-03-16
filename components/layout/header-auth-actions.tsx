"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

export function HeaderAuthActions({
  onLinkClick,
}: {
  onLinkClick?: () => void
}) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => {
        if (cancelled) return
        setIsLoggedIn(res.ok)
      })
      .catch(() => {
        if (!cancelled) setIsLoggedIn(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const res = await fetch("/api/auth/logout", { method: "POST" })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.success) {
        toast({
          title: "Não foi possível sair",
          description: json.error || "Tente novamente em alguns instantes.",
          variant: "destructive",
        })
        setIsLoggingOut(false)
        return
      }
      toast({
        title: "Sessão encerrada",
        description: "Você saiu da sua conta com segurança.",
      })
      window.location.href = "/"
    } catch {
      toast({
        title: "Não foi possível sair",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      })
      setIsLoggingOut(false)
    }
  }

  if (isLoggedIn === null) {
    return (
      <div className="hidden items-center gap-3 md:flex">
        <Button variant="ghost" size="sm" disabled className="opacity-70">
          ...
        </Button>
      </div>
    )
  }

  return (
    <div className="hidden items-center gap-3 md:flex">
      {isLoggedIn ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/dashboard" onClick={onLinkClick}>
              Painel
            </Link>
          </Button>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            asChild
          >
            <Link href="/dashboard/create-product" onClick={onLinkClick}>
              Vender seu produto
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoggingOut}
            onClick={handleLogout}
          >
            Sair
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/login" onClick={onLinkClick}>
              Entrar
            </Link>
          </Button>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            asChild
          >
            <Link href="/register" onClick={onLinkClick}>
              Vender seu produto
            </Link>
          </Button>
        </>
      )}
    </div>
  )
}

export function HeaderAuthActionsMobile({
  onLinkClick,
}: {
  onLinkClick?: () => void
}) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => {
        if (cancelled) return
        setIsLoggedIn(res.ok)
      })
      .catch(() => {
        if (!cancelled) setIsLoggedIn(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const res = await fetch("/api/auth/logout", { method: "POST" })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.success) {
        toast({
          title: "Não foi possível sair",
          description: json.error || "Tente novamente em alguns instantes.",
          variant: "destructive",
        })
        setIsLoggingOut(false)
        return
      }
      toast({
        title: "Sessão encerrada",
        description: "Você saiu da sua conta com segurança.",
      })
      window.location.href = "/"
    } catch {
      toast({
        title: "Não foi possível sair",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      })
      setIsLoggingOut(false)
    }
  }

  if (isLoggedIn === null) {
    return (
      <div className="mt-4 flex flex-col gap-2 border-t border-border/50 pt-4">
        <Button variant="outline" size="sm" disabled className="opacity-70">
          ...
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-4 flex flex-col gap-2 border-t border-border/50 pt-4">
      {isLoggedIn ? (
        <>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard" onClick={onLinkClick}>
              Painel
            </Link>
          </Button>
          <Button size="sm" className="shadow-sm" asChild>
            <Link href="/dashboard/create-product" onClick={onLinkClick}>
              Vender seu produto
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoggingOut}
            onClick={handleLogout}
          >
            Sair
          </Button>
        </>
      ) : (
        <>
          <Button variant="outline" size="sm" asChild>
            <Link href="/login" onClick={onLinkClick}>
              Entrar
            </Link>
          </Button>
          <Button size="sm" className="shadow-sm" asChild>
            <Link href="/register" onClick={onLinkClick}>
              Vender seu produto
            </Link>
          </Button>
        </>
      )}
    </div>
  )
}
