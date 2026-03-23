"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { productCreateSchema } from "@/lib/schema";
import {
  useFormValidation,
  type FieldStatus,
} from "@/hooks/use-form-validation";
import { ArrowUpRight, Loader2, UploadCloud } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

interface MeResponse {
  authenticated: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

/** Returns border class based on field validation status */
function borderClass(status: FieldStatus | undefined): string {
  if (status === "invalid") return "border-red-500 ring-2 ring-red-500/20";
  if (status === "valid")
    return "border-emerald-500 ring-2 ring-emerald-500/20";
  return "border-foreground";
}

export default function CreateProductPage() {
  const router = useRouter();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
  });

  const {
    fieldErrors,
    fieldStatus,
    validateField,
    validateAll,
    setServerErrors,
    hasErrors,
  } = useFormValidation<{
    title: string;
    description: string;
    priceCents: number;
    category: string;
    pdfUrl?: string;
    coverImage?: string;
  }>(productCreateSchema);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          router.push(
            `/login?next=${encodeURIComponent("/dashboard/create-product")}`,
          );
          return;
        }
        const json = (await res.json()) as MeResponse;
        if (!json.authenticated) {
          router.push(
            `/login?next=${encodeURIComponent("/dashboard/create-product")}`,
          );
          return;
        }
      } catch {
        router.push(
          `/login?next=${encodeURIComponent("/dashboard/create-product")}`,
        );
        return;
      } finally {
        setIsCheckingAuth(false);
      }
    };

    void checkAuth();
  }, [router]);

  const handleChange = useCallback(
    (field: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Validate using Zod schema (single source of truth)
      if (field === "price") {
        const cents = value ? Math.round(Number(value) * 100) : undefined;
        validateField("priceCents", cents);
      } else {
        validateField(field as "title" | "description" | "category", value);
      }
    },
    [validateField],
  );

  const handleBlur = useCallback(
    (field: keyof typeof formData) => {
      const value = formData[field];
      if (field === "price") {
        const cents = value ? Math.round(Number(value) * 100) : undefined;
        validateField("priceCents", cents);
      } else {
        validateField(field as "title" | "description" | "category", value);
      }
    },
    [formData, validateField],
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Apenas arquivos PDF são permitidos.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("Tamanho máximo do arquivo é 50MB.");
      return;
    }

    setError(null);
    setPdfFile(file);
    setPdfUrl(null);
    setUploadProgress(0);
  };

  const handleCoverFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("A imagem de capa deve ser PNG, JPG ou WEBP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Tamanho máximo da capa é 10MB.");
      return;
    }

    setError(null);
    setCoverFile(file);
    // Show a local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setCoverUrl(objectUrl);
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      setError("Selecione um arquivo PDF antes de enviar.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setError(null);

    try {
      // Step 1: Get the presigned URL
      const urlParams = new URLSearchParams({
        filename: pdfFile.name,
        contentType: pdfFile.type,
        size: pdfFile.size.toString(),
      });

      const presignRes = await fetch(`/api/upload-url?${urlParams.toString()}`);
      const presignData = await presignRes.json();

      if (!presignRes.ok || !presignData.success) {
        const message = presignData.error || "Falha ao obter URL de upload.";
        setError(message);
        toast({
          title: "Erro de Servidor",
          description: message,
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      setUploadProgress(30);
      const { url, publicUrl } = presignData;

      // Step 2: Upload directly to S3 via the presigned URL
      // We use XMLHttpRequest here to be able to track upload progress accurately
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            // progress from 30% to 100%
            const percentComplete =
              30 + Math.round((event.loaded / event.total) * 70);
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`S3 upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () =>
          reject(new Error("Network error during S3 upload")),
        );
        xhr.addEventListener("abort", () =>
          reject(new Error("Upload aborted")),
        );

        xhr.open("PUT", url, true);
        xhr.setRequestHeader("Content-Type", pdfFile.type);
        xhr.send(pdfFile);
      });

      setUploadProgress(100);
      setPdfUrl(publicUrl);
      toast({
        title: "PDF enviado com sucesso",
        description: "Seu arquivo já pode ser vendido no marketplace.",
        variant: "success",
      });
    } catch (err) {
      console.error("Upload error", err);
      const message = "Ocorreu um erro ao enviar o arquivo.";
      setError(message);
      toast({
        title: "Não foi possível enviar o PDF",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCoverUpload = async () => {
    if (!coverFile) {
      setError(
        "Selecione uma imagem (PNG, JPG ou WEBP) antes de enviar a capa.",
      );
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", coverFile);

      const res = await fetch("/api/upload/cover", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const message = json.error || "Falha ao enviar capa.";
        setError(message);
        toast({
          title: "Não foi possível enviar a capa",
          description: message,
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      setCoverUrl(json.url as string);
      toast({
        title: "Capa enviada com sucesso",
        description: "Sua capa já será usada na listagem do marketplace.",
        variant: "success",
      });
    } catch (err) {
      console.error("Cover upload error", err);
      const message = "Ocorreu um erro ao enviar a capa.";
      setError(message);
      toast({
        title: "Não foi possível enviar a capa",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Check if form can be submitted
  const isFormIncomplete =
    !formData.title ||
    !formData.description ||
    !formData.price ||
    !formData.category ||
    !pdfUrl;

  const canSubmit = !isFormIncomplete && !hasErrors && !isSaving;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!pdfUrl) {
      setError("Envie o PDF antes de salvar o produto.");
      return;
    }

    // Full validation using Zod schema
    const priceCents = Math.round(Number(formData.price) * 100);
    const dataToValidate = {
      title: formData.title,
      description: formData.description,
      priceCents,
      category: formData.category,
      pdfUrl,
      coverImage: coverUrl ?? undefined,
    };

    const isValid = validateAll(dataToValidate);
    if (!isValid) {
      toast({
        title: "Corrija os erros antes de continuar",
        description: "Verifique os campos destacados em vermelho.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // If there is a cover file selected but it was not uploaded yet (no remote URL),
      // upload it automatically before creating the product.
      let finalCoverUrl = coverUrl;
      if (coverFile && (!finalCoverUrl || !finalCoverUrl.startsWith("http"))) {
        const formData = new FormData();
        formData.append("file", coverFile);

        const resCover = await fetch("/api/upload/cover", {
          method: "POST",
          body: formData,
        });

        const jsonCover = await resCover.json();

        if (!resCover.ok || !jsonCover.success) {
          setError(jsonCover.error || "Falha ao enviar capa.");
          setIsSaving(false);
          return;
        }

        finalCoverUrl = jsonCover.url as string;
        setCoverUrl(finalCoverUrl);
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: Number(formData.price),
          category: formData.category,
          pdfUrl,
          coverImage: finalCoverUrl ?? undefined,
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
          const message = json.error || "Não foi possível criar o produto.";
          setError(message);
          toast({
            title: "Não foi possível criar o produto",
            description: message,
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Produto criado com sucesso",
        description:
          "Agora você pode gerenciar e publicar seu produto no painel.",
        variant: "success",
      });
      router.push("/dashboard/products");
    } catch (err) {
      console.error("Create product error", err);
      const message = "Ocorreu um erro ao salvar o produto.";
      setError(message);
      toast({
        title: "Não foi possível criar o produto",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader
        title="Criar Produto"
        actions={
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-foreground font-bold shadow-[2px_2px_0px_#000]"
            asChild
          >
            <Link href="/dashboard/products">Meus Produtos</Link>
          </Button>
        }
      />

      <main className="mx-auto max-w-5xl p-6 lg:p-8">
        <Card className="overflow-hidden rounded-3xl border-2 border-foreground bg-card shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]">
          <CardHeader className="border-b-2 border-foreground bg-muted/50 p-6 lg:p-8">
            <CardTitle className="font-serif text-3xl font-black text-foreground">
              Dados do Produto
            </CardTitle>
            <CardDescription className="text-base font-bold text-muted-foreground">
              Preencha os dados e suba seu arquivo PDF. Seu checkout estará
              pronto em segundos.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 lg:p-10">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr,1.3fr] lg:gap-12"
            >
              <div>
                <FieldGroup>
                  <Field
                    data-invalid={fieldStatus.title === "invalid" || undefined}
                  >
                    <FieldLabel className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                      Título do Produto
                    </FieldLabel>
                    <Input
                      id="title"
                      placeholder="Ex: Guia de React Avançado"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      onBlur={() => handleBlur("title")}
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
                      <FieldDescription className="font-medium text-muted-foreground">
                        Como seu produto vai se chamar no marketplace
                      </FieldDescription>
                    )}
                  </Field>

                  <Field
                    data-invalid={
                      fieldStatus.description === "invalid" || undefined
                    }
                  >
                    <FieldLabel className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                      Descrição (O que o cliente ganha?)
                    </FieldLabel>
                    <Textarea
                      id="description"
                      placeholder="Descreva os benefícios e o que está incluso no PDF..."
                      value={formData.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      onBlur={() => handleBlur("description")}
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
                      <FieldDescription className="font-medium text-muted-foreground">
                        Explique como seu produto ajuda seu cliente
                      </FieldDescription>
                    )}
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      data-invalid={
                        fieldStatus.priceCents === "invalid" || undefined
                      }
                    >
                      <FieldLabel className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                        Preço (R$)
                      </FieldLabel>
                      <Input
                        id="price"
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="29.90"
                        value={formData.price}
                        onChange={(e) => handleChange("price", e.target.value)}
                        onBlur={() => handleBlur("price")}
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
                        <FieldDescription className="font-medium text-muted-foreground">
                          Valor sugerido: R$ 29 - R$ 97
                        </FieldDescription>
                      )}
                    </Field>

                    <Field
                      data-invalid={
                        fieldStatus.category === "invalid" || undefined
                      }
                    >
                      <FieldLabel className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                        Categoria
                      </FieldLabel>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleChange("category", value)
                        }
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
                        <FieldDescription className="font-medium text-muted-foreground">
                          Organize no marketplace
                        </FieldDescription>
                      )}
                    </Field>
                  </div>
                </FieldGroup>

                {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

                <div className="mt-10 flex flex-wrap gap-4">
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="h-14 flex-1 rounded-xl border-2 border-foreground bg-accent px-8 text-lg font-black uppercase tracking-widest text-foreground shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] disabled:bg-muted disabled:shadow-none hover:bg-accent/70"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        SALVANDO...
                      </span>
                    ) : (
                      "CRIAR PRODUTO AGORA 🟢"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 rounded-xl border-2 border-foreground bg-background px-8 text-lg font-black te uppercase tracking-widest shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000]"
                    onClick={() => router.push("/dashboard/products")}
                  >
                    CANCELAR
                  </Button>
                </div>
              </div>

              <div className="space-y-8">
                <Card className="rounded-2xl border-2 border-foreground bg-muted/30 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
                  <CardHeader className="pb-4 border-b-2 border-foreground/10 bg-muted/20">
                    <CardTitle className="font-serif text-lg font-black uppercase tracking-tight">
                      Arquivo (PDF)
                    </CardTitle>
                    <CardDescription className="font-bold text-muted-foreground">
                      O material que seu cliente recebe. (Até 50MB)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-foreground bg-background py-10 text-center transition-all hover:bg-muted/50">
                      <div className="mb-4 rounded-full border-2 border-foreground bg-accent p-3 shadow-[2px_2px_0px_#000]">
                        <UploadCloud className="h-6 w-6 text-foreground" />
                      </div>
                      <p className="text-base font-black uppercase tracking-widest text-foreground">
                        ENVIAR PDF ✨
                      </p>
                      <p className="mt-1 text-xs font-bold text-muted-foreground uppercase">
                        ou arraste para cá
                      </p>
                      <Input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </div>

                    {pdfFile && (
                      <div className="rounded-xl border-2 border-foreground bg-background p-4 shadow-[2px_2px_0px_#000]">
                        <p className="font-black text-foreground truncate">
                          {pdfFile.name}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground uppercase">
                          {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    )}

                    <Button
                      type="button"
                      onClick={handleUpload}
                      disabled={!pdfFile || isUploading}
                      className="h-12 w-full rounded-xl border-2 border-foreground bg-foreground font-black text-background transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] dark:bg-background dark:text-foreground dark:hover:shadow-[4px_4px_0px_#fff]"
                    >
                      {isUploading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          ENVIANDO...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <UploadCloud className="h-5 w-5" />
                          SUBIR ARQUIVO
                        </span>
                      )}
                    </Button>

                    {uploadProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span>UPLOAD</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full border-2 border-foreground bg-muted">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-2 border-foreground bg-muted/30 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
                  <CardHeader className="pb-4 border-b-2 border-foreground/10 bg-muted/20">
                    <CardTitle className="font-serif text-lg font-black uppercase tracking-tight">
                      Capa (PNG, JPG, WEBP)
                    </CardTitle>
                    <CardDescription className="font-bold text-muted-foreground">
                      Imagem de destaque (Recomendado: 800x800px).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-foreground bg-background py-10 text-center transition-all hover:bg-muted/50">
                      <div className="mb-4 rounded-full border-2 border-foreground bg-secondary p-3 shadow-[2px_2px_0px_#000]">
                        <UploadCloud className="h-6 w-6 text-foreground" />
                      </div>
                      <p className="text-base font-black uppercase tracking-widest text-foreground">
                        CAPA ✨
                      </p>
                      <p className="mt-1 text-xs font-bold text-muted-foreground uppercase">
                        PNG apenas
                      </p>
                      <Input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleCoverFileChange}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </div>

                    {coverFile && (
                      <div className="rounded-xl border-2 border-foreground bg-background p-4 shadow-[2px_2px_0px_#000]">
                        <p className="font-black text-foreground truncate">
                          {coverFile.name}
                        </p>
                      </div>
                    )}

                    <Button
                      type="button"
                      onClick={handleCoverUpload}
                      disabled={!coverFile || isUploading}
                      className="h-12 w-full rounded-xl border-2 border-foreground bg-foreground font-black text-background transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] dark:bg-background dark:text-foreground dark:hover:shadow-[4px_4px_0px_#fff]"
                    >
                      {isUploading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          ENVIANDO...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <UploadCloud className="h-5 w-5" />
                          SUBIR CAPA
                        </span>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-2xl border-2 border-foreground bg-card shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
                  <CardHeader className="pb-4 border-b-2 border-foreground/10 bg-muted/20">
                    <CardTitle className="font-serif text-lg font-black uppercase tracking-tight">
                      Pré-visualização
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="aspect-[4/3] w-full border-b-2 border-foreground bg-muted">
                      {coverUrl && (
                        <Image
                          src={coverUrl}
                          alt="Capa"
                          fill
                          className="object-cover"
                          unoptimized={coverUrl.startsWith("blob:")}
                          sizes="400px"
                        />
                      )}
                    </div>
                    <div className="p-6 space-y-3">
                      <p className="font-serif text-xl font-black text-foreground">
                        {formData.title || "TÍTULO DO PRODUTO"}
                      </p>
                      <div className="text-2xl font-black text-primary">
                        {formData.price
                          ? `R$ ${Number(formData.price).toFixed(2)}`
                          : "---"}
                      </div>
                      <div className="flex flex-col gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <div>
                          CATEGORIA:{" "}
                          <span className="text-foreground">
                            {formData.category || "---"}
                          </span>
                        </div>
                        <div>
                          STATUS:{" "}
                          <span className="text-foreground">
                            {pdfUrl ? "ENVIADO" : "PENDENTE"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
