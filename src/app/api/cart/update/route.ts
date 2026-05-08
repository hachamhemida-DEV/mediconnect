import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateCartItem, removeFromCart } from '@/lib/cart';

const Schema = z.object({
  productId: z.string().min(1),
  quantity:  z.number().int().min(0).max(999),
});

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });

  const { productId, quantity } = parsed.data;
  const items = quantity === 0
    ? await removeFromCart(productId)
    : await updateCartItem(productId, quantity);

  return NextResponse.json({ ok: true, data: items });
}
