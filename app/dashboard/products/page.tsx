import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowUpRight, Package, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { authConfig, verifySessionToken } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import type { Product, User } from "@/lib/types";
import { ObjectId } from "mongodb";

async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authConfig.cookieName)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload || !ObjectId.isValid(payload.userId)) return null;

  const db = await getDatabase();
  const users = db.collection<User>("users");
  const user = await users.findOne({ _id: new ObjectId(payload.userId) });
  return user ?? null;
}

export default async function ProductsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/products")}`);
  }

  const db = await getDatabase();
  const productsCollection = db.collection<Product>("products");

  const products = await productsCollection
    .find({ creatorId: user._id })
    .sort({ createdAt: -1 })
    .toArray();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <span className="font-serif text-xl font-black tracking-tight text-foreground uppercase">
            Meus Produtos
          </span>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex border-2 border-foreground font-bold shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]"
              asChild
            >
              <Link href="/marketplace">
                Marketplace
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              size="sm"
              className="border-2 border-foreground bg-primary font-black text-foreground shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]"
              asChild
            >
              <Link href="/dashboard/create-product">+ NOVO PRODUTO</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6 lg:p-8">
        {!user.stripeOnboardingComplete && (
          <div className="mb-8 rounded-xl border-2 border-foreground bg-accent p-4 text-sm font-bold text-foreground shadow-[4px_4px_0px_#000]">
            ⚠️ Conecte sua conta Stripe para receber seus pagamentos.
            <Link
              href="/dashboard"
              className="ml-2 underline decoration-2 underline-offset-4"
            >
              CONECTAR AGORA
            </Link>
          </div>
        )}

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-foreground bg-muted/30 py-20 text-center">
            <div className="mb-4 rounded-full border-2 border-foreground bg-background p-6 shadow-[4px_4px_0px_#000]">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-2xl font-black">
              Nenhum produto ainda
            </h3>
            <p className="mt-2 max-w-xs font-medium text-muted-foreground">
              Você ainda não publicou nada. Que tal transformar sua primeira
              ideia em PDF hoje?
            </p>
            <Button
              className="mt-8 h-12 rounded-xl border-2 border-foreground bg-primary px-8 font-black text-foreground shadow-[4px_4px_0px_#000]"
              asChild
            >
              <Link href="/dashboard/create-product">
                CRIAR MEU PRIMEIRO PRODUTO
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product._id?.toString() ?? product.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border-2 border-foreground bg-card shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[8px_8px_0px_#fff]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden border-b-2 border-foreground bg-muted">
                  {product.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.coverImage}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 font-serif text-6xl font-black opacity-20">
                      {product.title.charAt(0)}
                    </div>
                  )}
                  <div className="absolute left-4 top-4">
                    <span className="inline-flex rounded-lg border-2 border-foreground bg-background px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_#000]">
                      {product.status === "active"
                        ? "ATIVO"
                        : product.status === "draft"
                          ? "RASCUNHO"
                          : "ARQUIVADO"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="line-clamp-2 font-serif text-xl font-black text-foreground">
                    {product.title}
                  </h3>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-2xl font-black text-foreground">
                      {(product.priceCents / 100).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-muted-foreground uppercase tracking-tighter">
                      <span className="text-foreground">
                        {product.sales ?? 0}
                      </span>{" "}
                      vendas
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-2 border-foreground font-bold shadow-[2px_2px_0px_#000] hover:bg-muted"
                      asChild
                    >
                      <Link href={`/dashboard/products/${product.slug}`}>
                        GERENCIAR
                      </Link>
                    </Button>
                    <Link
                      href={`/produto/${product.slug}`}
                      target="_blank"
                      className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-foreground bg-background shadow-[2px_2px_0px_#000] hover:bg-muted"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
