"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import { Loader2, Eye, EyeOff, Archive, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const STATUS_LABELS: Record<string, string> = {
  active: "Publicado",
  draft: "Rascunho",
  archived: "Arquivado",
};

interface ProductEditFormProps {
  slug: string;
  initialTitle: string;
  initialDescription: string;
  initialPriceCents: number;
  initialCategory: string;
  status: "active" | "draft" | "archived";
  views: number;
  sales: number;
  featured?: boolean;
}

export function ProductEditForm({
  slug,
  initialTitle,
  initialDescription,
  initialPriceCents,
  initialCategory,
  status: initialStatus,
  views,
  sales,
  featured = false,
}: ProductEditFormProps) {
  // Auto-dismiss success messages after 4 seconds
  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setError(null);
    setTimeout(() => setSuccess(null), 4000);
  };
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [price, setPrice] = useState((initialPriceCents / 100).toFixed(2));
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState<"active" | "draft" | "archived">(initialStatus);
  const [isFeatured, setIsFeatured] = useState<boolean>(featured);
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusAction, setIsStatusAction] = useState(false);
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
          priceCents: Math.round(Number(price) * 100),
          category,
          featured: isFeatured,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Não foi possível salvar as alterações.");
        return;
      }

      showSuccess("Alterações salvas com sucesso.");
      toast({
        title: "Produto atualizado",
        description: "Suas alterações foram salvas com sucesso.",
      });
      router.refresh();
    } catch (err) {
      console.error("Update product error", err);
      const message = "Ocorreu um erro ao salvar o produto.";
      setError(message);
      toast({
        title: "Não foi possível salvar o produto",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnpublish = async () => {
    setIsStatusAction(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/products/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Não foi possível despublicar.");
        return;
      }
      setStatus("draft");
      showSuccess("Produto removido do marketplace (rascunho).");
      toast({
        title: "Produto despublicado",
        description: "Seu produto agora está como rascunho.",
      });
      router.refresh();
    } catch (err) {
      console.error("Unpublish error", err);
      const message = "Erro ao despublicar.";
      setError(message);
      toast({
        title: "Não foi possível despublicar",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsStatusAction(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm("Arquivar este produto? Ele sairá do marketplace mas continuará visível no seu painel.")) return;
    setIsStatusAction(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/products/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Não foi possível arquivar.");
        return;
      }
      setStatus("archived");
      showSuccess("Produto arquivado. Não aparece mais no marketplace.");
      toast({
        title: "Produto arquivado",
        description: "Seu produto não aparecerá mais no marketplace.",
      });
      router.refresh();
    } catch (err) {
      console.error("Archive error", err);
      const message = "Erro ao arquivar.";
      setError(message);
      toast({
        title: "Não foi possível arquivar",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsStatusAction(false);
    }
  };

  const handleRepublish = async () => {
    setIsStatusAction(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/products/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Não foi possível republicar.");
        return;
      }
      setStatus("active");
      showSuccess("Produto republicado no marketplace.");
      toast({
        title: "Produto republicado",
        description: "Seu produto voltou a aparecer no marketplace.",
      });
      router.refresh();
    } catch (err) {
      console.error("Republish error", err);
      const message = "Erro ao republicar.";
      setError(message);
      toast({
        title: "Não foi possível republicar",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsStatusAction(false);
    }
  };

  const handlePublish = async () => {
    setIsStatusAction(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/products/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Não foi possível publicar.");
        return;
      }
      setStatus("active");
      showSuccess("Produto publicado no marketplace.");
      toast({
        title: "Produto publicado",
        description: "Seu produto agora aparece no marketplace.",
      });
      router.refresh();
    } catch (err) {
      console.error("Publish error", err);
      const message = "Erro ao publicar.";
      setError(message);
      toast({
        title: "Não foi possível publicar",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsStatusAction(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Excluir este produto permanentemente? Esta ação não pode ser desfeita. Produtos com vendas não podem ser excluídos."
      )
    )
      return;
    setIsStatusAction(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/products/${slug}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Não foi possível excluir o produto.");
        return;
      }
      setSuccess("Produto excluído.");
      toast({
        title: "Produto excluído",
        description: "Seu produto foi removido do painel.",
      });
      router.push("/dashboard/products");
      router.refresh();
    } catch (err) {
      console.error("Delete error", err);
      const message = "Erro ao excluir o produto.";
      setError(message);
      toast({
        title: "Não foi possível excluir",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsStatusAction(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr,1.2fr] lg:gap-10">
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
              <Select
                value={category}
                onValueChange={(value) => setCategory(value)}
                required
              >
                <SelectTrigger className="h-11 border-border/50 bg-background">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          {STATUS_LABELS[status] ?? status}
        </p>
        <p>
          <span className="font-medium text-foreground">Vendas:</span>{" "}
          {sales}
        </p>
        <p>
          <span className="font-medium text-foreground">Visualizações:</span>{" "}
          {views}
        </p>

        <div className="border-t border-border/60 pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">
              <span className="font-medium text-foreground">Destaque na home:</span>{" "}
              {isFeatured ? "Sim" : "Não"}
            </span>
            <button
              type="button"
              onClick={() => setIsFeatured((prev) => !prev)}
              className="text-xs font-medium text-primary underline-offset-2 hover:underline"
            >
              {isFeatured ? "Remover destaque" : "Marcar como destaque"}
            </button>
          </div>

          <p className="font-medium text-foreground">Ações</p>
          {status === "active" && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={handleArchive}
                disabled={isStatusAction}
              >
                {isStatusAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
                Arquivar (sair do marketplace)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                disabled={isStatusAction}
              >
                {isStatusAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Excluir permanentemente
              </Button>
            </>
          )}
          {status === "archived" && (
            <>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={handleRepublish}
                disabled={isStatusAction}
              >
                {isStatusAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                Republicar (voltar ao marketplace)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                disabled={isStatusAction}
              >
                {isStatusAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Excluir permanentemente
              </Button>
            </>
          )}
          {status === "draft" && (
            <>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={handlePublish}
                disabled={isStatusAction}
              >
                {isStatusAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                Publicar no marketplace
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                disabled={isStatusAction}
              >
                {isStatusAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Excluir permanentemente
              </Button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}

