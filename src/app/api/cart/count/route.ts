import { NextResponse } from 'next/server';
import { getCartCount } from '@/lib/cart';

export async function GET() {
  const count = await getCartCount();
  return NextResponse.json({ count });
}
