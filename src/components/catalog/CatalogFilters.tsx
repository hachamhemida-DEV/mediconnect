'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useTransition } from 'react';
import { CATEGORIES, categoryName } from '@/lib/seed';

interface Props {
  selectedCategory?: string;
  selectedWilaya?: string;
  minPrice?: string;
  maxPrice?: string;
  q?: string;
  sort?: string;
}

type SortKey = 'featured' | 'priceAsc' | 'priceDesc' | 'rating' | 'newest';
const SORTS: SortKey[] = ['featured', 'priceAsc', 'priceDesc', 'rating', 'newest'];

export function CatalogFilters({
  selectedCategory,
  minPrice,
  maxPrice,
  q,
  sort,
}: Props) {
  const t = useTranslations('catalog');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  function update(patch: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const current: Record<string, string | undefined> = {
      q, sort,
      category: selectedCategory,
      min: minPrice, max: maxPrice,
    };
    const next = { ...current, ...patch };
    for (const [k, v] of Object.entries(next)) {
      if (v !== undefined && v !== '') sp.set(k, v);
    }
    const query = sp.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  function clearAll() {
    startTransition(() => {
      router.push(pathname);
    });
  }

  const hasFilters =
    !!selectedCategory || !!minPrice || !!maxPrice || !!q || (!!sort && sort !== 'featured');

  return (
    <aside className="w-full space-y-6 lg:sticky lg:top-24">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-ink-500">
          {t('filters')}
        </h3>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            {t('clearFilters')}
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-ink-800">
          {t('sort')}
        </label>
        <select
          value={sort ?? 'featured'}
          onChange={(e) => update({ sort: e.target.value })}
          className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
        >
          {SORTS.map((s) => (
            <option key={s} value={s}>
              {t(`sortOptions.${s}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-ink-800">
          {t('category')}
        </label>
        <div className="space-y-1">
          <button
            onClick={() => update({ category: undefined })}
            className={
              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ' +
              (!selectedCategory
                ? 'bg-brand-50 font-bold text-brand-700 ring-1 ring-brand-200'
                : 'text-ink-700 hover:bg-ink-100')
            }
          >
            <span>{t('allCategories')}</span>
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => update({ category: c.id })}
              className={
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ' +
                (selectedCategory === c.id
                  ? 'bg-brand-50 font-bold text-brand-700 ring-1 ring-brand-200'
                  : 'text-ink-700 hover:bg-ink-100')
              }
            >
              <span aria-hidden>{c.icon}</span>
              <span className="truncate">{categoryName(c, locale)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-ink-800">
          {t('priceRange')}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={t('priceMin')}
            defaultValue={minPrice ?? ''}
            onBlur={(e) => update({ min: e.target.value || undefined })}
            className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          />
          <span className="text-ink-400">—</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={t('priceMax')}
            defaultValue={maxPrice ?? ''}
            onBlur={(e) => update({ max: e.target.value || undefined })}
            className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          />
        </div>
      </div>
    </aside>
  );
}
