"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import { productUpdateSchema } from "@/lib/schema";
import {
  useFormValidation,
  type FieldStatus,
} from "@/hooks/use-form-validation";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  if (status === "invalid") return "border-red-500 ring-2 ring-red-500/20";
  if (status === "valid")
    return "border-emerald-500 ring-2 ring-emerald-500/20";
  return "border-foreground";
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
  const [status, setStatus] = useState<"active" | "draft" | "archived">(
    initialStatus,
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(featured);
  const [isAffiliateEnabled, setIsAffiliateEnabled] =
    useState<boolean>(affiliateEnabled);
  const [commissionPercent, setCommissionPercent] = useState<number>(
    affiliateCommissionPercent,
  );
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
        validateField(
          field as
            | "title"
            | "description"
            | "category"
            | "affiliateCommissionPercent",
          value,
        );
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
      if (!validateField("affiliateCommissionPercent", commissionPercent))
        hasClientErrors = true;
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
          affiliateCommissionPercent: isAffiliateEnabled
            ? commissionPercent
            : 0,
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
    if (
      !confirm(
        "Arquivar este produto? Ele sairá do marketplace mas continuará visível no seu painel.",
      )
    )
      return;
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
        "Excluir este produto permanentemente? Esta ação não pode ser desfeita. Produtos com vendas não podem ser excluídos.",
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
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr,1.2fr] lg:gap-10"
    >
      <div className="space-y-8">
        <div className="space-y-8">
          <Field data-invalid={fieldStatus.title === "invalid" || undefined}>
            <FieldLabel className="text-sm font-black uppercase tracking-widest text-muted-foreground">
              Título do Produto
            </FieldLabel>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                handleValidateField("title", e.target.value);
              }}
              onBlur={() => handleValidateField("title", title)}
              className={cn(
                "h-12 border-2 text-lg font-bold shadow-[2px_2px_0px_#000]",
                borderClass(fieldStatus.title),
              )}
              required
            />
            {fieldErrors.title ? (
              <FieldError className="font-bold text-red-500">
                {fieldErrors.title}
              </FieldError>
            ) : (
              <FieldDescription className="font-medium text-muted-foreground text-xs uppercase tracking-tight">
                Atraia clientes com um título claro
              </FieldDescription>
            )}
          </Field>

          <Field
            data-invalid={fieldStatus.description === "invalid" || undefined}
          >
            <FieldLabel className="text-sm font-black uppercase tracking-widest text-muted-foreground">
              Descrição (O que o cliente ganha?)
            </FieldLabel>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                handleValidateField("description", e.target.value);
              }}
              onBlur={() => handleValidateField("description", description)}
              className={cn(
                "min-h-40 border-2 text-base font-bold shadow-[2px_2px_0px_#000]",
                borderClass(fieldStatus.description),
              )}
              required
            />
            {fieldErrors.description ? (
              <FieldError className="font-bold text-red-500">
                {fieldErrors.description}
              </FieldError>
            ) : (
              <FieldDescription className="font-medium text-muted-foreground text-xs uppercase tracking-tight">
                Detalhamento completo do produto
              </FieldDescription>
            )}
          </Field>

          <div className="grid gap-8 sm:grid-cols-2">
            <Field
              data-invalid={fieldStatus.priceCents === "invalid" || undefined}
            >
              <FieldLabel className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                Preço (R$)
              </FieldLabel>
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
                className={cn(
                  "h-12 border-2 text-lg font-black shadow-[2px_2px_0px_#000]",
                  borderClass(fieldStatus.priceCents),
                )}
                required
              />
              {fieldErrors.priceCents ? (
                <FieldError className="font-bold text-red-500">
                  {fieldErrors.priceCents}
                </FieldError>
              ) : (
                <FieldDescription className="font-medium text-muted-foreground text-xs uppercase tracking-tight">
                  Valor justo pelo conteúdo
                </FieldDescription>
              )}
            </Field>

            <Field
              data-invalid={fieldStatus.category === "invalid" || undefined}
            >
              <FieldLabel className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                Categoria
              </FieldLabel>
              <Select
                value={category}
                onValueChange={(value) => {
                  setCategory(value);
                  handleValidateField("category", value);
                }}
                required
              >
                <SelectTrigger
                  className={cn(
                    "h-12 border-2 text-base font-bold shadow-[2px_2px_0px_#000]",
                    borderClass(fieldStatus.category),
                  )}
                >
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="border-2 border-foreground font-bold">
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.category ? (
                <FieldError className="font-bold text-red-500">
                  {fieldErrors.category}
                </FieldError>
              ) : (
                <FieldDescription className="font-medium text-muted-foreground text-xs uppercase tracking-tight">
                  Organização no marketplace
                </FieldDescription>
              )}
            </Field>
          </div>

          <div
            className={cn(
              "rounded-2xl border-2 p-6 transition-all shadow-[4px_4px_0px_#000]",
              isAffiliateEnabled
                ? "border-foreground bg-primary/10"
                : "border-foreground bg-muted/20",
            )}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-xl font-black text-foreground">
                    Programa de Afiliados
                  </h3>
                  {isAffiliateEnabled && (
                    <span className="rounded-full border-2 border-foreground bg-emerald-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-foreground shadow-[2px_2px_0px_#000]">
                      ATIVO ✨
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-muted-foreground">
                  Permita que outros vendam por você em troca de comissão.
                </p>
              </div>
              <Switch
                checked={isAffiliateEnabled}
                onCheckedChange={handleAffiliateToggle}
                className="data-[state=checked]:bg-primary border-2 border-foreground"
              />
            </div>

            {isAffiliateEnabled && (
              <Field
                className="border-t-2 border-foreground pt-6"
                data-invalid={
                  fieldStatus.affiliateCommissionPercent === "invalid" ||
                  undefined
                }
              >
                <FieldLabel className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                  Comissão do Afiliado (%)
                </FieldLabel>
                <div className="flex items-center gap-4">
                  <Input
                    id="commission"
                    type="number"
                    min={0}
                    max={50}
                    value={commissionPercent}
                    onChange={(e) => handleCommissionChange(e.target.value)}
                    onBlur={() =>
                      validateField(
                        "affiliateCommissionPercent",
                        commissionPercent,
                      )
                    }
                    className={cn(
                      "h-12 w-28 border-2 text-lg font-black shadow-[2px_2px_0px_#000]",
                      borderClass(fieldStatus.affiliateCommissionPercent),
                    )}
                    required={isAffiliateEnabled}
                  />
                  <div className="text-sm font-black text-foreground uppercase tracking-widest">
                    DE COMISSÃO
                  </div>
                </div>
                {fieldErrors.affiliateCommissionPercent ? (
                  <FieldError className="font-bold text-red-500">
                    {fieldErrors.affiliateCommissionPercent}
                  </FieldError>
                ) : (
                  <FieldDescription className="font-medium text-muted-foreground text-xs uppercase tracking-tight">
                    Comissão recomendada: 20% a 40%
                  </FieldDescription>
                )}
              </Field>
            )}
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm font-bold text-red-500 uppercase tracking-tight">
            ⚠️ {error}
          </p>
        )}
        {success && (
          <p className="mt-4 text-sm font-bold text-emerald-600 uppercase tracking-tight">
            ✅ {success}
          </p>
        )}

        <div className="mt-10 flex gap-4">
          <Button
            type="submit"
            disabled={isSaving || hasErrors}
            className="h-14 flex-1 rounded-xl border-2 border-foreground bg-primary px-8 text-lg font-black uppercase tracking-widest text-foreground shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] disabled:bg-muted disabled:shadow-none"
          >
            {isSaving ? (
              <span className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                SALVANDO...
              </span>
            ) : (
              "SALVAR ALTERAÇÕES 💾"
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <Card className="overflow-hidden rounded-2xl border-2 border-foreground bg-muted/30 shadow-[4px_4px_0px_#000]">
          <CardHeader className="border-b-2 border-foreground bg-muted/20 pb-4">
            <CardTitle className="font-serif text-lg font-black uppercase tracking-tight">
              Status & Métricas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Status Atual:
              </span>
              <span className="rounded-lg border-2 border-foreground bg-background px-2 py-0.5 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_#000]">
                {STATUS_LABELS[status] ?? status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Total de Vendas:
              </span>
              <span className="font-serif text-2xl font-black text-foreground">
                {sales}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Visualizações:
              </span>
              <span className="font-serif text-2xl font-black text-foreground">
                {views}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-2 border-foreground bg-background shadow-[4px_4px_0px_#000]">
          <CardHeader className="border-b-2 border-foreground bg-muted/20 pb-4">
            <CardTitle className="font-serif text-lg font-black uppercase tracking-tight">
              Gerenciar Visibilidade
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">
                  Destaque:
                </span>
                <span className="text-xs font-bold text-foreground">
                  {isFeatured ? "EM DESTAQUE 🌟" : "NÃO DESTACADO"}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFeatured((prev) => !prev)}
                className="h-8 border-2 border-foreground text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_#000] hover:bg-primary"
              >
                MODIFICAR
              </Button>
            </div>

            <div className="border-t-2 border-foreground/10 pt-4 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Ações de Publicação:
              </span>

              {status === "active" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-3 border-2 border-foreground font-black uppercase tracking-tight shadow-[2px_2px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000]"
                  onClick={handleArchive}
                  disabled={isStatusAction}
                >
                  {isStatusAction ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Archive className="h-4 w-4" />
                  )}
                  Arquivar Produto
                </Button>
              )}

              {(status === "archived" || status === "draft") && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="w-full justify-start gap-3 border-2 border-foreground bg-primary font-black uppercase tracking-tight shadow-[2px_2px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000]"
                  onClick={
                    status === "archived" ? handleRepublish : handlePublish
                  }
                  disabled={isStatusAction}
                >
                  {isStatusAction ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  {status === "archived"
                    ? "Republicar Agora"
                    : "Publicar Agora"}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start gap-3 border-2 border-red-500 bg-red-50 text-red-600 font-black uppercase tracking-tight shadow-[2px_2px_0px_#ef4444] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#ef4444] hover:bg-red-100"
                onClick={handleDelete}
                disabled={isStatusAction}
              >
                {isStatusAction ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Excluir Definitivamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
