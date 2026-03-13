import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Lightbulb, ArrowUpRight, Download, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getDatabase } from "@/lib/mongodb";
import type { Order, Product, User } from "@/lib/types";
import { authConfig, verifySessionToken } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { ConnectStripeCard } from "@/components/dashboard/connect-stripe-card";
import { ProductsPreview } from "./products-preview/page";

async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authConfig.cookieName)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  const db = await getDatabase();
  const users = db.collection<User>("users");
  const user = await users.findOne({
    _id: new (await import("mongodb")).ObjectId(payload.userId),
  });
  return user ?? null;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  const db = await getDatabase();
  const ordersCollection = db.collection<Order>("orders");
  const productsCollection = db.collection<Product>("products");

  const orders = await ordersCollection
    .find({ userId: user._id, status: "paid" })
    .sort({ createdAt: -1 })
    .toArray();

  const productIds = Array.from(
    new Set(orders.map((order) => order.productId.toString())),
  );
  const products =
    productIds.length > 0
      ? await productsCollection
          .find({ _id: { $in: productIds.map((id) => new ObjectId(id)) } })
          .toArray()
      : [];

  const userProducts = await productsCollection
    .find({ creatorId: user._id })
    .sort({ createdAt: -1 })
    .toArray();

  const productsById = new Map(
    products.map((product) => [product._id!.toString(), product]),
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Lightbulb className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
              Meu painel
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              asChild
            >
              <Link href="/marketplace">
                Ver Marketplace
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/earnings">
                <DollarSign className="mr-1 h-3.5 w-3.5" />
                Ganhos
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/products">Produtos</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/affiliates">Afiliados</Link>
            </Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Olá, {user.name.split(" ")[0]}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Aqui você encontra todos os produtos que já comprou e pode baixar
            seus arquivos quando quiser.
          </p>
        </div>

        <div className="mb-8">
          <ConnectStripeCard
            stripeAccountId={user.stripeAccountId}
            stripeOnboardingComplete={user.stripeOnboardingComplete}
          />
        </div>
      
        <ProductsPreview
  products={userProducts.map((product) => ({
    _id: product._id.toString(),
    slug: product.slug,
    title: product.title,
    description: product.description,
    coverImage: product.coverImage,
    price: product.price,
    status: product.status,
  }))}
/>
<p>{userProducts[0].coverImage?.toString()}</p>

        <Card className="border-border/50 bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Meus produtos comprados</CardTitle>
            <CardDescription>
              Acesse rapidamente os PDFs dos cursos e guias que você já
              adquiriu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/40 p-6 text-sm text-muted-foreground">
                Você ainda não comprou nenhum produto.{" "}
                <Link
                  href="/marketplace"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Explore o marketplace
                </Link>{" "}
                para encontrar algo incrível.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const product = productsById.get(order.productId.toString());
                  const title = product?.title ?? order.productTitle;
                  const price = product?.price ?? order.productPrice;

                  return (
                    <div
                      key={order._id!.toString()}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-background p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500/15 to-indigo-500/15">
                          <span className="font-serif text-lg font-semibold text-foreground/30">
                            {title.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {title}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span>R${price}</span>
                            <span className="h-1 w-1 rounded-full bg-border" />
                            <span>
                              Comprado em{" "}
                              {order.createdAt.toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="inline-flex items-center gap-1.5"
                        asChild
                      >
                        <Link href={`/download/${order._id!.toString()}`}>
                          <Download className="h-3.5 w-3.5" />
                          Baixar PDF
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
