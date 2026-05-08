'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { productName } from '@/lib/seed';
import type { Product } from '@/lib/types';

interface Props {
  myProducts: Product[];
}

export function NewAdCampaignForm({ myProducts }: Props) {
  const t  = useTranslations('ads.form');
  const tp = useTranslations('ads.supplier.placements');
  const locale = useLocale();
  const router = useRouter();

  const today  = new Date().toISOString().slice(0, 10);
  const plus30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [placement, setPlacement] = useState<'search_top' | 'homepage_banner' | 'category_sidebar'>('search_top');
  const [model, setModel]         = useState<'cpm' | 'cpc' | 'time'>('cpc');
  const [productId, setProductId] = useState<string>('');
  const [budget, setBudget]       = useState('5000');
  const [startsAt, setStartsAt]   = useState(today);
  const [endsAt, setEndsAt]       = useState(plus30);
  const [busy, setBusy]           = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/supplier/ads', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placement,
          model,
          productId: productId || undefined,
          budgetDZD: Number(budget),
          startsAt:  new Date(startsAt).toISOString(),
          endsAt:    new Date(endsAt).toISOString(),
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(
          body.error === 'PLAN_NO_ADS'   ? t('planNoAds') :
          body.error === 'INVALID_DATES' ? t('invalidDates') :
          body.error ?? 'error',
        );
        return;
      }
      router.push('/dashboard/supplier/ads');
    } catch {
      setError('error');
    } finally {
      setBusy(false);
    }
  }

  const placementOptions: Array<{ key: typeof placement; icon: string }> = [
    { key: 'search_top',       icon: '🔍' },
    { key: 'homepage_banner',  icon: '🏠' },
    { key: 'category_sidebar', icon: '📂' },
  ];

  const modelOptions: Array<{ key: typeof model; desc: string }> = [
    { key: 'cpc',  desc: t('models.cpcDesc') },
    { key: 'cpm',  desc: t('models.cpmDesc') },
    { key: 'time', desc: t('models.timeDesc') },
  ];

  return (
    <form onSubmit={submit} className="card-mc p-6 md:p-8">
      <div className="grid gap-6">
        {/* Placement */}
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-ink-800">{t('placement')}</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {placementOptions.map(({ key, icon }) => (
              <label
                key={key}
                className={
                  'flex cursor-pointer flex-col items-start gap-1 rounded-xl border-2 p-4 transition ' +
                  (placement === key
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-ink-200 bg-white hover:border-ink-300')
                }
              >
                <input
                  type="radio"
                  name="placement"
                  value={key}
                  checked={placement === key}
                  onChange={() => setPlacement(key)}
                  className="sr-only"
                />
                <div className="text-2xl">{icon}</div>
                <div className="text-sm font-bold text-ink-900">{tp(key)}</div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Pricing model */}
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-ink-800">{t('model')}</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {modelOptions.map(({ key, desc }) => (
              <label
                key={key}
                className={
                  'flex cursor-pointer flex-col items-start gap-1 rounded-xl border-2 p-4 transition ' +
                  (model === key
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-ink-200 bg-white hover:border-ink-300')
                }
              >
                <input
                  type="radio"
                  name="model"
                  value={key}
                  checked={model === key}
                  onChange={() => setModel(key)}
                  className="sr-only"
                />
                <div className="text-sm font-extrabold uppercase text-ink-900">{key}</div>
                <div className="text-xs text-ink-600">{desc}</div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Linked product */}
        {myProducts.length > 0 && (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('linkedProduct')}</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            >
              <option value="">— {t('noProduct')} —</option>
              {myProducts.map((p) => (
                <option key={p.id} value={p.id}>{productName(p, locale)}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('budget')}</label>
            <div className="relative">
              <input
                type="number"
                required
                min={100}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 pe-14 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />
              <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-500">DZD</span>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('startsAt')}</label>
            <input
              type="date"
              required
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('endsAt')}</label>
            <input
              type="date"
              required
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
        </div>

        <div className="rounded-xl bg-sky-50 p-4 text-xs text-sky-900 ring-1 ring-sky-200">
          ℹ️ {t('moderationNotice')}
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
  );
}
