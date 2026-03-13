"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { HeaderAuthActions, HeaderAuthActionsMobile } from "./header-auth-actions"

function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Greek column stylized as lightbulb base */}
      <rect x="11" y="20" width="10" height="10" rx="1" fill="currentColor" fillOpacity="0.3" />
      <rect x="13" y="22" width="2" height="6" fill="currentColor" fillOpacity="0.2" />
      <rect x="17" y="22" width="2" height="6" fill="currentColor" fillOpacity="0.2" />
      {/* Lightbulb top */}
      <circle cx="16" cy="12" r="8" fill="currentColor" />
      {/* Inner glow */}
      <circle cx="16" cy="12" r="5" fill="currentColor" fillOpacity="0.8" />
      {/* Rays of light */}
      <path d="M16 2 L16 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M24 12 L26 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 12 L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 6 L23.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 6 L8.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <LogoIcon className="h-6 w-6 text-secondary" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-semibold leading-tight tracking-tight text-foreground">
              Boas Ideias
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Online
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link 
            href="/marketplace" 
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Marketplace
          </Link>
          <Link 
            href="/sobre" 
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Sobre
          </Link>
          <Link 
            href="/para-criadores" 
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Para Criadores
          </Link>
        </nav>

        <HeaderAuthActions />

        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/50 bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            <Link 
              href="/marketplace" 
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link 
              href="/sobre" 
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sobre
            </Link>
            <Link 
              href="/para-criadores" 
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Para Criadores
            </Link>
            <HeaderAuthActionsMobile onLinkClick={() => setMobileMenuOpen(false)} />
          </nav>
        </div>
      )}
    </header>
  )
}
