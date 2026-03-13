"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/dashboard"

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: "name" | "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        setError(json.error || "Não foi possível criar sua conta.")
        return
      }

      router.push(next)
    } catch (err) {
      console.error("Register error", err)
      setError("Ocorreu um erro ao criar sua conta.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-10 lg:py-16">
        <div className="mx-auto max-w-md px-6 lg:px-0">
          <Card className="border-border/50 bg-card shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-xl">Criar conta</CardTitle>
              <CardDescription>
                Comece a comprar e gerenciar seus produtos digitais.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nome</FieldLabel>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="h-11 border-border/50 bg-background"
                      required
                    />
                  </Field>

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
                      autoComplete="new-password"
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
                  {isSubmitting ? "Criando conta..." : "Criar conta"}
                </Button>

                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Já tem conta?{" "}
                  <Link
                    href={`/login?next=${encodeURIComponent(next)}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Entrar
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

