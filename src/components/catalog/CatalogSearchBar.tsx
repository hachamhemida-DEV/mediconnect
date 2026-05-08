'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

export function CatalogSearchBar({ initial }: { initial?: string }) {
  const t = useTranslations('catalog');
  const tc = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(initial ?? '');
  const [, startTransition] = useTransition();

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const sp = new URLSearchParams(window.location.search);
    if (value) sp.set('q', value);
    else sp.delete('q');
    const q = sp.toString();
    startTransition(() => router.push(q ? `${pathname}?${q}` : pathname));
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 py-3 shadow-sm focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-400" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.5-4.5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="flex-1 bg-transparent text-sm text-ink-900 placeholder-ink-400 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
      >
        {tc('search')}
      </button>
    </form>
  );
}
