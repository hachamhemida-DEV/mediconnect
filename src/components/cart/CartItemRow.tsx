'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { CATEGORIES, productName } from '@/lib/seed';
import { formatDZD } from '@/lib/utils';
import type { Product } from '@/lib/types';

interface Props {
  product: Product;
  quantity: number;
}

export function CartItemRow({ product, quantity }: Props) {
  const t = useTranslations('cart');
  const locale = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  const cat = CATEGORIES.find((c) => c.id === product.categoryId);
  const currencyLoc = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';

  async function update(nextQty: number) {
    setBusy(true);
    try {
      await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: nextQty }),
      });
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={'flex items-start gap-4 p-5 transition ' + (busy ? 'opacity-60' : '')}>
      {/* Image thumbnail */}
      <Link
        href={`/catalog/${product.id}`}
        className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-ink-100 text-4xl"
      >
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
        ) : (
          <span>{cat?.icon ?? '📦'}</span>
        )}
      </Link>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold text-ink-500">{product.brand}</div>
        <Link href={`/catalog/${product.id}`} className="text-sm font-bold text-ink-900 hover:text-brand-600">
          {productName(product, locale)}
        </Link>
        <div className="mt-1 text-sm font-bold text-brand-700">
          {formatDZD(product.price, currencyLoc)}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center overflow-hidden rounded-lg border border-ink-200 bg-white">
            <button
              type="button"
              onClick={() => update(Math.max(0, quantity - 1))}
              disabled={busy}
              className="h-9 w-9 text-ink-700 hover:bg-ink-100 disabled:opacity-50"
              aria-label="-"
            >
              −
            </button>
            <span className="min-w-[2.5rem] text-center text-sm font-bold text-ink-900">{quantity}</span>
            <button
              type="button"
              onClick={() => update(Math.min(product.stock, quantity + 1))}
              disabled={busy || quantity >= product.stock}
              className="h-9 w-9 text-ink-700 hover:bg-ink-100 disabled:opacity-50"
              aria-label="+"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => update(0)}
            disabled={busy}
            className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
            </svg>
            {t('remove')}
          </button>
        </div>
      </div>

      {/* Line total */}
      <div className="shrink-0 text-end">
        <div className="text-xs text-ink-500">{t('subtotal')}</div>
        <div className="mt-1 text-base font-extrabold text-ink-900">
          {formatDZD(product.price * quantity, currencyLoc)}
        </div>
      </div>
    </div>
  );
}
