"use client";

import Link from "next/link";
import Image from "next/image";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Image
                src="/images/logo.webp"
                alt="Boas Ideias Online"
                width={32}
                height={32}
              />
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
              Boas Ideias
            </span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 sm:px-6">
        <div className="mx-auto max-w-md text-center">
          <p className="text-8xl font-semibold tracking-tight text-destructive/20">
            500
          </p>
          <h1 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Algo deu errado
          </h1>
          <p className="mt-3 text-muted-foreground">
            Ocorreu um erro inesperado. Tente novamente ou volte para a página
            inicial.
          </p>

          {error?.digest && (
            <p className="mt-2 text-xs text-muted-foreground/60">
              Código: {error.digest}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button className="h-11" onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
            <Button variant="outline" className="h-11" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao início
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
