import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { supplierApprovedEmail } from '@/lib/email-templates';
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

  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

  await prisma.supplier.update({
    where: { id },
    data:  { verifyStatus: parsed.data.decision === 'approve' ? 'approved' : 'rejected' },
  });

  // Mirror onto the user row for quick checks
  await prisma.user.update({
    where: { id: supplier.userId },
    data:  { verified: parsed.data.decision === 'approve' },
  });

  // Fire email on approval — best effort, never blocks the API response
  if (parsed.data.decision === 'approve') {
    (async () => {
      try {
        const user = await prisma.user.findUnique({ where: { id: supplier.userId } });
        if (!user) return;
        await sendEmail(supplierApprovedEmail({
          to:           user.email,
          businessName: supplier.businessName,
          locale:       'ar',
        }));
      } catch (e) {
        logger.warn('supplier_approved_email_failed', { supplierId: id, error: (e as Error).message });
      }
    })();
  }

  return NextResponse.json({ ok: true });
}
