import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { ccpVerifiedEmail } from '@/lib/email-templates';
import { logger } from '@/lib/logger';

const Schema = z.object({
  decision: z.enum(['approve', 'reject']),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const { id } = await ctx.params;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

  if (parsed.data.decision === 'approve') {
    await prisma.order.update({
      where: { id },
      data:  { paymentVerified: true, status: 'confirmed' },
    });

    // Best-effort email to the buyer
    (async () => {
      try {
        const user = await prisma.user.findUnique({ where: { id: order.userId } });
        if (!user) return;
        await sendEmail(ccpVerifiedEmail({
          to:       user.email,
          fullName: user.fullName,
          orderId:  order.id,
          locale:   'ar',
        }));
      } catch (e) {
        logger.warn('ccp_verified_email_failed', { orderId: id, error: (e as Error).message });
      }
    })();
  } else {
    await prisma.order.update({
      where: { id },
      data:  { paymentVerified: false, status: 'cancelled' },
    });
  }

  return NextResponse.json({ ok: true });
}
