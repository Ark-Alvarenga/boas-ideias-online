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

const navItems = [
  { name: "Início", href: "/dashboard", icon: LayoutDashboard },
  { name: "Meus Produtos", href: "/dashboard/products", icon: Package },
  {
    name: "Recebimentos e Vendas",
    href: "/dashboard/earnings",
    icon: DollarSign,
  },
  { name: "Afiliados", href: "/dashboard/affiliates", icon: Users },
  { name: "Criar Produto", href: "/dashboard/create-product", icon: Plus },
  { name: "Configurações", href: "/dashboard/settings", icon: Settings },
  { name: "Ajuda", href: "/dashboard/ajuda", icon: LifeBuoy },
  { name: "Sair", href: "/dashboard/logout", icon: LogOut },
];

export function SidebarNav({ userInitials }: { userInitials: string }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r-2 border-foreground bg-background">
      <div className="flex h-16 shrink-0 items-center border-b-2 border-foreground px-6">
        <Link href="/" className="flex items-center gap-2">
          {/*<HeartHandshake className="h-6 w-6 text-primary" />*/}
          <img
            src="/images/logo.jpg"
            alt="Boas Ideias Online"
            className="h-8 w-8"
          />
          <span className="font-serif text-xl font-black">Boas Ideias</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-bold transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t-2 border-foreground p-4">
        <div className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground border-2 border-foreground shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
            {userInitials}
          </div>
          <span>Minha Conta</span>
        </div>
      </div>
    </div>
  );
}
