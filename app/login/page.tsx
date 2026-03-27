"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "@/hooks/use-toast";
import { trackEvent, identifyUser } from "@/lib/amplitude";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath =
    searchParams.get("redirect") || searchParams.get("next") || "/dashboard";
  const isDashboardRedirect = redirectPath.startsWith("/dashboard");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track login page view
  useEffect(() => {
    trackEvent("login_started", { redirect_path: redirectPath });
  }, [redirectPath]);

  const handleChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const message = json.error || "Não foi possível entrar.";
        setError(message);
        toast({
          title: "Não foi possível entrar",
          description: message,
          variant: "destructive",
        });
        trackEvent("login_failed", { error_message: message });
        return;
      }

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta! Redirecionando...",
        variant: "success",
      });

      // Identify user and track login completion
      if (json.user?.id) {
        identifyUser(json.user.id, { email: formData.email });
      }
      trackEvent("login_completed", { redirect_path: redirectPath });

      router.push(redirectPath);
    } catch (err) {
      console.error("Login error", err);
      const message = "Ocorreu um erro ao tentar fazer login.";
      setError(message);
      toast({
        title: "Não foi possível entrar",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-10 lg:py-16">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-0">
          <Card className="overflow-hidden rounded-2xl border-2 border-foreground bg-background p-4 shadow-[8px_8px_0px_#000]">
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-3xl font-black uppercase tracking-tight text-foreground">
                Entrar
              </CardTitle>
              <CardDescription className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Acesse seu painel agora
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <FieldGroup className="space-y-4">
                  <Field>
                    <FieldLabel
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                      htmlFor="email"
                    >
                      Email de Acesso
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="h-12 border-2 border-foreground bg-background font-bold shadow-[2px_2px_0px_#000] focus:ring-0"
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                      htmlFor="password"
                    >
                      Sua Senha
                    </FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="h-12 border-2 border-foreground bg-background font-bold shadow-[2px_2px_0px_#000] focus:ring-0"
                      required
                    />
                  </Field>
                </FieldGroup>

                {error && (
                  <p className="text-xs font-black uppercase tracking-tight text-red-500">
                    ❌ {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="h-14 w-full rounded-xl border-2 border-foreground bg-primary text-lg font-black uppercase tracking-widest text-primary-foreground shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] active:translate-y-0 active:shadow-none"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "ENTRANDO..." : "ENTRAR"}
                </Button>

                <p className="text-center text-sm font-bold text-muted-foreground">
                  Ainda não tem uma conta?{" "}
                  <Link
                    href={`/register?redirect=${encodeURIComponent(redirectPath)}`}
                    className="text-foreground underline decoration-[#FFE600] decoration-4 underline-offset-2 hover:bg-[#FFE600]/20"
                  >
                    CRIAR CONTA
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
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
  );
}
