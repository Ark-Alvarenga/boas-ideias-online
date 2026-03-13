"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Loader2 } from "lucide-react";

interface ProductEditFormProps {
  slug: string;
  initialTitle: string;
  initialDescription: string;
  initialPrice: number;
  initialCategory: string;
  status: string;
  views: number;
  sales: number;
}

export function ProductEditForm({
  slug,
  initialTitle,
  initialDescription,
  initialPrice,
  initialCategory,
  status,
  views,
  sales,
}: ProductEditFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [price, setPrice] = useState(initialPrice.toString());
  const [category, setCategory] = useState(initialCategory);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/products/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          category,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Não foi possível salvar as alterações.");
        return;
      }

      setSuccess("Alterações salvas com sucesso.");
      router.refresh();
    } catch (err) {
      console.error("Update product error", err);
      setError("Ocorreu um erro ao salvar o produto.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[2fr,1.2fr]">
      <div>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="title">Título</FieldLabel>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 border-border/50 bg-background"
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Descrição</FieldLabel>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-32 border-border/50 bg-background"
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="price">Preço (R$)</FieldLabel>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-11 border-border/50 bg-background"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="category">Categoria</FieldLabel>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 border-border/50 bg-background"
                required
              />
            </Field>
          </div>
        </FieldGroup>

        {error && (
          <p className="mt-4 text-sm text-red-500">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-4 text-sm text-emerald-600">
            {success}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <Button
            type="submit"
            disabled={isSaving}
            className="h-11"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </span>
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Status:</span>{" "}
          {status === "active"
            ? "Ativo"
            : status === "draft"
            ? "Rascunho"
            : "Arquivado"}
        </p>
        <p>
          <span className="font-medium text-foreground">Vendas:</span>{" "}
          {sales}
        </p>
        <p>
          <span className="font-medium text-foreground">Visualizações:</span>{" "}
          {views}
        </p>
      </div>
    </form>
  );
}

