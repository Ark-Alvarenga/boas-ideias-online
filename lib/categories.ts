/**
 * Predefined product categories for the marketplace.
 * Converted to Gumroad-inspired beginner-friendly categories.
 */
export const PRODUCT_CATEGORIES = [
  { value: 'ideias-simples', label: 'Ideias simples' },
  { value: 'do-zero', label: 'Começando do zero' },
  { value: 'primeiras-vendas', label: 'Primeiras vendas fáceis' },
  { value: 'modelos', label: 'Modelos rápidos' },
] as const

export type ProductCategory = typeof PRODUCT_CATEGORIES[number]['value']
