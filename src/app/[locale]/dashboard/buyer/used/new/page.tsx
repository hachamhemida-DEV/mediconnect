'use client';

import { useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { CATEGORIES, categoryName } from '@/lib/seed';
import { WILAYAS, wilayaName } from '@/lib/wilayas';
import type { UsedCondition } from '@/lib/types';

export default function NewUsedListingPage() {
  const t = useTranslations('used.form');
  const tu = useTranslations('used');
  const locale = useLocale();
  const router = useRouter();

  const [title, setTitle]         = useState('');
  const [description, setDesc]    = useState('');
  const [categoryId, setCat]      = useState('');
  const [condition, setCond]      = useState<UsedCondition>('good');
  const [year, setYear]           = useState('');
  const [price, setPrice]         = useState('');
  const [wilayaCode, setWilaya]   = useState('');
  const [phone, setPhone]         = useState('');
  const [busy, setBusy]           = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !categoryId || !wilayaCode || !price || !phone) {
      setError('required');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/used/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:             title.trim(),
          description:       description.trim(),
          categoryId,
          condition,
          yearOfManufacture: year ? Number(year) : undefined,
          price:             Number(price),
          wilayaCode:        Number(wilayaCode),
          phone:             phone.trim(),
        }),
      });
      const body = await res.json();
      if (!res.ok) { 
        if (body.details && Array.isArray(body.details)) {
          setError(`Erreur de validation: ${body.details.map((d: any) => d.path.join('.') + ' ' + d.message).join(', ')}`);
        } else if (body.details && typeof body.details === 'string') {
          setError(`${body.error}: ${body.details}`);
        } else {
          setError(body.error ?? 'error'); 
        }
        return; 
      }
      router.push(`/used/${body.data.id}`);
    } catch {
      setError('error');
    } finally {
      setBusy(false);
    }
  }

  const conditions: UsedCondition[] = ['like_new', 'good', 'needs_service'];

  return (
    <>
      <h1 className="text-3xl font-extrabold text-ink-900 md:text-4xl">{t('title')}</h1>
      <p className="mt-2 text-ink-600">{t('subtitle')}</p>

      <form onSubmit={handleSubmit} className="card-mc mt-6 p-6 md:p-8">
        <div className="grid gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('itemTitle')}</label>
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
                  <option key={c.id} value={c.id}>{c.icon} {categoryName(c, locale)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('condition')}</label>
              <div className="flex gap-2">
                {conditions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCond(c)}
                    className={
                      'flex-1 rounded-xl border-2 px-3 py-2.5 text-xs font-semibold transition ' +
                      (condition === c
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300')
                    }
                  >
                    {tu(`conditions.${c}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('year')}</label>
              <input
                type="number"
                min={1970}
                max={2035}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('price')}</label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />
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
                  <option key={w.code} value={String(w.code)}>{String(w.code).padStart(2, '0')} — {wilayaName(w, locale)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('phone')}</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+213 ..."
                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 p-4 text-xs text-amber-900 ring-1 ring-amber-200">
            ⚠️ {t('disclaimer')}
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-brand-500 px-6 py-3.5 font-semibold text-white shadow-card transition hover:bg-brand-600 disabled:opacity-60"
          >
            {busy ? '...' : t('submit')}
          </button>
        </div>
      </form>
    </>
  );
}
