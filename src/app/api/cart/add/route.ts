import { NextResponse } from 'next/server';
import { z } from 'zod';
import { addToCart } from '@/lib/cart';
import { findProduct } from '@/lib/catalog';

const Schema = z.object({
  productId: z.string().min(1),
  quantity:  z.number().int().min(1).max(999).default(1),
});

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });

  const product = await findProduct(parsed.data.productId);
  if (!product) return NextResponse.json({ error: 'PRODUCT_NOT_FOUND' }, { status: 404 });
  if (product.stock < parsed.data.quantity) {
    return NextResponse.json({ error: 'OUT_OF_STOCK' }, { status: 409 });
  }

  const items = await addToCart(parsed.data.productId, parsed.data.quantity);
  return NextResponse.json({ ok: true, data: items });
}
