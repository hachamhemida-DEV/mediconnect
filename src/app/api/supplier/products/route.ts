import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { mutationLimiter, rateLimitResponse } from '@/lib/rate-limit';

/* Per-plan product limits (Phase 2 pricing section, supplier plans). */
const PLAN_LIMITS: Record<string, number> = {
  basic:      50,
  pro:        500,
  gold:       Number.POSITIVE_INFINITY,
  enterprise: Number.POSITIVE_INFINITY,
};

const CreateSchema = z.object({
  categoryId: z.string().trim().min(1, 'Category is required'),
  brand:      z.string().trim().min(1, 'Brand is required').max(80),
  nameAr:     z.string().trim().max(200).default(''),
  nameFr:     z.string().trim().max(200).default(''),
  nameEn:     z.string().trim().max(200).default(''),
  descAr:     z.string().trim().max(2000).default(''),
  descFr:     z.string().trim().max(2000).default(''),
  descEn:     z.string().trim().max(2000).default(''),
  specsAr:    z.array(z.string()).max(20).default([]),
  specsFr:    z.array(z.string()).max(20).default([]),
  specsEn:    z.array(z.string()).max(20).default([]),
  priceDZD:   z.coerce.number().int().min(0).max(1_000_000_000).default(0),
  stock:      z.coerce.number().int().min(0).max(100_000).default(0),
  images:     z.array(z.string()).max(5).default([]),
  cataloguePdf: z.string().optional(),
}).refine((d) => d.nameAr.length > 0 || d.nameFr.length > 0 || d.nameEn.length > 0, {
  message: 'Product name is required',
  path: ['nameAr'],
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'supplier') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const rl = await mutationLimiter.limit(session.sub);
  if (!rl.success) return rateLimitResponse(rl);

  const supplier = await prisma.supplier.findUnique({ where: { userId: session.sub } });
  if (!supplier) return NextResponse.json({ error: 'NO_SUPPLIER' }, { status: 404 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_INPUT', details: parsed.error.issues }, { status: 400 });
  }

  // Enforce per-plan limit
  const currentCount = await prisma.product.count({ where: { supplierId: supplier.id } });
  const limit = PLAN_LIMITS[supplier.plan] ?? PLAN_LIMITS.basic!;
  if (currentCount >= limit) {
    return NextResponse.json(
      { error: 'PLAN_LIMIT_REACHED', limit, plan: supplier.plan },
      { status: 403 },
    );
  }

  // Auto-fill alternate language names and descriptions if only one was provided
  const primaryName = parsed.data.nameAr || parsed.data.nameFr || parsed.data.nameEn;
  const nameAr = parsed.data.nameAr || primaryName;
  const nameFr = parsed.data.nameFr || primaryName;
  const nameEn = parsed.data.nameEn || primaryName;

  const primaryDesc = parsed.data.descAr || parsed.data.descFr || parsed.data.descEn || '';
  const descAr = parsed.data.descAr || primaryDesc;
  const descFr = parsed.data.descFr || primaryDesc;
  const descEn = parsed.data.descEn || primaryDesc;

  const product = await prisma.product.create({
    data: {
      supplierId:   supplier.id,
      categoryId:   parsed.data.categoryId,
      nameAr,
      nameFr,
      nameEn,
      brand:        parsed.data.brand,
      descAr,
      descFr,
      descEn,
      specsAr:      JSON.stringify(parsed.data.specsAr),
      specsFr:      JSON.stringify(parsed.data.specsFr),
      specsEn:      JSON.stringify(parsed.data.specsEn),
      priceDZD:     parsed.data.priceDZD ?? 0,
      stock:        parsed.data.stock ?? 0,
      imagesJson:   JSON.stringify(parsed.data.images),
      cataloguePdf: parsed.data.cataloguePdf ?? null,
      // Gold tier products auto-featured
      featured:     supplier.plan === 'gold',
    },
  });

  return NextResponse.json({ ok: true, data: { id: product.id } }, { status: 201 });
}
