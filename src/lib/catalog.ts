/**
 * Catalog queries — Prisma-backed read helpers.
 *
 * Page components that previously imported `PRODUCTS`, `CATEGORIES`,
 * `SUPPLIERS` from `seed.ts` now call these functions. The domain types
 * match the Phase 1/2 shapes, so callers keep working.
 */

import { prisma } from './prisma';
import type { Product, Category, Supplier } from './types';

function rowToProduct(row: {
  id: string; categoryId: string; supplierId: string;
  nameAr: string; nameFr: string; nameEn: string; brand: string;
  descAr: string; descFr: string; descEn: string;
  specsAr: string; specsFr: string; specsEn: string;
  priceDZD: number; stock: number; imagesJson: string;
  rating: number; reviewsCount: number; featured: boolean; createdAt: Date;
}): Product {
  return {
    id:           row.id,
    categoryId:   row.categoryId,
    supplierId:   row.supplierId,
    nameAr:       row.nameAr,
    nameFr:       row.nameFr,
    nameEn:       row.nameEn,
    brand:        row.brand,
    descAr:       row.descAr,
    descFr:       row.descFr,
    descEn:       row.descEn,
    specsAr:      JSON.parse(row.specsAr) as string[],
    specsFr:      JSON.parse(row.specsFr) as string[],
    specsEn:      JSON.parse(row.specsEn) as string[],
    price:        row.priceDZD,
    stock:        row.stock,
    images:       JSON.parse(row.imagesJson) as string[],
    rating:       row.rating,
    reviewsCount: row.reviewsCount,
    featured:     row.featured,
    createdAt:    row.createdAt.toISOString(),
  };
}

function rowToCategory(row: {
  id: string; slug: string; nameAr: string; nameFr: string; nameEn: string; icon: string; color: string;
}): Category {
  return {
    id: row.id, slug: row.slug,
    nameAr: row.nameAr, nameFr: row.nameFr, nameEn: row.nameEn,
    icon: row.icon, color: row.color,
  };
}

function rowToSupplier(row: {
  id: string; businessName: string; wilayaCode: number;
  plan: string; rating: number; reviewsCount: number; memberSince: Date;
}): Supplier {
  return {
    id:           row.id,
    businessName: row.businessName,
    wilayaCode:   row.wilayaCode,
    plan:         row.plan as Supplier['plan'],
    verified:     true,
    rating:       row.rating,
    reviewsCount: row.reviewsCount,
    memberSince:  row.memberSince.toISOString(),
  };
}

// --- products -------------------------------------------------------------

export async function listProducts(opts: {
  categoryId?: string;
  supplierId?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort?: 'featured' | 'priceAsc' | 'priceDesc' | 'rating' | 'newest';
} = {}): Promise<Product[]> {
  const where: Record<string, unknown> = {};
  if (opts.categoryId) where.categoryId = opts.categoryId;
  if (opts.supplierId) where.supplierId = opts.supplierId;
  if (opts.minPrice != null || opts.maxPrice != null) {
    where.priceDZD = {
      ...(opts.minPrice != null ? { gte: opts.minPrice } : {}),
      ...(opts.maxPrice != null ? { lte: opts.maxPrice } : {}),
    };
  }
  if (opts.q) {
    const q = opts.q;
    where.OR = [
      { nameAr: { contains: q } },
      { nameFr: { contains: q } },
      { nameEn: { contains: q } },
      { brand:  { contains: q } },
      { descAr: { contains: q } },
      { descFr: { contains: q } },
      { descEn: { contains: q } },
    ];
  }

  const orderBy: Record<string, 'asc' | 'desc'> =
    opts.sort === 'priceAsc'  ? { priceDZD:  'asc'  } :
    opts.sort === 'priceDesc' ? { priceDZD:  'desc' } :
    opts.sort === 'rating'    ? { rating:    'desc' } :
    opts.sort === 'newest'    ? { createdAt: 'desc' } :
                                { featured:  'desc' };

  const rows = await prisma.product.findMany({ where, orderBy });
  return rows.map(rowToProduct);
}

export async function findProduct(id: string): Promise<Product | undefined> {
  const row = await prisma.product.findUnique({ where: { id } });
  return row ? rowToProduct(row) : undefined;
}

// --- categories / suppliers ----------------------------------------------

export async function listCategories(): Promise<Category[]> {
  const rows = await prisma.category.findMany({ orderBy: { id: 'asc' } });
  return rows.map(rowToCategory);
}

export async function findCategory(id: string): Promise<Category | undefined> {
  const row = await prisma.category.findUnique({ where: { id } });
  return row ? rowToCategory(row) : undefined;
}

export async function findSupplier(id: string): Promise<Supplier | undefined> {
  const row = await prisma.supplier.findUnique({ where: { id } });
  return row ? rowToSupplier(row) : undefined;
}

export async function findSupplierByUserId(userId: string): Promise<Supplier | undefined> {
  const row = await prisma.supplier.findUnique({ where: { userId } });
  return row ? rowToSupplier(row) : undefined;
}
