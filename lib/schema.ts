import { z } from 'zod'

export const userRegisterSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})

export const userLoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
})

export const productCreateSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres").max(200),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres").max(5000),
  priceCents: z.number().int("O preço deve ser um número inteiro").nonnegative("O preço não pode ser negativo"),
  category: z.string().min(1, "A categoria é obrigatória").max(100),
  coverImage: z.string().url("URL da imagem inválida").optional().or(z.literal('')),
  pdfUrl: z.string().url("URL do PDF inválida").optional().or(z.literal('')),
  features: z.array(z.string().trim().min(1)).max(20).optional(),
})

export const productUpdateSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres").max(200, "O título deve ter no máximo 200 caracteres").optional(),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres").max(5000, "A descrição deve ter no máximo 5000 caracteres").optional(),
  priceCents: z.number().int("O preço deve ser um número inteiro").nonnegative("O preço não pode ser negativo").optional(),
  category: z.string().min(1, "A categoria é obrigatória").max(100).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  coverImage: z.string().url("URL da imagem inválida").optional().or(z.literal('')),
  pdfUrl: z.string().url("URL do PDF inválida").optional().or(z.literal('')),
  features: z.array(z.string().trim().min(1)).max(20).optional(),
  featured: z.boolean().optional(),
  affiliateEnabled: z.boolean().optional(),
  affiliateCommissionPercent: z.number().min(0, "A comissão não pode ser negativa").max(50, "A comissão máxima é 50%").optional(),
}).strict()

export const checkoutSchema = z.object({
  productId: z.string().min(1, "ID do produto inválido"),
  buyerName: z.string().optional(),
  buyerEmail: z.string().email("E-mail inválido").optional().or(z.literal('')),
})

export const affiliateJoinSchema = z.object({
  productId: z.string().min(1, "ID do produto inválido"),
})
