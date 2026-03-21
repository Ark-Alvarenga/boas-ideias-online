"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import {
  HeaderAuthActions,
  HeaderAuthActionsMobile,
} from "./header-auth-actions";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-[100] w-full border-b-2 border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/images/logo.jpg"
            alt="Boas Ideias Online"
            className="h-10 w-auto mt-1"
          />

          <div className="flex flex-col leading-tight">
            <span className="font-serif text-lg font-black tracking-tight text-foreground">
              Boas Ideias
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Online
            </span>
          </div>
        </Link>

        {/* NAV DESKTOP */}
        <nav className="hidden items-center gap-2 md:flex">
          <Link
            href="/marketplace"
            className="rounded-md px-4 py-2 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:bg-accent hover:shadow-[2px_2px_0px_#000]"
          >
            Marketplace
          </Link>

          <Link
            href="/sobre"
            className="rounded-md px-4 py-2 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:bg-accent hover:shadow-[2px_2px_0px_#000]"
          >
            Sobre
          </Link>

          <Link
            href="/para-criadores"
            className="rounded-md px-4 py-2 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:bg-accent hover:shadow-[2px_2px_0px_#000]"
          >
            Para Criadores
          </Link>

          <Link
            href="/ajuda"
            className="rounded-md px-4 py-2 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:bg-accent hover:shadow-[2px_2px_0px_#000]"
          >
            Ajuda
          </Link>
        </nav>

        {/* ACTIONS DESKTOP */}
        <div className="hidden md:block">
          <HeaderAuthActions />
        </div>

        {/* MOBILE BUTTON */}
        <button
          className="flex h-11 w-11 items-center justify-center rounded-md border-2 border-transparent transition hover:border-foreground hover:bg-accent md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`overflow-hidden border-t border-border/40 bg-background transition-all duration-300 md:hidden ${
          mobileMenuOpen
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 border-t-0"
        }`}
      >
        <nav className="flex flex-col gap-2 px-4 py-4">
          <Link
            href="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-md px-4 py-3 text-sm font-bold text-foreground transition hover:bg-accent"
          >
            Marketplace
          </Link>

          <Link
            href="/sobre"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-md px-4 py-3 text-sm font-bold text-foreground transition hover:bg-accent"
          >
            Sobre
          </Link>

          <Link
            href="/para-criadores"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-md px-4 py-3 text-sm font-bold text-foreground transition hover:bg-accent"
          >
            Para Criadores
          </Link>

          <Link
            href="/ajuda"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-md px-4 py-3 text-sm font-bold text-foreground transition hover:bg-accent"
          >
            Ajuda
          </Link>

          <HeaderAuthActionsMobile
            onLinkClick={() => setMobileMenuOpen(false)}
          />
        </nav>
      </div>
    </header>
  );
}
