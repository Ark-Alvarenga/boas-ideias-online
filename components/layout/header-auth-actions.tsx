"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { toast } from "@/hooks/use-toast";

export function HeaderAuthActions({
  onLinkClick,
}: {
  onLinkClick?: () => void;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => {
        if (cancelled) return;
        setIsLoggedIn(res.ok);
      })
      .catch(() => {
        if (!cancelled) setIsLoggedIn(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        toast({
          title: "Não foi possível sair",
          description: json.error || "Tente novamente.",
          variant: "destructive",
        });
        setIsLoggingOut(false);
        return;
      }

      toast({
        title: "Sessão encerrada",
        description: "Você saiu com sucesso.",
        variant: "success",
      });

      window.location.href = "/";
    } catch {
      toast({
        title: "Erro ao sair",
        description: "Tente novamente.",
        variant: "destructive",
      });
      setIsLoggingOut(false);
    }
  };

  if (isLoggedIn === null) {
    return (
      <div className="hidden md:flex items-center gap-3">
        <span className="text-sm text-muted-foreground">...</span>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-3">
      {isLoggedIn ? (
        <>
          {/* Painel */}
          <Link
            href="/dashboard"
            onClick={onLinkClick}
            className="rounded-md px-4 py-2 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:bg-accent hover:shadow-[2px_2px_0px_#000]"
          >
            Painel
          </Link>

          {/* CTA PRINCIPAL */}
          <Link
            href="/dashboard/create-product"
            onClick={onLinkClick}
            className="rounded-md border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[3px_3px_0px_#000] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000]"
          >
            Criar produto
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-md px-4 py-2 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-[2px_2px_0px_#000]"
          >
            Sair
          </button>
        </>
      ) : (
        <>
          {/* Entrar */}
          <Link
            href="/login"
            onClick={onLinkClick}
            className="rounded-md px-4 py-2 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:bg-accent hover:shadow-[2px_2px_0px_#000]"
          >
            Entrar
          </Link>

          {/* CTA PRINCIPAL */}
          <Link
            href="/register"
            onClick={onLinkClick}
            className="rounded-md border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[3px_3px_0px_#000] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000]"
          >
            Criar produto
          </Link>
        </>
      )}
    </div>
  );
}

export function HeaderAuthActionsMobile({
  onLinkClick,
}: {
  onLinkClick?: () => void;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => {
        if (cancelled) return;
        setIsLoggedIn(res.ok);
      })
      .catch(() => {
        if (!cancelled) setIsLoggedIn(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch {
      setIsLoggingOut(false);
    }
  };

  if (isLoggedIn === null) {
    return (
      <div className="mt-4 border-t border-border/50 pt-4">
        <span className="text-sm text-muted-foreground">...</span>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-2 border-t border-border/50 pt-4">
      {isLoggedIn ? (
        <>
          <Link
            href="/dashboard"
            onClick={onLinkClick}
            className="rounded-md px-4 py-3 text-sm font-bold text-foreground hover:bg-accent"
          >
            Painel
          </Link>

          <Link
            href="/dashboard/create-product"
            onClick={onLinkClick}
            className="rounded-md border-1 border-foreground bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[2px_2px_0px_#000]"
          >
            Criar produto
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-md px-4 py-2 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-[2px_2px_0px_#000]"
          >
            Sair
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            onClick={onLinkClick}
            className="rounded-md px-4 py-3 text-sm font-bold text-foreground hover:bg-accent"
          >
            Entrar
          </Link>

          <Link
            href="/register"
            onClick={onLinkClick}
            className="rounded-md border-1 border-foreground bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[2px_2px_0px_#000]"
          >
            Criar produto
          </Link>
        </>
      )}
    </div>
  );
}
