/**
 * Predefined product categories for the marketplace.
 * Used in: create-product form, product-edit-form, marketplace filters.
 */
export const PRODUCT_CATEGORIES = [
  { value: 'curso', label: 'Curso' },
  { value: 'guia', label: 'Guia' },
  { value: 'template', label: 'Template' },
  { value: 'ebook', label: 'E-book' },
  { value: 'planilha', label: 'Planilha' },
  { value: 'checklist', label: 'Checklist' },
  { value: 'plugin', label: 'Plugin' },
  { value: 'outro', label: 'Outro' },
] as const

export type ProductCategory = typeof PRODUCT_CATEGORIES[number]['value']
