'use client';

import { useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { CATEGORIES, categoryName } from '@/lib/seed';
import { WILAYAS, wilayaName } from '@/lib/wilayas';

export default function NewRfqPage() {
  const t = useTranslations('rfq.form');
  const locale = useLocale();
  const router = useRouter();

  const [title, setTitle]         = useState('');
  const [description, setDesc]    = useState('');
  const [categoryId, setCat]      = useState('');
  const [quantity, setQty]        = useState(1);
  const [budgetMax, setBudget]    = useState('');
  const [wilayaCode, setWilaya]   = useState('');
  const [busy, setBusy]           = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !categoryId || !wilayaCode || quantity <= 0) {
      setError('required');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/rfq/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:       title.trim(),
          description: description.trim(),
          categoryId,
          quantity,
          budgetMax:   budgetMax ? Number(budgetMax) : undefined,
          wilayaCode:  Number(wilayaCode),
        }),
      });
      if (!res.ok) {
        setError('error');
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/buyer/rfq'), 1500);
    } catch {
      setError('error');
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="card-mc flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-brand-500 text-white shadow-card-lg">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-extrabold text-ink-900">{t('submitSuccess')}</h2>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-8 text-3xl font-extrabold text-ink-900 md:text-4xl">{t('title')}</h1>

      <form onSubmit={handleSubmit} className="card-mc p-6 md:p-8">
        <div className="grid gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('productTitle')}</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('description')}</label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('category')}</label>
              <select
                value={categoryId}
                onChange={(e) => setCat(e.target.value)}
                required
                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              >
                <option value="">—</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {categoryName(c, locale)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('wilaya')}</label>
              <select
                value={wilayaCode}
                onChange={(e) => setWilaya(e.target.value)}
                required
                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              >
                <option value="">—</option>
                {WILAYAS.map((w) => (
                  <option key={w.code} value={String(w.code)}>
                    {String(w.code).padStart(2, '0')} — {wilayaName(w, locale)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('quantity')}</label>
              <input
                type="number"
                required
                min={1}
                value={quantity}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('budget')}</label>
              <input
                type="number"
                min={0}
                value={budgetMax}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-xl bg-brand-500 px-6 py-3.5 font-semibold text-white shadow-card transition hover:bg-brand-600 active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? '...' : t('submit')}
          </button>
        </div>
      </form>
    </>
  );
}
