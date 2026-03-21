import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowUpRight } from "lucide-react";
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
import { ProductEditForm } from "@/components/dashboard/product-edit-form";
import { resolvePriceCents } from "@/lib/currency";

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

export default async function DashboardProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/dashboard/products/${slug}`)}`,
    );
  }

  const db = await getDatabase();
  const productsCollection = db.collection<Product>("products");

  const product = await productsCollection.findOne({
    slug,
    creatorId: user._id!,
  });

  if (!product) {
    redirect("/dashboard/products");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/dashboard/products" className="flex items-center gap-3">
            <span className="font-serif text-xl font-black tracking-tight text-foreground uppercase">
              Gerenciar Produto
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-foreground font-bold shadow-[2px_2px_0px_#000]"
              asChild
            >
              <Link href="/dashboard/products">Voltar</Link>
            </Button>
            {product.status === "active" && (
              <Button
                size="sm"
                className="border-2 border-foreground bg-primary font-bold shadow-[2px_2px_0px_#000]"
                asChild
              >
                <Link href={`/produto/${product.slug}`}>
                  Ver Página Pública
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6 lg:p-8">
        <Card className="overflow-hidden rounded-3xl border-2 border-foreground bg-card shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]">
          <CardHeader className="border-b-2 border-foreground bg-muted/50 p-6 lg:p-8">
            <CardTitle className="font-serif text-3xl font-black text-foreground">
              {product.title}
            </CardTitle>
            <CardDescription className="text-base font-bold text-muted-foreground">
              Atualize as informações do seu produto. Alterações salvas aqui são
              refletidas imediatamente no marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 lg:p-10">
            <ProductEditForm
              slug={product.slug}
              initialTitle={product.title}
              initialDescription={product.description}
              initialPriceCents={resolvePriceCents(product)}
              initialCategory={product.category}
              status={product.status}
              views={product.views}
              sales={product.sales}
              featured={product.featured}
              affiliateEnabled={product.affiliateEnabled}
              affiliateCommissionPercent={product.affiliateCommissionPercent}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
