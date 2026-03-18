"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import { productUpdateSchema } from "@/lib/schema";
import { useFormValidation, type FieldStatus } from "@/hooks/use-form-validation";
import { Switch } from "@/components/ui/switch";
import { Loader2, Eye, Archive, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  active: "Publicado",
  draft: "Rascunho",
  archived: "Arquivado",
};

/** Returns border class based on field validation status */
function borderClass(status: FieldStatus | undefined): string {
  if (status === "invalid") return "border-red-500 focus-visible:ring-red-500/30";
  if (status === "valid") return "border-green-500 focus-visible:ring-green-500/30";
  return "border-border/50";
}

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
  affiliateEnabled?: boolean;
  affiliateCommissionPercent?: number;
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
  affiliateEnabled = false,
  affiliateCommissionPercent = 20,
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
  const [isAffiliateEnabled, setIsAffiliateEnabled] = useState<boolean>(affiliateEnabled);
  const [commissionPercent, setCommissionPercent] = useState<number>(affiliateCommissionPercent);
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusAction, setIsStatusAction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    fieldErrors,
    fieldStatus,
    validateField,
    setServerErrors,
    clearFieldError,
    hasErrors,
  } = useFormValidation<{
    title?: string;
    description?: string;
    priceCents?: number;
    category?: string;
    affiliateCommissionPercent?: number;
  }>(productUpdateSchema);

  const handleValidateField = useCallback(
    (field: string, value: unknown) => {
      if (field === "price") {
        const cents = value ? Math.round(Number(value) * 100) : undefined;
        validateField("priceCents", cents);
      } else {
        validateField(field as "title" | "description" | "category" | "affiliateCommissionPercent", value);
      }
    },
    [validateField],
  );

  const handleAffiliateToggle = useCallback(
    (enabled: boolean) => {
      setIsAffiliateEnabled(enabled);
      if (!enabled) {
        // When disabling affiliate, force commission to 0 and clear errors
        setCommissionPercent(0);
        clearFieldError("affiliateCommissionPercent");
      } else {
        // When enabling, set a sensible default
        setCommissionPercent(20);
        validateField("affiliateCommissionPercent", 20);
      }
    },
    [clearFieldError, validateField],
  );

  const handleCommissionChange = useCallback(
    (value: string) => {
      // Clamp to 0–50
      let num = Number(value);
      if (isNaN(num)) num = 0;
      num = Math.min(50, Math.max(0, num));
      setCommissionPercent(num);
      validateField("affiliateCommissionPercent", num);
    },
    [validateField],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    // Client-side validation before submitting
    const priceCents = Math.round(Number(price) * 100);
    let hasClientErrors = false;

    if (!validateField("title", title)) hasClientErrors = true;
    if (!validateField("description", description)) hasClientErrors = true;
    if (!validateField("priceCents", priceCents)) hasClientErrors = true;
    if (!validateField("category", category)) hasClientErrors = true;

    if (isAffiliateEnabled) {
      if (!validateField("affiliateCommissionPercent", commissionPercent)) hasClientErrors = true;
    }

    if (hasClientErrors) {
      setIsSaving(false);
      toast({
        title: "Corrija os erros antes de continuar",
        description: "Verifique os campos destacados em vermelho.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch(`/api/products/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priceCents,
          category,
          featured: isFeatured,
          affiliateEnabled: isAffiliateEnabled,
          affiliateCommissionPercent: isAffiliateEnabled ? commissionPercent : 0,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        // Map server errors to fields
        if (json.details && Array.isArray(json.details)) {
          setServerErrors(json.details);
          toast({
            title: "Corrija os erros antes de continuar",
            description: "O servidor retornou erros de validação.",
            variant: "destructive",
          });
        } else {
          setError(json.error || "Não foi possível salvar as alterações.");
        }
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

  // Suppress unused variable lint – kept for potential future use
  void handleUnpublish;

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr,1.2fr] lg:gap-10">
      <div>
        <FieldGroup>
          <Field data-invalid={fieldStatus.title === "invalid" || undefined}>
            <FieldLabel htmlFor="title">Título</FieldLabel>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                handleValidateField("title", e.target.value);
              }}
              onBlur={() => handleValidateField("title", title)}
              className={cn("h-11 bg-background", borderClass(fieldStatus.title))}
              required
            />
            {fieldErrors.title ? (
              <FieldError>{fieldErrors.title}</FieldError>
            ) : (
              <FieldDescription>Mínimo de 3 caracteres</FieldDescription>
            )}
          </Field>

          <Field data-invalid={fieldStatus.description === "invalid" || undefined}>
            <FieldLabel htmlFor="description">Descrição</FieldLabel>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                handleValidateField("description", e.target.value);
              }}
              onBlur={() => handleValidateField("description", description)}
              className={cn("min-h-32 bg-background", borderClass(fieldStatus.description))}
              required
            />
            {fieldErrors.description ? (
              <FieldError>{fieldErrors.description}</FieldError>
            ) : (
              <FieldDescription>Mínimo de 10 caracteres</FieldDescription>
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={fieldStatus.priceCents === "invalid" || undefined}>
              <FieldLabel htmlFor="price">Preço (R$)</FieldLabel>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  handleValidateField("price", e.target.value);
                }}
                onBlur={() => handleValidateField("price", price)}
                className={cn("h-11 bg-background", borderClass(fieldStatus.priceCents))}
                required
              />
              {fieldErrors.priceCents ? (
                <FieldError>{fieldErrors.priceCents}</FieldError>
              ) : (
                <FieldDescription>Valor em reais. Ex: 29.90</FieldDescription>
              )}
            </Field>

            <Field data-invalid={fieldStatus.category === "invalid" || undefined}>
              <FieldLabel htmlFor="category">Categoria</FieldLabel>
              <Select
                value={category}
                onValueChange={(value) => {
                  setCategory(value);
                  handleValidateField("category", value);
                }}
                required
              >
                <SelectTrigger className={cn("h-11 bg-background", borderClass(fieldStatus.category))}>
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
              {fieldErrors.category ? (
                <FieldError>{fieldErrors.category}</FieldError>
              ) : (
                <FieldDescription>Selecione uma categoria</FieldDescription>
              )}
            </Field>
          </div>

          <div className={cn(
            "rounded-xl border p-5 transition-colors",
            isAffiliateEnabled 
              ? "border-primary/30 bg-primary/5" 
              : "border-border/60 bg-muted/20"
          )}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">Programa de Afiliados</h3>
                  {isAffiliateEnabled && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                      Ativado
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Permita que outras pessoas vendam este produto em troca de uma comissão.
                </p>
              </div>
              <Switch
                checked={isAffiliateEnabled}
                onCheckedChange={handleAffiliateToggle}
              />
            </div>

            {isAffiliateEnabled && (
              <Field
                className="border-t border-border/40 pt-4"
                data-invalid={fieldStatus.affiliateCommissionPercent === "invalid" || undefined}
              >
                <FieldLabel htmlFor="commission">Comissão do Afiliado (%)</FieldLabel>
                <Input
                  id="commission"
                  type="number"
                  min={0}
                  max={50}
                  value={commissionPercent}
                  onChange={(e) => handleCommissionChange(e.target.value)}
                  onBlur={() => validateField("affiliateCommissionPercent", commissionPercent)}
                  className={cn("h-11 max-w-xs bg-background", borderClass(fieldStatus.affiliateCommissionPercent))}
                  required={isAffiliateEnabled}
                />
                {fieldErrors.affiliateCommissionPercent ? (
                  <FieldError>{fieldErrors.affiliateCommissionPercent}</FieldError>
                ) : (
                  <FieldDescription>Comissão entre 1% e 50%</FieldDescription>
                )}
              </Field>
            )}
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
            disabled={isSaving || hasErrors}
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
