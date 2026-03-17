"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PRODUCT_CATEGORIES } from "@/lib/categories"

const sortOptions = [
  { value: "relevancia", label: "Mais relevantes" },
  { value: "recentes", label: "Mais recentes" },
  { value: "preco-menor", label: "Menor preço" },
  { value: "preco-maior", label: "Maior preço" },
  { value: "populares", label: "Mais populares" },
]

interface MarketplaceFiltersProps {
  initialQuery?: string
  initialCategory?: string
  initialSort?: string
  onSearch?: (query: string) => void
  onCategoryChange?: (category: string) => void
  onSortChange?: (sort: string) => void
  onClear?: () => void
}

export function MarketplaceFilters({ 
  initialQuery,
  initialCategory,
  initialSort,
  onSearch,
  onCategoryChange,
  onSortChange,
  onClear,
}: MarketplaceFiltersProps) {
  const [query, setQuery] = useState(initialQuery || "")
  const [category, setCategory] = useState(initialCategory || "todos")
  const [sort, setSort] = useState(initialSort || "relevancia")

  useEffect(() => {
    setQuery(initialQuery || "")
    setCategory(initialCategory || "todos")
    setSort(initialSort || "relevancia")
  }, [initialQuery, initialCategory, initialSort])

  const hasActiveFilters = useMemo(() => {
    return query.trim().length > 0 || category !== "todos" || sort !== "relevancia"
  }, [query, category, sort])

  const onSearchRef = useRef(onSearch)
  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (query !== (initialQuery || "")) {
        onSearchRef.current?.(query)
      }
    }, 300)
    return () => window.clearTimeout(handle)
  }, [query, initialQuery])

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative max-w-none flex-1 sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos..."
          value={query}
          className="h-10 border-border/50 bg-background pl-10 pr-10 shadow-sm"
          onChange={(e) => setQuery(e.target.value)}
        />
        {query.trim().length > 0 && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={category}
          onValueChange={(value) => {
            setCategory(value)
            onCategoryChange?.(value)
          }}
        >
          <SelectTrigger className="h-10 w-full border-border/50 bg-background shadow-sm sm:w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as categorias</SelectItem>
            {PRODUCT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(value) => {
            setSort(value)
            onSortChange?.(value)
          }}
        >
          <SelectTrigger className="h-10 w-full border-border/50 bg-background shadow-sm sm:w-[160px]">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full border-border/50 sm:w-auto"
            onClick={() => {
              setQuery("")
              setCategory("todos")
              setSort("relevancia")
              onSearch?.("")
              onCategoryChange?.("todos")
              onSortChange?.("relevancia")
              onClear?.()
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  )
}
