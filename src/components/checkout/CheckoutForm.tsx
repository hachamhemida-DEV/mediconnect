'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { WILAYAS, wilayaName } from '@/lib/wilayas';
import { formatDZD } from '@/lib/utils';
import type { PaymentMethod } from '@/lib/types';

interface Props {
  subtotal: number;
  tva: number;
  shipping: number;
  total: number;
}

export function CheckoutForm({ subtotal, tva, shipping, total }: Props) {
  const t  = useTranslations('checkout');
  const tc = useTranslations('cart');
  const locale = useLocale();
  const router = useRouter();

  const [wilaya, setWilaya]   = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone]     = useState('');
  const [notes, setNotes]     = useState('');
  const [method, setMethod]   = useState<PaymentMethod>('cash');
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const currencyLoc = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!wilaya || !address.trim() || !phone.trim()) {
      setError(t('paymentMethod'));
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wilayaCode: Number(wilaya),
          address:    address.trim(),
          phone:      phone.trim(),
          notes:      notes.trim() || undefined,
          paymentMethod: method,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? 'ERROR');
        return;
      }
      router.push(`/checkout/success?order=${body.data.id}`);
    } catch {
      setError('ERROR');
    } finally {
      setBusy(false);
    }
  }

  const methods: { key: PaymentMethod; icon: ReactNode }[] = [
    {
      key: 'cash',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" />
        </svg>
      ),
    },
    {
      key: 'ccp',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" /><path d="M8 12l3 3 5-6" />
        </svg>
      ),
    },
    {
      key: 'edahabia',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M7 15h3" />
        </svg>
      ),
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Form column */}
      <div className="space-y-6">
        {/* Address card */}
        <section className="card-mc p-6">
          <h2 className="mb-4 text-lg font-bold text-ink-900">{t('shippingAddress')}</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('wilaya')}</label>
              <select
                value={wilaya}
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

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('address')}</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('addressPlaceholder')}
                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />
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

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t('notes')}</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
        </section>

        {/* Payment method */}
        <section className="card-mc p-6">
          <h2 className="mb-4 text-lg font-bold text-ink-900">{t('paymentMethod')}</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {methods.map(({ key, icon }) => (
              <label
                key={key}
                className={
                  'relative flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-4 transition ' +
                  (method === key
                    ? 'border-brand-500 bg-brand-50 shadow-card'
                    : 'border-ink-200 bg-white hover:border-ink-300')
                }
              >
                <input
                  type="radio"
                  name="payment"
                  value={key}
                  checked={method === key}
                  onChange={() => setMethod(key)}
                  className="sr-only"
                />
                <div className={method === key ? 'text-brand-600' : 'text-ink-500'}>{icon}</div>
                <div className="text-sm font-bold text-ink-900">{t(`paymentMethods.${key}.title`)}</div>
                <div className="text-xs leading-relaxed text-ink-600">{t(`paymentMethods.${key}.desc`)}</div>
              </label>
            ))}
          </div>

          {method === 'ccp' && (
            <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
              <span className="font-semibold">ℹ️ </span>
              {t('ccpInfo')}
            </div>
          )}
        </section>
      </div>

      {/* Summary column */}
      <aside className="card-mc h-fit p-6 lg:sticky lg:top-24">
        <h2 className="mb-4 text-lg font-bold text-ink-900">{tc('summary')}</h2>
        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-600">{tc('subtotal')}</dt>
            <dd className="font-semibold text-ink-900">{formatDZD(subtotal, currencyLoc)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-600">{tc('tva')}</dt>
            <dd className="font-semibold text-ink-900">{formatDZD(tva, currencyLoc)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-600">{tc('shipping')}</dt>
            <dd className="font-semibold text-emerald-600">
              {shipping === 0 ? tc('shippingFree') : formatDZD(shipping, currencyLoc)}
            </dd>
          </div>
        </dl>
        <div className="my-4 h-px bg-ink-200" />
        <div className="flex items-baseline justify-between">
          <span className="text-base font-bold text-ink-900">{tc('total')}</span>
          <span className="text-2xl font-extrabold text-brand-700">
            {formatDZD(total, currencyLoc)}
          </span>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 font-semibold text-white shadow-card transition hover:bg-brand-600 active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? '...' : t('placeOrder')}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-flip-on-rtl aria-hidden>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </aside>
    </form>
  );
}
