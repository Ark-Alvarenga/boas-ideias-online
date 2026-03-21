import Link from "next/link";
import { getDatabase } from "@/lib/mongodb";
import type { Product, User } from "@/lib/types";
import { authConfig, verifySessionToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { Check, ArrowRight, ExternalLink, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectStripeCard } from "@/components/dashboard/connect-stripe-card";

async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authConfig.cookieName)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  const db = await getDatabase();
  const users = db.collection<User>("users");
  const user = await users.findOne({
    _id: new ObjectId(payload.userId),
  });
  return user ?? null;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  const db = await getDatabase();
  const productsCollection = db.collection<Product>("products");

  const userProducts = await productsCollection
    .find({ creatorId: user._id })
    .toArray();

  const hasProducts = userProducts.length > 0;
  const isStripeConnected = !!(
    user.stripeAccountId && user.stripeOnboardingComplete
  );
  const totalSales = userProducts.reduce((acc, p) => acc + (p.sales || 0), 0);
  const hasFirstSale = totalSales > 0;

  const firstProductSlug = hasProducts ? userProducts[0].slug : null;

  return (
    <div className="mx-auto max-w-4xl p-8 pt-6">
      <div className="mb-12">
        <div className="mb-4 inline-flex rounded-full bg-primary/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-primary border-2 border-primary shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
          DASHBOARD
        </div>
        <h1 className="font-serif text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Sua jornada até a <br className="hidden md:block" />
          <span className="text-primary tracking-tighter italic">
            primeira venda.
          </span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg font-medium text-muted-foreground leading-relaxed">
          Siga os passos abaixo, sem complicação. O dinheiro está a poucos
          cliques de distância para quem começa hoje.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Step 1: Create Product */}
        <div
          className={`relative group flex flex-col sm:flex-row sm:items-center gap-8 rounded-3xl border-2 p-8 transition-all ${
            hasProducts
              ? "border-primary/50 bg-primary/5"
              : "border-foreground bg-background shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]"
          }`}
        >
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 transition-transform group-hover:scale-105 ${
              hasProducts
                ? "border-primary bg-primary text-primary-foreground shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
                : "border-foreground bg-muted text-foreground font-black text-2xl shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]"
            }`}
          >
            {hasProducts ? <Check strokeWidth={4} className="h-8 w-8" /> : "1"}
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-2xl font-black text-foreground">
              Criar meu primeiro produto
            </h3>
            {!hasProducts && (
              <p className="mt-2 text-base font-medium text-muted-foreground leading-relaxed">
                Faça upload de um PDF ou guia e defina seu preço. Leva menos de
                2 minutos.
              </p>
            )}
            {hasProducts && (
              <p className="mt-1 text-sm font-bold text-primary">
                🎉 Produto criado com sucesso!
              </p>
            )}
          </div>
          {!hasProducts && (
            <Button
              size="lg"
              className="h-14 rounded-2xl border-2 border-foreground bg-primary px-8 font-black text-foreground shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[6px_6px_0px_#fff]"
              asChild
            >
              <Link href="/dashboard/create-product">
                COMEÇAR <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>

        {/* Step 2: Connect Stripe */}
        <div
          className={`relative group flex flex-col sm:flex-row sm:items-center gap-8 rounded-3xl border-2 p-8 transition-all ${
            isStripeConnected
              ? "border-primary/50 bg-primary/5"
              : hasProducts
                ? "border-foreground bg-background shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]"
                : "border-border bg-muted/40 opacity-60"
          }`}
        >
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 transition-transform group-hover:scale-105 ${
              isStripeConnected
                ? "border-primary bg-primary text-primary-foreground shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
                : "border-foreground bg-background text-foreground font-black text-2xl shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]"
            }`}
          >
            {isStripeConnected ? (
              <Check strokeWidth={4} className="h-8 w-8" />
            ) : (
              "2"
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-2xl font-black text-foreground">
              Conectar conta bancária
            </h3>
            {!isStripeConnected && (
              <p className="mt-2 text-base font-medium text-muted-foreground leading-relaxed">
                É assim que o dinheiro das suas vendas cai na sua conta
                automaticamente.
              </p>
            )}
            {isStripeConnected && (
              <p className="mt-1 text-sm font-bold text-primary">
                ✅ Stripe conectado e pronto.
              </p>
            )}
          </div>
          {!isStripeConnected && hasProducts && (
            <div className="sm:w-auto w-full">
              <ConnectStripeCard
                stripeAccountId={user.stripeAccountId}
                stripeOnboardingComplete={user.stripeOnboardingComplete}
                compact={true}
              />
            </div>
          )}
        </div>

        {/* Step 3: Share Link */}
        <div
          className={`relative group flex flex-col sm:flex-row sm:items-center gap-8 rounded-3xl border-2 p-8 transition-all ${
            hasFirstSale
              ? "border-primary/50 bg-primary/5"
              : hasProducts && isStripeConnected
                ? "border-foreground bg-background shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]"
                : "border-border bg-muted/40 opacity-60"
          }`}
        >
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 transition-transform group-hover:scale-105 ${
              hasFirstSale
                ? "border-primary bg-primary text-primary-foreground shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
                : "border-foreground bg-background text-foreground font-black text-2xl shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]"
            }`}
          >
            {hasFirstSale ? <Check strokeWidth={4} className="h-8 w-8" /> : "3"}
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-2xl font-black text-foreground">
              Compartilhar seu link
            </h3>
            <p className="mt-2 text-base font-medium text-muted-foreground leading-relaxed">
              Mande no Instagram, TikTok ou WhatsApp. Seu checkout está pronto.
            </p>
          </div>
          {hasProducts &&
            isStripeConnected &&
            !hasFirstSale &&
            firstProductSlug && (
              <Button
                size="lg"
                className="h-14 rounded-2xl border-2 border-foreground bg-background px-8 font-black text-foreground shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[6px_6px_0px_#fff]"
                asChild
              >
                <a
                  href={`/produto/${firstProductSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  VER CHECKOUT <ArrowUpRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            )}
        </div>

        {/* Success / Statistics State */}
        <div
          className={`relative flex flex-col rounded-3xl border-2 p-10 transition-all ${
            hasFirstSale
              ? "border-foreground bg-green-500 text-foreground shadow-[12px_12px_0px_#000] dark:shadow-[12px_12px_0px_#fff]"
              : "border-border bg-muted/30 opacity-40"
          }`}
        >
          <div className="flex-1">
            <h3
              className={`font-serif text-3xl font-black ${
                hasFirstSale ? "text-foreground" : "text-foreground"
              }`}
            >
              Fazer a 1ª venda 🎉
            </h3>
            <p
              className={`mt-4 text-lg font-bold ${
                hasFirstSale
                  ? "text-foreground/80 leading-relaxed"
                  : "text-muted-foreground"
              }`}
            >
              {hasFirstSale
                ? "Parabéns! Você já faturou online. Agora é só escalar seu marketing e repetir o processo com novas ideias."
                : "Aguardando seu primeiro cliente para explodir o champanhe..."}
            </p>

            {hasFirstSale && (
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border-2 border-foreground bg-background/50 p-6 shadow-[4px_4px_0px_#000]">
                  <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    VENDAS
                  </div>
                  <div className="mt-1 text-3xl font-black">{totalSales}</div>
                </div>
                <div className="rounded-2xl border-2 border-foreground bg-background/50 p-6 shadow-[4px_4px_0px_#000]">
                  <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    STATUS
                  </div>
                  <div className="mt-1 text-3xl font-black">ATIVA</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
