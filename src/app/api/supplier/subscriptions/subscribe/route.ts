import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createSubscriptionRequest, type Plan } from '@/lib/subscriptions';

const Schema = z.object({
  plan:          z.enum(['basic', 'pro', 'gold']),
  paymentMethod: z.enum(['cash', 'ccp', 'edahabia']),
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

  // Block concurrent pending requests — force resolution of existing one first
  const existingPending = await prisma.supplierSubscription.findFirst({
    where: { supplierId: supplier.id, paid: false },
  });
  if (existingPending) {
    return NextResponse.json(
      { error: 'PENDING_EXISTS', subscriptionId: existingPending.id },
      { status: 409 },
    );
  }

  const sub = await createSubscriptionRequest(
    supplier.id,
    parsed.data.plan as Plan,
    parsed.data.paymentMethod,
  );
  return NextResponse.json({ ok: true, data: { id: sub.id } }, { status: 201 });
}
