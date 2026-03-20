"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { toast } from "@/hooks/use-toast"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || searchParams.get("next") || "/dashboard"
  const isDashboardRedirect = redirectPath.startsWith("/dashboard")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        const message = json.error || "Não foi possível entrar."
        setError(message)
        toast({
          title: "Não foi possível entrar",
          description: message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta! Redirecionando...",
      })
      router.push(redirectPath)
    } catch (err) {
      console.error("Login error", err)
      const message = "Ocorreu um erro ao tentar fazer login."
      setError(message)
      toast({
        title: "Não foi possível entrar",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-10 lg:py-16">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-0">
          <Card className="border-border/50 bg-card shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-xl">Entrar na sua conta</CardTitle>
              <CardDescription>
                Acesse seu painel para gerenciar suas vendas e produtos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {isDashboardRedirect && (
                  <div className="mb-6 rounded-md bg-blue-500/10 p-3 text-sm text-blue-600 dark:text-blue-400">
                    Faça login para gerenciar seus produtos e acessar o dashboard.
                  </div>
                )}
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="h-11 border-border/50 bg-background"
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={(e) =>
                        handleChange("password", e.target.value)
                      }
                      className="h-11 border-border/50 bg-background"
                      required
                    />
                  </Field>
                </FieldGroup>

                {error && (
                  <p className="mt-3 text-sm text-red-500">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="mt-6 h-11 w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>

                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Não tem conta?{" "}
                  <Link
                    href={`/register?redirect=${encodeURIComponent(redirectPath)}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Criar conta
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
