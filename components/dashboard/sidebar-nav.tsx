"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  DollarSign,
  Users,
  Settings,
  LogOut,
  HeartHandshake,
  LifeBuoy,
  Plus,
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
          <img
            src="/images/logo.png"
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
