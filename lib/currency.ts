/**
 * Formata um valor em centavos (inteiro) para uma string de moeda BRL (ex: "49,90" ou "49.90").
 */
export function formatCentsToBRL(cents: number): string {
  if (isNaN(cents)) return "0,00"
  
  const formatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(Math.round(cents) / 100)
}

/**
 * Converte um valor float de forma segura para centavos inteiros.
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Utilitário de migração para segurança do banco de dados,
 * lida com documentos antigos do banco que podem possuir o preço em float (`price`).
 */
export function resolvePriceCents(doc: { priceCents?: number; price?: number }): number {
  if (typeof doc.priceCents === 'number') {
    return Math.round(doc.priceCents)
  }
  if (typeof doc.price === 'number') {
    return toCents(doc.price)
  }
  return 0
}
