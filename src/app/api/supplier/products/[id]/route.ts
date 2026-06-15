import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const PatchSchema = z.object({
  categoryId: z.string().trim().min(1).optional(),
  nameAr:     z.string().trim().min(1).max(200).optional(),
  nameFr:     z.string().trim().min(1).max(200).optional(),
  nameEn:     z.string().trim().min(1).max(200).optional(),
  brand:      z.string().trim().min(1).max(80).optional(),
  descAr:     z.string().trim().min(1).max(2000).optional(),
  descFr:     z.string().trim().min(1).max(2000).optional(),
  descEn:     z.string().trim().min(1).max(2000).optional(),
  specsAr:    z.array(z.string().min(1)).max(20).optional(),
  specsFr:    z.array(z.string().min(1)).max(20).optional(),
  specsEn:    z.array(z.string().min(1)).max(20).optional(),
  priceDZD:   z.coerce.number().int().min(0).max(1_000_000_000).optional(),
  stock:      z.coerce.number().int().min(0).max(100_000).optional(),
});

async function ownedOr403(productId: string, userId: string) {
  const product = await prisma.product.findUnique({
    where:   { id: productId },
    include: { supplier: true },
  });
  if (!product) return { error: 'NOT_FOUND' as const };
  if (product.supplier.userId !== userId) return { error: 'FORBIDDEN' as const };
  return { product };
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== 'supplier') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const { id } = await ctx.params;
  const owned = await ownedOr403(id, session.sub);
  if ('error' in owned) {
    return NextResponse.json({ error: owned.error }, { status: owned.error === 'NOT_FOUND' ? 404 : 403 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INPUT', details: parsed.error.issues }, { status: 400 });

  // Any arrays get JSON-stringified; others passthrough.
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v === undefined) continue;
    if (k === 'specsAr' || k === 'specsFr' || k === 'specsEn') {
      data[k] = JSON.stringify(v);
    } else {
      data[k] = v;
    }
  }

  await prisma.product.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== 'supplier') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const { id } = await ctx.params;
  const owned = await ownedOr403(id, session.sub);
  if ('error' in owned) {
    return NextResponse.json({ error: owned.error }, { status: owned.error === 'NOT_FOUND' ? 404 : 403 });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
