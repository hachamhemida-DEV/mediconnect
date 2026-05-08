'use client';

import { useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import type { Category } from '@/lib/types';
import { categoryName } from '@/lib/seed';

export interface ProductFormValues {
  categoryId: string;
  brand:      string;
  nameAr:     string; nameFr: string; nameEn: string;
  descAr:     string; descFr: string; descEn: string;
  specsAr:    string[]; specsFr: string[]; specsEn: string[];
  priceDZD:   number;
  stock:      number;
}

interface Props {
  categories: Category[];
  initial?:   Partial<ProductFormValues>;
  productId?: string;
  /** API endpoint: `/api/supplier/products` for create, `/api/supplier/products/[id]` for edit. */
  submitUrl:  string;
  submitMethod: 'POST' | 'PATCH';
  /** Where to navigate on successful save. */
  redirectTo: string;
}

export function ProductForm({
  categories, initial, productId, submitUrl, submitMethod, redirectTo,
}: Props) {
  const locale = useLocale();
  const router = useRouter();
  const t  = useTranslations('productCrud');

  const [values, setValues] = useState<ProductFormValues>({
    categoryId: initial?.categoryId ?? '',
    brand:      initial?.brand      ?? '',
    nameAr:     initial?.nameAr     ?? '',
    nameFr:     initial?.nameFr     ?? '',
    nameEn:     initial?.nameEn     ?? '',
    descAr:     initial?.descAr     ?? '',
    descFr:     initial?.descFr     ?? '',
    descEn:     initial?.descEn     ?? '',
    specsAr:    initial?.specsAr    ?? [''],
    specsFr:    initial?.specsFr    ?? [''],
    specsEn:    initial?.specsEn    ?? [''],
    priceDZD:   initial?.priceDZD   ?? 0,
    stock:      initial?.stock      ?? 0,
  });
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ProductFormValues>(k: K, v: ProductFormValues[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }
  function updateSpec(kind: 'specsAr' | 'specsFr' | 'specsEn', idx: number, value: string) {
    const next = [...values[kind]];
    next[idx] = value;
    update(kind, next);
  }
  function addSpec(kind: 'specsAr' | 'specsFr' | 'specsEn') {
    update(kind, [...values[kind], '']);
  }
  function removeSpec(kind: 'specsAr' | 'specsFr' | 'specsEn', idx: number) {
    update(kind, values[kind].filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payload = {
        ...values,
        priceDZD: Number(values.priceDZD),
        stock:    Number(values.stock),
        specsAr:  values.specsAr.filter((s) => s.trim()),
        specsFr:  values.specsFr.filter((s) => s.trim()),
        specsEn:  values.specsEn.filter((s) => s.trim()),
      };
      const res = await fetch(submitUrl, {
        method:  submitMethod,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error === 'PLAN_LIMIT_REACHED'
          ? t('planLimit', { limit: body.limit, plan: body.plan })
          : body.error ?? 'error');
        return;
      }
      router.push(redirectTo);
    } catch {
      setError('error');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!productId) return;
    if (!confirm(t('confirmDelete'))) return;
    setBusy(true);
    const res = await fetch(`/api/supplier/products/${productId}`, { method: 'DELETE' });
    if (res.ok) router.push('/dashboard/supplier');
    setBusy(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card-mc p-6 md:p-8">
      <div className="grid gap-6">
        {/* Basic */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('category')}</label>
            <select
              value={values.categoryId}
              onChange={(e) => update('categoryId', e.target.value)}
              required
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            >
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {categoryName(c, locale)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('brand')}</label>
            <input
              type="text"
              required
              value={values.brand}
              onChange={(e) => update('brand', e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
        </div>

        {/* Names trilingual */}
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-ink-800">{t('nameSection')}</legend>
          <div className="grid gap-3 md:grid-cols-3">
            <TrilingualField lang="ar" label="العربيّة" value={values.nameAr} onChange={(v) => update('nameAr', v)} />
            <TrilingualField lang="fr" label="Français"  value={values.nameFr} onChange={(v) => update('nameFr', v)} />
            <TrilingualField lang="en" label="English"   value={values.nameEn} onChange={(v) => update('nameEn', v)} />
          </div>
        </fieldset>

        {/* Descriptions trilingual */}
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-ink-800">{t('descSection')}</legend>
          <div className="grid gap-3 md:grid-cols-3">
            <TrilingualArea lang="ar" label="العربيّة" value={values.descAr} onChange={(v) => update('descAr', v)} />
            <TrilingualArea lang="fr" label="Français"  value={values.descFr} onChange={(v) => update('descFr', v)} />
            <TrilingualArea lang="en" label="English"   value={values.descEn} onChange={(v) => update('descEn', v)} />
          </div>
        </fieldset>

        {/* Specs — Arabic list (Phase 3.5 will sync across languages) */}
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-ink-800">{t('specsSection')}</legend>
          {(['specsAr', 'specsFr', 'specsEn'] as const).map((kind) => (
            <div key={kind} className="mb-4">
              <div className="mb-1 text-xs font-semibold uppercase text-ink-500">
                {kind.replace('specs', '')}
              </div>
              <div className="space-y-2">
                {values[kind].map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={s}
                      onChange={(e) => updateSpec(kind, i, e.target.value)}
                      className="flex-1 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                    />
                    {values[kind].length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpec(kind, i)}
                        className="text-red-600 hover:text-red-700"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSpec(kind)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  + {t('addSpec')}
                </button>
              </div>
            </div>
          ))}
        </fieldset>

        {/* Price + stock */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('price')}</label>
            <input
              type="number"
              required
              min={0}
              value={values.priceDZD}
              onChange={(e) => update('priceDZD', Number(e.target.value))}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('stock')}</label>
            <input
              type="number"
              required
              min={0}
              value={values.stock}
              onChange={(e) => update('stock', Number(e.target.value))}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-card transition hover:bg-brand-600 disabled:opacity-60"
          >
            {busy ? '...' : productId ? t('update') : t('create')}
          </button>
          {productId && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="rounded-xl bg-red-50 px-6 py-3 font-semibold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100 disabled:opacity-60"
            >
              {t('delete')}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

function TrilingualField({
  lang, label, value, onChange,
}: { lang: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase text-ink-500">{label}</label>
      <input
        type="text"
        required
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
      />
    </div>
  );
}

function TrilingualArea({
  lang, label, value, onChange,
}: { lang: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase text-ink-500">{label}</label>
      <textarea
        required
        rows={3}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
      />
    </div>
  );
}
