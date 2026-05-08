import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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

  const campaign = await prisma.adCampaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

  await prisma.adCampaign.update({
    where: { id },
    data:  { active: parsed.data.decision === 'approve' },
  });

  return NextResponse.json({ ok: true });
}
