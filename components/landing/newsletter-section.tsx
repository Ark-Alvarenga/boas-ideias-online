"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle } from "lucide-react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
    }
  }

  return (
    <section className="border-t border-border/50 bg-muted/30 py-16 lg:py-24">
      <div className="section-container">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Newsletter
          </p>
          <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Receba as melhores ideias toda semana
          </h2>
          
          <p className="mt-4 text-muted-foreground">
            Dicas de monetização, produtos em destaque e insights de criadores de sucesso.
          </p>

          {submitted ? (
            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Obrigado! Você está inscrito.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 flex-1 border-border bg-background text-base"
                  required
                />
                <Button type="submit" size="xl" className="shadow-sm">
                  Inscrever-se
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Sem spam. Cancele quando quiser.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
