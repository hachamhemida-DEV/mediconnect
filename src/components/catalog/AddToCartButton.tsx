'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

interface Props {
  productId: string;
  stock: number;
  variant?: 'primary' | 'secondary';
}

export function AddToCartButton({ productId, stock, variant = 'primary' }: Props) {
  const t = useTranslations('product');
  const router = useRouter();
  const [busy, setBusy]   = useState(false);
  const [done, setDone]   = useState(false);
  const [qty,  setQty]    = useState(1);

  async function add() {
    setBusy(true);
    setDone(false);
    try {
      const res = await fetch('/api/cart/add', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ productId, quantity: qty }),
      });
      if (res.ok) {
        setDone(true);
        router.refresh();
        setTimeout(() => setDone(false), 2000);
      }
    } finally {
      setBusy(false);
    }
  }

  const disabled = stock <= 0 || busy;
  const base =
    variant === 'primary'
      ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-card'
      : 'bg-white text-ink-800 ring-1 ring-ink-200 hover:bg-ink-50';

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <div className="flex items-center overflow-hidden rounded-xl border border-ink-200 bg-white">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="grid h-12 w-12 place-items-center text-lg text-ink-700 hover:bg-ink-100"
          aria-label="-"
          disabled={qty <= 1}
        >
          −
        </button>
        <input
          type="number"
          value={qty}
          min={1}
          max={stock}
          onChange={(e) => setQty(Math.max(1, Math.min(stock, Number(e.target.value) || 1)))}
          className="h-12 w-14 bg-white text-center text-base font-semibold text-ink-900 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(stock, q + 1))}
          className="grid h-12 w-12 place-items-center text-lg text-ink-700 hover:bg-ink-100"
          aria-label="+"
          disabled={qty >= stock}
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={add}
        disabled={disabled}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition active:scale-[0.98] disabled:opacity-50 ${base}`}
      >
        {done ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12l5 5L20 7" />
            </svg>
            ✓
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            {t('addToCart')}
          </>
        )}
      </button>
    </div>
  );
}
