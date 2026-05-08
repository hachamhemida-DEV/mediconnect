import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const Schema = z.object({
  status: z.enum(['pending', 'picked_up', 'in_transit', 'delivered', 'failed']),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  if (session.role !== 'delivery' && session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const { id } = await ctx.params;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });

  const shipment = await prisma.shipment.findUnique({ where: { id } });
  if (!shipment) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

  await prisma.shipment.update({
    where: { id },
    data:  { status: parsed.data.status },
  });

  // Sync the parent order's status too when shipment reaches terminal states
  if (parsed.data.status === 'delivered') {
    await prisma.order.update({
      where: { id: shipment.orderId },
      data:  { status: 'delivered' },
    });
  } else if (parsed.data.status === 'in_transit' || parsed.data.status === 'picked_up') {
    await prisma.order.update({
      where: { id: shipment.orderId },
      data:  { status: 'shipped' },
    });
  }

  return NextResponse.json({ ok: true });
}
