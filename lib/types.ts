import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  name: string
  email: string
  passwordHash: string
  avatar?: string
  bio?: string
  stripeAccountId?: string
  stripeOnboardingComplete: boolean
  pendingBalanceCents: number
  totalEarningsCents: number
  payoutProcessing: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  _id?: ObjectId
  title: string
  description: string
  price?: number // Deprecated: legacy float
  priceCents: number // New: strict integer cents
  coverImage?: string
  pdfUrl?: string
  slug: string
  category: string
  creatorId: ObjectId
  creatorName: string
  features?: string[]
  featured?: boolean
  status: 'draft' | 'active' | 'archived'
  views: number
  sales: number
  rating: number
  reviewCount: number
  affiliateEnabled?: boolean
  affiliateCommissionPercent?: number
  createdAt: Date
  updatedAt: Date
}

export interface Affiliate {
  _id?: ObjectId
  userId: ObjectId
  productId: ObjectId
  commissionPercent: number
  createdAt: Date
}

export interface AffiliateClick {
  _id?: ObjectId
  affiliateId: ObjectId
  productId: ObjectId
  refUserId: ObjectId
  ip: string
  userAgent: string
  createdAt: Date
}

export interface AffiliateSale {
  _id?: ObjectId
  affiliateId: ObjectId
  productId: ObjectId
  orderId: ObjectId
  affiliateUserId: ObjectId
  creatorUserId: ObjectId
  saleAmount?: number // Deprecated
  commissionAmount?: number // Deprecated
  saleAmountCents: number
  commissionAmountCents: number
  createdAt: Date
}

export interface Order {
  _id?: ObjectId
  productId: ObjectId
  productTitle: string
  productPrice?: number // Deprecated
  productPriceCents: number
  userId: ObjectId
  buyerEmail: string
  buyerName: string
  status: 'pending' | 'paid' | 'refunded'
  createdAt: Date
  updatedAt: Date
  stripeSessionId?: string
  stripePaymentIntentId?: string
  saleId?: ObjectId
}

export type AffiliatePayoutStatus = 'not_applicable' | 'pending' | 'paid'

export interface Sale {
  _id?: ObjectId
  orderId: ObjectId
  productId: ObjectId
  buyerId: ObjectId
  creatorId: ObjectId
  affiliateUserId?: ObjectId

  // All amounts in integer CENTS (BRL centavos)
  totalAmountCents: number
  platformFeeCents: number
  affiliateShareCents: number
  creatorShareCents: number

  // Stripe references
  stripeSessionId: string
  stripePaymentIntentId: string
  stripeTransferIdCreator?: string
  stripeTransferIdAffiliate?: string

  // Status
  status: 'completed' | 'refunded' | 'partially_refunded'

  // Payout tracking
  creatorPayoutStatus: 'pending' | 'paid'
  affiliatePayoutStatus: AffiliatePayoutStatus
  affiliatePaidAt?: Date

  createdAt: Date
}

export interface UserTransaction {
  _id?: ObjectId
  userId: ObjectId
  amountCents: number
  type: 'sale' | 'affiliate_commission' | 'payout'
  status: 'pending' | 'paid'
  stripeTransferId?: string
  saleId?: string
  createdAt: Date
}

export interface ProcessedStripeEvent {
  _id?: ObjectId
  eventId: string
  createdAt: Date
}

export interface CreateProductInput {
  title: string
  description: string
  priceCents: number
  category: string
  coverImage?: string
  pdfUrl?: string
  features?: string[]
}

export interface CreateOrderInput {
  productId: string
  buyerEmail: string
  buyerName: string
}
