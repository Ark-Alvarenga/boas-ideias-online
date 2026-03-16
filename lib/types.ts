import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  name: string
  email: string
  passwordHash: string
  avatar?: string
  bio?: string
  stripeAccountId?: string
  stripeOnboardingComplete?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  _id?: ObjectId
  title: string
  description: string
  price: number
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
  saleAmount: number
  commissionAmount: number
  createdAt: Date
}

export interface Order {
  _id?: ObjectId
  productId: ObjectId
  productTitle: string
  productPrice: number
  userId?: ObjectId
  buyerEmail: string
  buyerName: string
  status: 'pending' | 'paid' | 'refunded'
  createdAt: Date
  updatedAt: Date
  stripeSessionId?: string
}

export interface CreateProductInput {
  title: string
  description: string
  price: number
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
