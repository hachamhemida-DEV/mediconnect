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
  categoryId: z.string().trim().min(1),
  nameAr:     z.string().trim().min(2).max(200),
  nameFr:     z.string().trim().min(2).max(200),
  nameEn:     z.string().trim().min(2).max(200),
  brand:      z.string().trim().min(1).max(80),
  descAr:     z.string().trim().min(5).max(2000),
  descFr:     z.string().trim().min(5).max(2000),
  descEn:     z.string().trim().min(5).max(2000),
  specsAr:    z.array(z.string().min(1)).max(20).default([]),
  specsFr:    z.array(z.string().min(1)).max(20).default([]),
  specsEn:    z.array(z.string().min(1)).max(20).default([]),
  priceDZD:   z.number().int().min(0).max(1_000_000_000),
  stock:      z.number().int().min(0).max(100_000),
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
    return NextResponse.json({ error: 'INVALID_INPUT', details: parsed.error.issues[0]?.message }, { status: 400 });
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

  const product = await prisma.product.create({
    data: {
      supplierId:   supplier.id,
      categoryId:   parsed.data.categoryId,
      nameAr:       parsed.data.nameAr,
      nameFr:       parsed.data.nameFr,
      nameEn:       parsed.data.nameEn,
      brand:        parsed.data.brand,
      descAr:       parsed.data.descAr,
      descFr:       parsed.data.descFr,
      descEn:       parsed.data.descEn,
      specsAr:      JSON.stringify(parsed.data.specsAr),
      specsFr:      JSON.stringify(parsed.data.specsFr),
      specsEn:      JSON.stringify(parsed.data.specsEn),
      priceDZD:     parsed.data.priceDZD,
      stock:        parsed.data.stock,
      imagesJson:   '[]',
      // Gold tier products auto-featured
      featured:     supplier.plan === 'gold',
    },
  });

  return NextResponse.json({ ok: true, data: { id: product.id } }, { status: 201 });
}
