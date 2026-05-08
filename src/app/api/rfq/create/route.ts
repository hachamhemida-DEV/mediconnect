import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { createRfq } from '@/lib/db-phase2';
import { mutationLimiter, rateLimitResponse } from '@/lib/rate-limit';

const Schema = z.object({
  title:       z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(2000),
  categoryId:  z.string().trim().min(1),
  quantity:    z.number().int().min(1).max(10000),
  budgetMax:   z.number().int().min(0).optional(),
  wilayaCode:  z.number().int().min(1).max(58),
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

  const rfq = await createRfq({
    buyerId:     session.sub,
    title:       parsed.data.title,
    description: parsed.data.description,
    categoryId:  parsed.data.categoryId,
    quantity:    parsed.data.quantity,
    budgetMax:   parsed.data.budgetMax,
    wilayaCode:  parsed.data.wilayaCode,
  });

  return NextResponse.json({ ok: true, data: rfq }, { status: 201 });
}
