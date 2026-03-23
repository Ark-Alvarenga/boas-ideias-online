import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowUpRight, Users, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getDatabase } from "@/lib/mongodb";
import type { AffiliateSale, Product, User } from "@/lib/types";
import { authConfig, verifySessionToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authConfig.cookieName)?.value;
  if (!token) return null;
  const payload = verifySessionToken(token);
  if (!payload || !ObjectId.isValid(payload.userId)) return null;
  const db = await getDatabase();
  const user = await db
    .collection<User>("users")
    .findOne({ _id: new ObjectId(payload.userId) });
  return user ?? null;
}

export default async function ProductAffiliatesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent("/dashboard/product-affiliates")}`,
    );
  }

  const db = await getDatabase();
  const creatorId = user._id!;
  const salesCollection = db.collection<AffiliateSale>("affiliateSales");
  const usersCollection = db.collection<User>("users");
  const productsCollection = db.collection<Product>("products");

  const sales = await salesCollection
    .find({ creatorUserId: creatorId })
    .sort({ createdAt: -1 })
    .toArray();

  const totalRevenue = sales.reduce((s, x) => s + x.saleAmountCents, 0) / 100;
  const totalCommission =
    sales.reduce((s, x) => s + x.commissionAmountCents, 0) / 100;
  const affiliateUserIds = [
    ...new Set(sales.map((x) => x.affiliateUserId.toString())),
  ];
  const productIds = [...new Set(sales.map((x) => x.productId.toString()))];

  const [affiliateUsers, products] = await Promise.all([
    affiliateUserIds.length > 0
      ? usersCollection
        .find({
          _id: { $in: affiliateUserIds.map((id) => new ObjectId(id)) },
        })
        .toArray()
      : [],
    productIds.length > 0
      ? productsCollection
        .find({ _id: { $in: productIds.map((id) => new ObjectId(id)) } })
        .toArray()
      : [],
  ]);
  const usersById = new Map(affiliateUsers.map((u) => [u._id!.toString(), u]));
  const productsById = new Map(products.map((p) => [p._id!.toString(), p]));

  const byAffiliate = sales.reduce(
    (acc, sale) => {
      const id = sale.affiliateUserId.toString();
      if (!acc[id]) acc[id] = { sales: 0, commission: 0, count: 0 };
      acc[id].sales += sale.saleAmountCents / 100;
      acc[id].commission += sale.commissionAmountCents / 100;
      acc[id].count = (acc[id].count ?? 0) + 1;
      return acc;
    },
    {} as Record<string, { sales: number; commission: number; count: number }>,
  );
  const topAffiliates = Object.entries(byAffiliate)
    .map(([userId, data]) => ({
      userId,
      name: usersById.get(userId)?.name ?? "Afiliado",
      ...data,
    }))
    .sort((a, b) => b.commission - a.commission)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Image
                src="/images/logo.webp"
                alt="Boas Ideias Online"
                width={32}
                height={32}
              />
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
              Afiliados dos meus produtos
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/products">Meus produtos</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/marketplace">
                Marketplace
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Vendas via afiliados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">
                R$ {totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {sales.length} venda(s)
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Comissão paga a afiliados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">
                R$ {totalCommission.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Users className="h-4 w-4" />
                Afiliados ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">
                {topAffiliates.length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50 bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Top afiliados</CardTitle>
            <CardDescription>
              Afiliados que mais geraram vendas dos seus produtos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topAffiliates.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma venda via afiliados ainda. Ative o programa de afiliados
                em{" "}
                <Link
                  href="/dashboard/products"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Meus produtos
                </Link>
                .
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Afiliado</th>
                      <th className="pb-3 font-medium text-right">Vendas</th>
                      <th className="pb-3 font-medium text-right">Comissão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topAffiliates.map((aff) => (
                      <tr
                        key={aff.userId}
                        className="border-b border-border/50"
                      >
                        <td className="py-3 font-medium text-foreground">
                          {aff.name}
                        </td>
                        <td className="py-3 text-right">
                          {aff.count} venda(s) · R$ {aff.sales.toFixed(2)}
                        </td>
                        <td className="py-3 text-right">
                          R$ {aff.commission.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
