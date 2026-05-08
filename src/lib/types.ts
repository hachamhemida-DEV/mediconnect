/**
 * Shared TypeScript types across the MediConnect platform.
 * Kept in one place so that the API, the client, and the (future) database
 * schema can stay in sync.
 */

export type Role = 'buyer' | 'supplier' | 'delivery' | 'admin';

/** Algerian subscription packages (see spec v1.2). */
export type SupplierPlan = 'basic' | 'pro' | 'gold' | 'enterprise';

export interface User {
  id: string;
  role: Role;
  email: string;
  phone?: string;
  fullName: string;
  businessName?: string;
  wilaya?: string;
  /** Supplier-specific package; null for buyers / admins. */
  plan?: SupplierPlan | null;
  /** ISO timestamp. */
  createdAt: string;
  /** Whether the supplier / delivery company has been verified by admin. */
  verified: boolean;
}

/** Algerian wilaya — 58 total. Used for the register form and delivery filters. */
export interface Wilaya {
  code: number;
  nameAr: string;
  nameFr: string;
  nameEn: string;
}

/** Supported payment methods (spec: cash at office, CCP, Edahabia). */
export type PaymentMethod = 'cash' | 'ccp' | 'edahabia';

/** JWT payload stored in the session cookie. */
export interface SessionPayload {
  sub: string;       // user id
  email: string;
  role: Role;
  fullName: string;
  iat?: number;
  exp?: number;
}

export interface ApiError {
  error: string;
  field?: string;
}

export interface ApiSuccess<T = unknown> {
  ok: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/* ------------------------------------------------------------------ */
/*  Catalog + product                                                  */
/* ------------------------------------------------------------------ */

export interface Category {
  id: string;
  slug: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  /** Emoji used as a lightweight icon (no asset pipeline needed) */
  icon: string;
  color: string;
}

export interface Supplier {
  id: string;
  businessName: string;
  wilayaCode: number;
  plan: SupplierPlan;
  verified: true;
  /** Average rating 0–5, one decimal */
  rating: number;
  reviewsCount: number;
  /** ISO date */
  memberSince: string;
}

export interface Product {
  id: string;
  categoryId: string;
  supplierId: string;
  /** Trilingual name — the active locale picks one */
  nameAr: string;
  nameFr: string;
  nameEn: string;
  brand: string;
  /** Trilingual short description */
  descAr: string;
  descFr: string;
  descEn: string;
  /** Key specifications as raw localized strings */
  specsAr: string[];
  specsFr: string[];
  specsEn: string[];
  /** Price in DZD (integer) */
  price: number;
  /** In stock quantity; 0 means out-of-stock */
  stock: number;
  /** One or more image placeholders; kept as single-colour SVG until Phase 3 */
  images: string[];
  /** Average rating 0–5, one decimal */
  rating: number;
  reviewsCount: number;
  /** Whether this product is featured in search (supplier paid, or Gold plan) */
  featured: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

/* ------------------------------------------------------------------ */
/*  Orders                                                             */
/* ------------------------------------------------------------------ */

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderLine {
  productId: string;
  /** Snapshotted at checkout — price may change later */
  priceSnapshot: number;
  nameSnapshot: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderLine[];
  subtotal: number;
  tva: number;        // 19% VAT
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  /** Proof-of-payment file name when paymentMethod === 'ccp' */
  paymentProof?: string;
  status: OrderStatus;
  wilayaCode: number;
  address: string;
  phone: string;
  notes?: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Request for Quotation (RFQ)                                        */
/* ------------------------------------------------------------------ */

export type RfqStatus = 'open' | 'closed' | 'fulfilled';

export interface Rfq {
  id: string;
  buyerId: string;
  categoryId: string;
  /** Trilingual title (the buyer writes in one language) */
  title: string;
  description: string;
  quantity: number;
  /** Optional budget ceiling in DZD */
  budgetMax?: number;
  wilayaCode: number;
  status: RfqStatus;
  createdAt: string;
  /** Replies from matching suppliers */
  replies: RfqReply[];
}

export interface RfqReply {
  id: string;
  rfqId: string;
  supplierId: string;
  priceOffer: number;
  message: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Used-equipment marketplace                                         */
/* ------------------------------------------------------------------ */

export type UsedCondition = 'like_new' | 'good' | 'needs_service';

export interface UsedListing {
  id: string;
  sellerId: string;
  categoryId: string;
  title: string;
  description: string;
  condition: UsedCondition;
  yearOfManufacture?: number;
  price: number;
  images: string[];
  wilayaCode: number;
  phone: string;
  /** true = still for sale */
  active: boolean;
  createdAt: string;
}
