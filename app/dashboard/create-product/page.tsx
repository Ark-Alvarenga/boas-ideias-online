 "use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PRODUCT_CATEGORIES } from "@/lib/categories"
import { productCreateSchema } from "@/lib/schema"
import { useFormValidation, type FieldStatus } from "@/hooks/use-form-validation"
import { Loader2, UploadCloud } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface MeResponse {
  authenticated: boolean
  user?: {
    id: string
    name: string
    email: string
  }
}

/** Returns border class based on field validation status */
function borderClass(status: FieldStatus | undefined): string {
  if (status === "invalid") return "border-red-500 focus-visible:ring-red-500/30"
  if (status === "valid") return "border-green-500 focus-visible:ring-green-500/30"
  return "border-border/50"
}

export default function CreateProductPage() {
  const router = useRouter()

  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
  })

  const {
    fieldErrors,
    fieldStatus,
    validateField,
    validateAll,
    setServerErrors,
    hasErrors,
  } = useFormValidation<{
    title: string
    description: string
    priceCents: number
    category: string
    pdfUrl?: string
    coverImage?: string
  }>(productCreateSchema)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        if (!res.ok) {
          router.push(`/login?next=${encodeURIComponent("/dashboard/create-product")}`)
          return
        }
        const json = (await res.json()) as MeResponse
        if (!json.authenticated) {
          router.push(`/login?next=${encodeURIComponent("/dashboard/create-product")}`)
          return
        }
      } catch {
        router.push(`/login?next=${encodeURIComponent("/dashboard/create-product")}`)
        return
      } finally {
        setIsCheckingAuth(false)
      }
    }

    void checkAuth()
  }, [router])

  const handleChange = useCallback(
    (field: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))

      // Validate using Zod schema (single source of truth)
      if (field === "price") {
        const cents = value ? Math.round(Number(value) * 100) : undefined
        validateField("priceCents", cents)
      } else {
        validateField(field as "title" | "description" | "category", value)
      }
    },
    [validateField],
  )

  const handleBlur = useCallback(
    (field: keyof typeof formData) => {
      const value = formData[field]
      if (field === "price") {
        const cents = value ? Math.round(Number(value) * 100) : undefined
        validateField("priceCents", cents)
      } else {
        validateField(field as "title" | "description" | "category", value)
      }
    },
    [formData, validateField],
  )

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      setError("Apenas arquivos PDF são permitidos.")
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("Tamanho máximo do arquivo é 50MB.")
      return
    }

    setError(null)
    setPdfFile(file)
    setPdfUrl(null)
    setUploadProgress(0)
  }

  const handleCoverFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "image/png") {
      setError("A imagem de capa deve ser um arquivo PNG.")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Tamanho máximo da capa é 10MB.")
      return
    }

    setError(null)
    setCoverFile(file)
    // Show a local preview immediately
    const objectUrl = URL.createObjectURL(file)
    setCoverUrl(objectUrl)
  }

  const handleUpload = async () => {
    if (!pdfFile) {
      setError("Selecione um arquivo PDF antes de enviar.")
      return
    }

    setIsUploading(true)
    setUploadProgress(10)
    setError(null)

    try {
      // Step 1: Get the presigned URL
      const urlParams = new URLSearchParams({
        filename: pdfFile.name,
        contentType: pdfFile.type,
        size: pdfFile.size.toString(),
      })

      const presignRes = await fetch(`/api/upload-url?${urlParams.toString()}`)
      const presignData = await presignRes.json()

      if (!presignRes.ok || !presignData.success) {
        const message = presignData.error || "Falha ao obter URL de upload."
        setError(message)
        toast({
          title: "Erro de Servidor",
          description: message,
          variant: "destructive",
        })
        setIsUploading(false)
        return
      }

      setUploadProgress(30)
      const { url, publicUrl } = presignData

      // Step 2: Upload directly to S3 via the presigned URL
      // We use XMLHttpRequest here to be able to track upload progress accurately
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            // progress from 30% to 100%
            const percentComplete = 30 + Math.round((event.loaded / event.total) * 70)
            setUploadProgress(percentComplete)
          }
        })

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`S3 upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener("error", () => reject(new Error("Network error during S3 upload")))
        xhr.addEventListener("abort", () => reject(new Error("Upload aborted")))

        xhr.open("PUT", url, true)
        xhr.setRequestHeader("Content-Type", pdfFile.type)
        xhr.send(pdfFile)
      })

      setUploadProgress(100)
      setPdfUrl(publicUrl)
      toast({
        title: "PDF enviado com sucesso",
        description: "Seu arquivo já pode ser vendido no marketplace.",
      })
    } catch (err) {
      console.error("Upload error", err)
      const message = "Ocorreu um erro ao enviar o arquivo."
      setError(message)
      toast({
        title: "Não foi possível enviar o PDF",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleCoverUpload = async () => {
    if (!coverFile) {
      setError("Selecione uma imagem PNG antes de enviar a capa.")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", coverFile)

      const res = await fetch("/api/upload/cover", {
        method: "POST",
        body: formData,
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        const message = json.error || "Falha ao enviar capa."
        setError(message)
        toast({
          title: "Não foi possível enviar a capa",
          description: message,
          variant: "destructive",
        })
        setIsUploading(false)
        return
      }

      setCoverUrl(json.url as string)
      toast({
        title: "Capa enviada com sucesso",
        description: "Sua capa já será usada na listagem do marketplace.",
      })
    } catch (err) {
      console.error("Cover upload error", err)
      const message = "Ocorreu um erro ao enviar a capa."
      setError(message)
      toast({
        title: "Não foi possível enviar a capa",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Check if form can be submitted
  const isFormIncomplete =
    !formData.title ||
    !formData.description ||
    !formData.price ||
    !formData.category ||
    !pdfUrl

  const canSubmit = !isFormIncomplete && !hasErrors && !isSaving

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!pdfUrl) {
      setError("Envie o PDF antes de salvar o produto.")
      return
    }

    // Full validation using Zod schema
    const priceCents = Math.round(Number(formData.price) * 100)
    const dataToValidate = {
      title: formData.title,
      description: formData.description,
      priceCents,
      category: formData.category,
      pdfUrl,
      coverImage: coverUrl ?? undefined,
    }

    const isValid = validateAll(dataToValidate)
    if (!isValid) {
      toast({
        title: "Corrija os erros antes de continuar",
        description: "Verifique os campos destacados em vermelho.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // If there is a cover file selected but it was not uploaded yet (no remote URL),
      // upload it automatically before creating the product.
      let finalCoverUrl = coverUrl
      if (coverFile && (!finalCoverUrl || !finalCoverUrl.startsWith("http"))) {
        const formData = new FormData()
        formData.append("file", coverFile)

        const resCover = await fetch("/api/upload/cover", {
          method: "POST",
          body: formData,
        })

        const jsonCover = await resCover.json()

        if (!resCover.ok || !jsonCover.success) {
          setError(jsonCover.error || "Falha ao enviar capa.")
          setIsSaving(false)
          return
        }

        finalCoverUrl = jsonCover.url as string
        setCoverUrl(finalCoverUrl)
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
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        // Map server errors to fields
        if (json.details && Array.isArray(json.details)) {
          setServerErrors(json.details)
          toast({
            title: "Corrija os erros antes de continuar",
            description: "O servidor retornou erros de validação.",
            variant: "destructive",
          })
        } else {
          const message = json.error || "Não foi possível criar o produto."
          setError(message)
          toast({
            title: "Não foi possível criar o produto",
            description: message,
            variant: "destructive",
          })
        }
        return
      }

      toast({
        title: "Produto criado com sucesso",
        description: "Agora você pode gerenciar e publicar seu produto no painel.",
      })
      router.push("/dashboard/products")
    } catch (err) {
      console.error("Create product error", err)
      const message = "Ocorreu um erro ao salvar o produto."
      setError(message)
      toast({
        title: "Não foi possível criar o produto",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-10 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Criar novo produto</CardTitle>
              <CardDescription>
                Envie um PDF, defina o preço e publique seu produto digital.
                Se sua conta Stripe não estiver conectada, o produto será salvo como rascunho até você concluir o onboarding.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr,1.5fr] lg:gap-10">
                <div>
                  <FieldGroup>
                    <Field data-invalid={fieldStatus.title === "invalid" || undefined}>
                      <FieldLabel htmlFor="title">Título</FieldLabel>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        onBlur={() => handleBlur("title")}
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
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        onBlur={() => handleBlur("description")}
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
                          value={formData.price}
                          onChange={(e) => handleChange("price", e.target.value)}
                          onBlur={() => handleBlur("price")}
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
                          value={formData.category}
                          onValueChange={(value) => handleChange("category", value)}
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
                  </FieldGroup>

                  {error && (
                    <p className="mt-4 text-sm text-red-500">
                      {error}
                    </p>
                  )}

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      className="h-11"
                    >
                      {isSaving ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Salvando...
                        </span>
                      ) : (
                        "Publicar produto"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11"
                      onClick={() => router.push("/dashboard/products")}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <Card className="border-border/50 bg-muted/40">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Arquivo PDF
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Tamanho máximo: 50MB. Apenas arquivos PDF são aceitos.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-background py-8 text-center transition-colors hover:border-primary/50 hover:bg-accent/50">
                        <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">Clique para selecionar</p>
                        <p className="text-xs text-muted-foreground">ou arraste o arquivo até aqui</p>
                        <Input
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                      </div>

                      {pdfFile && (
                        <div className="rounded-md border border-dashed border-border/60 bg-background p-3 text-xs text-muted-foreground">
                          <p className="font-medium text-foreground">
                            {pdfFile.name}
                          </p>
                          <p>
                            {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      )}

                      <Button
                        type="button"
                        onClick={handleUpload}
                        disabled={!pdfFile || isUploading}
                        className="h-10 w-full"
                      >
                        {isUploading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Enviando...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <UploadCloud className="h-4 w-4" />
                            Enviar PDF
                          </span>
                        )}
                      </Button>

                      {uploadProgress > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progresso do upload</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-muted/40">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Imagem de capa (PNG)
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Envie uma imagem PNG para ser usada como capa do produto.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-background py-8 text-center transition-colors hover:border-primary/50 hover:bg-accent/50">
                        <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">Clique para selecionar</p>
                        <p className="text-xs text-muted-foreground">ou arraste a Imagem até aqui</p>
                        <Input
                          type="file"
                          accept="image/png"
                          onChange={handleCoverFileChange}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                      </div>

                      {coverFile && (
                        <div className="rounded-md border border-dashed border-border/60 bg-background p-3 text-xs text-muted-foreground">
                          <p className="font-medium text-foreground">
                            {coverFile.name}
                          </p>
                          <p>
                            {(coverFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      )}

                      <Button
                        type="button"
                        onClick={handleCoverUpload}
                        disabled={!coverFile || isUploading}
                        className="h-10 w-full"
                      >
                        {isUploading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Enviando capa...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <UploadCloud className="h-4 w-4" />
                            Enviar capa
                          </span>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/80">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Pré-visualização
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Assim seu produto aparecerá no marketplace.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="mb-3 overflow-hidden rounded-md border border-border/40 bg-muted/60">
                        <div className="aspect-[4/3] w-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                          {coverUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={coverUrl}
                              alt="Pré-visualização da capa"
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                      </div>

                      <p className="font-semibold text-foreground">
                        {formData.title || "Título do produto"}
                      </p>
                      <p className="line-clamp-3 text-xs text-muted-foreground">
                        {formData.description ||
                          "A descrição do seu produto aparecerá aqui."}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {formData.price
                          ? `R$${Number(formData.price).toFixed(2)}`
                          : "Defina um preço"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Categoria:{" "}
                        {formData.category || "Defina uma categoria"}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Arquivo:{" "}
                        {pdfUrl
                          ? "PDF enviado e pronto para venda."
                          : "Envie um PDF para concluir a criação do produto."}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
