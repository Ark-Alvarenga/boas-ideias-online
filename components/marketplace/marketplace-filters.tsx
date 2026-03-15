"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const categories = [
  { value: "todos", label: "Todas as categorias" },
  { value: "cursos", label: "Cursos em PDF" },
  { value: "guias", label: "Guias" },
  { value: "templates", label: "Templates" },
  { value: "prompts", label: "Pacotes de Prompts" },
  { value: "toolkits", label: "Toolkits" },
]

const sortOptions = [
  { value: "relevancia", label: "Mais relevantes" },
  { value: "recentes", label: "Mais recentes" },
  { value: "preco-menor", label: "Menor preço" },
  { value: "preco-maior", label: "Maior preço" },
  { value: "populares", label: "Mais populares" },
]

interface MarketplaceFiltersProps {
  onSearch?: (query: string) => void
  onCategoryChange?: (category: string) => void
  onSortChange?: (sort: string) => void
}

export function MarketplaceFilters({ 
  onSearch,
  onCategoryChange,
  onSortChange 
}: MarketplaceFiltersProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative max-w-none flex-1 sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos..."
          className="h-10 border-border/50 bg-background pl-10 shadow-sm"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select defaultValue="todos" onValueChange={onCategoryChange}>
          <SelectTrigger className="h-10 w-full border-border/50 bg-background shadow-sm sm:w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue="relevancia" onValueChange={onSortChange}>
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
      </div>
    </div>
  )
}
