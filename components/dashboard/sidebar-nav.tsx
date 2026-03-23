"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  DollarSign,
  Users,
  Settings,
  LogOut,
  Plus,
  LifeBuoy,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Início", href: "/dashboard", icon: LayoutDashboard },
  { name: "Minhas Compras", href: "/dashboard/purchases", icon: Package },
  { name: "Meus Produtos", href: "/dashboard/products", icon: Package },
  {
    name: "Recebimentos e Vendas",
    href: "/dashboard/earnings",
    icon: DollarSign,
  },
  { name: "Afiliados", href: "/dashboard/affiliates", icon: Users },

  { name: "Criar Produto", href: "/dashboard/create-product", icon: Plus },
  { name: "Marketplace", href: "/marketplace", icon: Package },
  { name: "Configurações", href: "/dashboard/settings", icon: Settings },
  { name: "Ajuda", href: "/dashboard/ajuda", icon: LifeBuoy },
  { name: "Sair", href: "/dashboard/logout", icon: LogOut },
];

export function SidebarNav({ userInitials }: { userInitials: string }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r-2 border-foreground bg-background">
      <div className="flex h-20 shrink-0 items-center border-b-2 border-foreground px-6 bg-muted/20">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.webp"
            alt="Boas Ideias Online"
            width={40}
            height={40}
            className="mt-1"
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
      </div>

      <nav className="flex-1 space-y-3 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-tight transition-all border-2",
                isActive
                  ? "bg-primary border-foreground text-primary-foreground shadow-[4px_4px_0px_#000] -translate-y-0.5"
                  : "border-transparent text-foreground hover:bg-muted hover:border-foreground/20",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-primary-foreground" : "text-foreground",
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t-2 border-foreground p-6 bg-muted/10">
        <div className="flex items-center gap-3 rounded-2xl border-2 border-foreground bg-background p-3 shadow-[2px_2px_0px_#000]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-foreground bg-[#FFE600] text-foreground font-black shadow-[2px_2px_0px_#000]">
            {userInitials}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-foreground">
              Minha Conta
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              Logado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile hamburger button + slide-over drawer that reuses the same nav items.
 */
export function MobileNav({ userInitials }: { userInitials: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-foreground bg-background shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed left-0 top-0 z-[110] h-full w-72 border-r-2 border-foreground bg-background shadow-[8px_0px_0px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b-2 border-foreground px-4 bg-muted/20">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <Image
              src="/images/logo.webp"
              alt="Boas Ideias Online"
              width={32}
              height={32}
            />
            <span className="font-serif text-base font-black tracking-tight text-foreground">
              Boas Ideias
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-foreground bg-background shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-4 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-black uppercase tracking-tight transition-all border-2",
                  isActive
                    ? "bg-primary border-foreground text-primary-foreground shadow-[3px_3px_0px_#000]"
                    : "border-transparent text-foreground hover:bg-muted hover:border-foreground/20",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-primary-foreground" : "text-foreground",
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t-2 border-foreground p-4 bg-muted/10">
          <div className="flex items-center gap-3 rounded-2xl border-2 border-foreground bg-background p-3 shadow-[2px_2px_0px_#000]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-foreground bg-[#FFE600] text-foreground font-black text-sm shadow-[2px_2px_0px_#000]">
              {userInitials}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-widest text-foreground">
                Minha Conta
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Logado
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
