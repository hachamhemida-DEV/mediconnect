import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { mutationLimiter, rateLimitResponse } from '@/lib/rate-limit';

const Schema = z.object({
  productId: z.string().trim().min(1),
  orderId:   z.string().trim().min(1),
  rating:    z.number().int().min(1).max(5),
  comment:   z.string().trim().min(3).max(2000),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const rl = await mutationLimiter.limit(session.sub);
  if (!rl.success) return rateLimitResponse(rl);

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });

  // Verify the user actually purchased this product in the referenced order
  const item = await prisma.orderItem.findFirst({
    where: {
      productId: parsed.data.productId,
      order:    { id: parsed.data.orderId, userId: session.sub },
    },
  });
  if (!item) {
    return NextResponse.json({ error: 'NOT_PURCHASED' }, { status: 403 });
  }

  // Upsert — one review per (user, product, order) tuple
  await prisma.review.upsert({
    where: {
      userId_productId_orderId: {
        userId:    session.sub,
        productId: parsed.data.productId,
        orderId:   parsed.data.orderId,
      },
    },
    update: { rating: parsed.data.rating, comment: parsed.data.comment },
    create: {
      userId:    session.sub,
      productId: parsed.data.productId,
      orderId:   parsed.data.orderId,
      rating:    parsed.data.rating,
      comment:   parsed.data.comment,
    },
  });

  // Recompute the product's aggregate rating + reviewsCount
  const agg = await prisma.review.aggregate({
    where: { productId: parsed.data.productId },
    _avg:  { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: parsed.data.productId },
    data: {
      rating:       Math.round((agg._avg.rating ?? 0) * 10) / 10,
      reviewsCount: agg._count,
    },
  });

  return NextResponse.json({ ok: true });
}
