import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const { id } = await ctx.params;
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: { products: { select: { id: true } } },
  });

  if (!supplier) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const productIds = supplier.products.map((p) => p.id);

  // Clean up order items and reviews for all products of this supplier
  if (productIds.length > 0) {
    await prisma.orderItem.deleteMany({
      where: { productId: { in: productIds } },
    });
    await prisma.review.deleteMany({
      where: { productId: { in: productIds } },
    });
  }

  // Delete the supplier (cascades products, subscriptions, rfqReplies, adCampaigns)
  await prisma.supplier.delete({ where: { id } });

  // Update user role to buyer so they can still log in without broken supplier dashboard
  await prisma.user.update({
    where: { id: supplier.userId },
    data: { role: 'buyer', verified: false },
  });

  return NextResponse.json({ ok: true });
}
