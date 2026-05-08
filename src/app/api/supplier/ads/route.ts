import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/**
 * Per-plan monthly ad credit (DZD) as advertised on the pricing section.
 * Campaigns under this budget go straight to moderation; above it, the
 * supplier owes the delta on their next subscription invoice.
 */
const PLAN_MONTHLY_AD_CREDIT: Record<string, number> = {
  basic:      0,
  pro:        500,
  gold:       2000,
  enterprise: Number.POSITIVE_INFINITY,
};

const Schema = z.object({
  productId:  z.string().optional(),
  placement:  z.enum(['search_top', 'homepage_banner', 'category_sidebar']),
  model:      z.enum(['cpm', 'cpc', 'time']),
  budgetDZD:  z.number().int().min(100).max(10_000_000),
  startsAt:   z.string().datetime(),
  endsAt:     z.string().datetime(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'supplier') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const supplier = await prisma.supplier.findUnique({ where: { userId: session.sub } });
  if (!supplier) return NextResponse.json({ error: 'NO_SUPPLIER' }, { status: 404 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });

  const startsAt = new Date(parsed.data.startsAt);
  const endsAt   = new Date(parsed.data.endsAt);
  if (endsAt <= startsAt) {
    return NextResponse.json({ error: 'INVALID_DATES' }, { status: 400 });
  }

  // Basic plan suppliers can't buy ads — no credit included
  if (supplier.plan === 'basic') {
    return NextResponse.json(
      { error: 'PLAN_NO_ADS', upgradeTo: 'pro' },
      { status: 403 },
    );
  }

  // Product ownership check when a product is linked
  if (parsed.data.productId) {
    const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
    if (!product || product.supplierId !== supplier.id) {
      return NextResponse.json({ error: 'PRODUCT_NOT_OWNED' }, { status: 403 });
    }
  }

  // Create the campaign — inactive by default, admin flips `active` on moderation
  const campaign = await prisma.adCampaign.create({
    data: {
      supplierId: supplier.id,
      productId:  parsed.data.productId,
      placement:  parsed.data.placement,
      model:      parsed.data.model,
      budgetDZD:  parsed.data.budgetDZD,
      startsAt,
      endsAt,
      active:     false,
    },
  });

  const monthlyCredit = PLAN_MONTHLY_AD_CREDIT[supplier.plan] ?? 0;
  return NextResponse.json(
    { ok: true, data: { id: campaign.id }, monthlyCredit },
    { status: 201 },
  );
}
