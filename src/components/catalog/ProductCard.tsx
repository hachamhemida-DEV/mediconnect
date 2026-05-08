import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { formatDZD } from '@/lib/utils';
import { CATEGORIES, SUPPLIERS, productName, productDesc, categoryName } from '@/lib/seed';
import type { Product } from '@/lib/types';

export function ProductCard({ product }: { product: Product }) {
  const locale = useLocale();
  const t = useTranslations('catalog');
  const tp = useTranslations('product');

  const cat = CATEGORIES.find((c) => c.id === product.categoryId);
  const sup = SUPPLIERS.find((s) => s.id === product.supplierId);

  return (
    <Link
      href={`/catalog/${product.id}`}
      className="card-mc group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-card-lg"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={productName(product, locale)}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-ink-400">
            {cat?.icon ?? '📦'}
          </div>
        )}
        {product.featured && (
          <span className="absolute top-2 start-2 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-card">
            ★ {t('featured')}
          </span>
        )}
        {cat && (
          <span
            className="absolute bottom-2 end-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink-700 backdrop-blur"
          >
            <span aria-hidden>{cat.icon}</span>
            {categoryName(cat, locale)}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 text-xs font-semibold text-ink-500">
          {product.brand}
        </div>
        <h3 className="line-clamp-2 text-sm font-bold text-ink-900 group-hover:text-brand-600">
          {productName(product, locale)}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-600">
          {productDesc(product, locale)}
        </p>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-500">
          <div className="flex items-center gap-0.5 text-amber-400">
            {[0, 1, 2, 3, 4].map((i) => (
              <svg
                key={i}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill={i < Math.round(product.rating) ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M12 2l2.6 6.2L21 9l-5 4.3L17.2 20 12 16.8 6.8 20 8 13.3 3 9l6.4-.8L12 2z" />
              </svg>
            ))}
          </div>
          <span>{product.rating.toFixed(1)}</span>
          <span className="text-ink-400">·</span>
          <span>{tp('reviewsCount', { count: product.reviewsCount })}</span>
        </div>

        {sup && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="12" r="9" /><path d="m9 12 2 2 4-4" />
            </svg>
            <span className="truncate">{sup.businessName}</span>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <div className="text-lg font-extrabold text-brand-700">
              {formatDZD(product.price, locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ')}
            </div>
            {product.stock > 0 ? (
              <div className="text-[11px] font-semibold text-emerald-600">
                {t('inStock', { count: product.stock })}
              </div>
            ) : (
              <div className="text-[11px] font-semibold text-red-600">
                {t('outOfStock')}
              </div>
            )}
          </div>
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-white shadow-card transition group-hover:bg-brand-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" data-flip-on-rtl />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
