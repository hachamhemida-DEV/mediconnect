import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCart, clearCart } from '@/lib/cart';
import { getSession } from '@/lib/auth';
import { findProduct } from '@/lib/catalog';
import { productName } from '@/lib/seed';
import { createOrder } from '@/lib/db-phase2';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { orderConfirmationEmail } from '@/lib/email-templates';
import { logger } from '@/lib/logger';
import type { OrderLine } from '@/lib/types';

const TVA_RATE = 0.19;

const Schema = z.object({
  wilayaCode:    z.number().int().min(1).max(58),
  address:       z.string().trim().min(3).max(500),
  phone:         z.string().trim().min(6).max(32),
  notes:         z.string().trim().max(500).optional(),
  paymentMethod: z.enum(['cash', 'ccp', 'edahabia']),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });

  const items = await getCart();
  if (items.length === 0) return NextResponse.json({ error: 'CART_EMPTY' }, { status: 400 });

  // Snapshot each line, verify stock
  const lines: OrderLine[] = [];
  let subtotal = 0;
  for (const it of items) {
    const p = await findProduct(it.productId);
    if (!p) continue;
    if (p.stock < it.quantity) {
      return NextResponse.json({ error: 'OUT_OF_STOCK', field: p.id }, { status: 409 });
    }
    lines.push({
      productId:     p.id,
      priceSnapshot: p.price,
      nameSnapshot:  productName(p, 'ar'),
      quantity:      it.quantity,
    });
    subtotal += p.price * it.quantity;
  }

  const tva      = Math.round(subtotal * TVA_RATE);
  const shipping = 0;
  const total    = subtotal + tva + shipping;

  const order = await createOrder({
    userId:        session.sub,
    items:         lines,
    subtotal,
    tva,
    shipping,
    total,
    paymentMethod: parsed.data.paymentMethod,
    wilayaCode:    parsed.data.wilayaCode,
    address:       parsed.data.address,
    phone:         parsed.data.phone,
    notes:         parsed.data.notes,
  });

  // Cart is consumed — clear it
  await clearCart();

  // Fire-and-forget order-confirmation email. We don't await it: the buyer
  // should see the success page immediately; email delivery is best-effort.
  (async () => {
    try {
      const user = await prisma.user.findUnique({ where: { id: session.sub } });
      if (!user) return;
      // Detect preferred locale from the request URL path (/, /fr, /en)
      const url = new URL(req.url);
      const seg = url.pathname.split('/').filter(Boolean)[0];
      const locale = (seg === 'fr' || seg === 'en' ? seg : 'ar') as 'ar' | 'fr' | 'en';
      await sendEmail(orderConfirmationEmail({
        to:            user.email,
        fullName:      user.fullName,
        orderId:       order.id,
        totalDZD:      total,
        paymentMethod: parsed.data.paymentMethod,
        locale,
      }));
    } catch (e) {
      logger.warn('order_email_failed', { orderId: order.id, error: (e as Error).message });
    }
  })();

  return NextResponse.json({ ok: true, data: order }, { status: 201 });
}
