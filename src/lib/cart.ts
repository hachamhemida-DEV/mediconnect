/**
 * Cart state — persisted in an httpOnly cookie.
 *
 * Why cookie and not IndexedDB:
 * Server Components need to read the cart to compute totals server-side and
 * prevent price-tampering on checkout. A client-only store would require
 * passing cart state through every server action. The cookie approach keeps
 * cart state as the single source of truth readable from both edges.
 *
 * Why not a DB row: Phase 1/2 keep the DB in-memory; writing cart rows
 * before Postgres is in place would be premature.
 */

import { cookies } from 'next/headers';
import type { CartItem } from './types';

const COOKIE_NAME = 'mc_cart';

/** Read the cart from the cookie jar; empty array if none. */
export async function getCart(): Promise<CartItem[]> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (it): it is CartItem =>
        typeof it === 'object' && it !== null &&
        typeof it.productId === 'string' &&
        typeof it.quantity === 'number' && it.quantity > 0 && it.quantity < 1000,
    );
  } catch {
    return [];
  }
}

/** Persist the cart; passing an empty array clears it. */
export async function setCart(items: CartItem[]): Promise<void> {
  const jar = await cookies();
  if (items.length === 0) {
    jar.delete(COOKIE_NAME);
    return;
  }
  jar.set(COOKIE_NAME, JSON.stringify(items), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function addToCart(productId: string, quantity = 1): Promise<CartItem[]> {
  const items = await getCart();
  const existing = items.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, 999);
  } else {
    items.push({ productId, quantity });
  }
  await setCart(items);
  return items;
}

export async function updateCartItem(productId: string, quantity: number): Promise<CartItem[]> {
  const items = await getCart();
  const existing = items.find((i) => i.productId === productId);
  if (!existing) return items;
  if (quantity <= 0) {
    const filtered = items.filter((i) => i.productId !== productId);
    await setCart(filtered);
    return filtered;
  }
  existing.quantity = Math.min(quantity, 999);
  await setCart(items);
  return items;
}

export async function removeFromCart(productId: string): Promise<CartItem[]> {
  const items = await getCart();
  const filtered = items.filter((i) => i.productId !== productId);
  await setCart(filtered);
  return filtered;
}

export async function clearCart(): Promise<void> {
  await setCart([]);
}

/** Sum up quantities — useful for the header cart badge. */
export async function getCartCount(): Promise<number> {
  const items = await getCart();
  return items.reduce((sum, it) => sum + it.quantity, 0);
}
