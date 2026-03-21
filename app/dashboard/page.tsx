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
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
              Início
            </span>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/marketplace">
                  Ver Marketplace
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </header>
        <h1 className="font-serif text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          Sua jornada até a primeira venda.
        </h1>
        <p className="mt-3 text-lg font-medium text-muted-foreground">
          Siga os passos abaixo, sem complicação. O dinheiro está a poucos
          cliques de distância.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Step 1: Create Product */}
        <div
          className={`relative flex flex-col sm:flex-row sm:items-center gap-6 rounded-xl border-2 p-6 transition-colors ${hasProducts ? "border-primary/50 bg-primary/5" : "border-foreground bg-background shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]"}`}
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${hasProducts ? "border-primary bg-primary text-primary-foreground" : "border-foreground bg-muted text-foreground font-black text-xl"}`}
          >
            {hasProducts ? <Check strokeWidth={3} className="h-6 w-6" /> : "1"}
          </div>
          <div className="flex-1">
            <h3
              className={`text-xl font-bold ${hasProducts ? "text-foreground" : "text-foreground"}`}
            >
              Criar meu primeiro produto
            </h3>
            {!hasProducts && (
              <p className="mt-2 font-medium text-muted-foreground">
                Faça upload de um PDF ou guia e defina seu preço. Leva 2
                minutos.
              </p>
            )}
          </div>
          {!hasProducts ? (
            <Button
              size="lg"
              className="border-2 border-foreground font-bold shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]"
              asChild
            >
              <Link href="/dashboard/create-product">
                Começar <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div className="text-sm font-bold text-primary">Concluído!</div>
          )}
        </div>

        {/* Step 2: Connect Stripe */}
        <div
          className={`relative flex flex-col sm:flex-row sm:items-center gap-6 rounded-xl border-2 p-6 transition-colors ${isStripeConnected ? "border-primary/50 bg-primary/5" : hasProducts && !isStripeConnected ? "border-foreground bg-background shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]" : "border-border bg-muted/30 opacity-60"}`}
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${isStripeConnected ? "border-primary bg-primary text-primary-foreground" : "border-foreground bg-background text-foreground font-black text-xl"}`}
          >
            {isStripeConnected ? (
              <Check strokeWidth={3} className="h-6 w-6" />
            ) : (
              "2"
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground">
              Conectar conta bancária
            </h3>
            {!isStripeConnected && (
              <p className="mt-2 font-medium text-muted-foreground">
                É assim que o dinheiro das suas vendas cai na sua conta.
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
          {isStripeConnected && (
            <div className="text-sm font-bold text-primary">Concluído!</div>
          )}
        </div>

        {/* Step 3: Share Link */}
        <div
          className={`relative flex flex-col sm:flex-row sm:items-center gap-6 rounded-xl border-2 p-6 transition-colors ${hasFirstSale ? "border-primary/50 bg-primary/5" : hasProducts && isStripeConnected ? "border-foreground bg-background shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]" : "border-border bg-muted/30 opacity-60"}`}
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${hasFirstSale ? "border-primary bg-primary text-primary-foreground" : "border-foreground bg-background text-foreground font-black text-xl"}`}
          >
            {hasFirstSale ? <Check strokeWidth={3} className="h-6 w-6" /> : "3"}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground">
              Compartilhar link de pagamento
            </h3>
            <p className="mt-2 font-medium text-muted-foreground">
              Mande no Instagram, WhatsApp ou onde sua audiência estiver.
            </p>
          </div>
          {hasProducts &&
            isStripeConnected &&
            !hasFirstSale &&
            firstProductSlug && (
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-foreground font-bold shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]"
                asChild
              >
                <a
                  href={`/produto/${firstProductSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver Checkout <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
        </div>

        {/* Success State */}
        <div
          className={`relative flex flex-col sm:flex-row sm:items-center gap-6 rounded-xl border-2 p-6 transition-colors ${hasFirstSale ? "border-foreground bg-green-500 text-primary-foreground shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#fff]" : "border-border bg-muted/30 opacity-40"}`}
        >
          <div className="flex-1">
            <h3
              className={`text-2xl font-black ${hasFirstSale ? "text-primary-foreground" : "text-foreground"}`}
            >
              Fazer a 1ª venda 🎉
            </h3>
            <p
              className={`mt-2 font-bold ${hasFirstSale ? "text-primary-foreground/90" : "text-muted-foreground"}`}
            >
              {hasFirstSale
                ? "Parabéns! Você já faturou online. Agora é só escalar e repetir o processo."
                : "Aguardando seu primeiro cliente..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
