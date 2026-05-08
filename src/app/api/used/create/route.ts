import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { createUsedListing } from '@/lib/db-phase2';
import { mutationLimiter, rateLimitResponse } from '@/lib/rate-limit';

const Schema = z.object({
  title:             z.string().trim().min(3).max(200),
  description:       z.string().trim().min(10).max(2000),
  categoryId:        z.string().trim().min(1),
  condition:         z.enum(['like_new', 'good', 'needs_service']),
  yearOfManufacture: z.number().int().min(1970).max(2035).optional(),
  price:             z.number().int().min(0).max(100_000_000),
  wilayaCode:        z.number().int().min(1).max(58),
  phone:             z.string().trim().min(6).max(32),
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

  const listing = await createUsedListing({
    sellerId: session.sub,
    images:   [],
    ...parsed.data,
  });

  return NextResponse.json({ ok: true, data: listing }, { status: 201 });
}
