import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

async function ownedOr403(id: string, userId: string) {
  const campaign = await prisma.adCampaign.findUnique({
    where:   { id },
    include: { supplier: true },
  });
  if (!campaign) return { error: 'NOT_FOUND' as const };
  if (campaign.supplier.userId !== userId) return { error: 'FORBIDDEN' as const };
  return { campaign };
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || (session.role !== 'supplier' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const { id } = await ctx.params;

  if (session.role === 'supplier') {
    const owned = await ownedOr403(id, session.sub);
    if ('error' in owned) {
      return NextResponse.json({ error: owned.error }, { status: owned.error === 'NOT_FOUND' ? 404 : 403 });
    }
  }

  await prisma.adCampaign.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
