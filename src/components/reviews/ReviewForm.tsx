'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

interface Props {
  productId:   string;
  orderId:     string;
}

export function ReviewForm({ productId, orderId }: Props) {
  const t = useTranslations('reviews');
  const router = useRouter();
  const [rating, setRating]   = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy]       = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [, startTransition]   = useTransition();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (comment.trim().length < 3) { setError('error'); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/reviews/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ productId, orderId, rating, comment: comment.trim() }),
      });
      const body = await res.json();
      if (!res.ok) { setError(body.error ?? 'error'); return; }
      setDone(true);
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="card-mc flex items-center gap-3 p-5 ring-1 ring-emerald-200 bg-emerald-50/50">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500 text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
        </div>
        <div className="font-semibold text-ink-900">{t('submitted')}</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-mc p-5">
      <h3 className="text-base font-bold text-ink-900">{t('writeReview')}</h3>

      <div className="mt-4">
        <div className="mb-1 text-sm font-semibold text-ink-800">{t('yourRating')}</div>
        <div className="flex gap-1">
          {[1,2,3,4,5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              className={'text-3xl transition ' + (i <= rating ? 'text-amber-400' : 'text-ink-200 hover:text-amber-300')}
              aria-label={`${i} ${t('stars')}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-sm font-semibold text-ink-800">{t('yourComment')}</label>
        <textarea
          rows={4}
          required
          minLength={3}
          maxLength={2000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('commentPlaceholder')}
          className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
        />
      </div>

      {error && (
        <div className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-4 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600 disabled:opacity-60"
      >
        {busy ? '...' : t('submit')}
      </button>
    </form>
  );
}
