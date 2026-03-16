"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PRODUCT_CATEGORIES } from "@/lib/categories"
import { Loader2, UploadCloud } from "lucide-react"

interface MeResponse {
  authenticated: boolean
  user?: {
    id: string
    name: string
    email: string
  }
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

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

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
      const formData = new FormData()
      formData.append("file", pdfFile)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        setError(json.error || "Falha ao enviar arquivo.")
        setIsUploading(false)
        return
      }

      setUploadProgress(100)
      setPdfUrl(json.url as string)
    } catch (err) {
      console.error("Upload error", err)
      setError("Ocorreu um erro ao enviar o arquivo.")
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
        setError(json.error || "Falha ao enviar capa.")
        setIsUploading(false)
        return
      }

      setCoverUrl(json.url as string)
    } catch (err) {
      console.error("Cover upload error", err)
      setError("Ocorreu um erro ao enviar a capa.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!pdfUrl) {
      setError("Envie o PDF antes de salvar o produto.")
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
        setError(json.error || "Não foi possível criar o produto.")
        return
      }

      router.push("/dashboard/products")
    } catch (err) {
      console.error("Create product error", err)
      setError("Ocorreu um erro ao salvar o produto.")
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
                    <Field>
                      <FieldLabel htmlFor="title">Título</FieldLabel>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        className="h-11 border-border/50 bg-background"
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="description">Descrição</FieldLabel>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
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
                          value={formData.price}
                          onChange={(e) => handleChange("price", e.target.value)}
                          className="h-11 border-border/50 bg-background"
                          required
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="category">Categoria</FieldLabel>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleChange("category", value)}
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

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button
                      type="submit"
                      disabled={isSaving || !pdfUrl}
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
                      <Input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                      />

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
                      <Input
                        type="file"
                        accept="image/png"
                        onChange={handleCoverFileChange}
                      />

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

