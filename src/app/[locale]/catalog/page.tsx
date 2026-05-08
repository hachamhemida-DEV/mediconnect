import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import { listProducts } from '@/lib/catalog';
import { productName, productDesc } from '@/lib/seed';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/catalog/ProductCard';
import { CatalogFilters } from '@/components/catalog/CatalogFilters';
import { CatalogSearchBar } from '@/components/catalog/CatalogSearchBar';
import { SponsoredSlot } from '@/components/ads/SponsoredSlot';
import type { Product } from '@/lib/types';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function single(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function CatalogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const q        = single(sp.q);
  const category = single(sp.category);
  const min      = single(sp.min);
  const max      = single(sp.max);
  const sort     = single(sp.sort) ?? 'featured';

  const t = await getTranslations('catalog');
  const activeLocale = await getLocale();

  // Filter + sort at the DB level
  let products: Product[] = await listProducts({
    categoryId: category,
    minPrice:   min ? Number(min) : undefined,
    maxPrice:   max ? Number(max) : undefined,
    q,
    sort:       sort as 'featured' | 'priceAsc' | 'priceDesc' | 'rating' | 'newest',
  });

  // Arabic/French/English search still needs a case-insensitive pass (SQLite
  // `contains` is case-sensitive by default). Do a best-effort client-side
  // refinement when a query is present.
  if (q) {
    const needle = q.toLowerCase();
    products = products.filter((p) =>
      productName(p, activeLocale).toLowerCase().includes(needle) ||
      productDesc(p, activeLocale).toLowerCase().includes(needle) ||
      p.brand.toLowerCase().includes(needle),
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-ink-50">
        {/* Page header */}
        <div className="border-b border-ink-200 bg-white">
          <div className="container-mc py-10">
            <h1 className="text-3xl font-extrabold text-ink-900 md:text-4xl">
              {t('title')}
            </h1>
            <p className="mt-2 max-w-2xl text-ink-600">{t('subtitle')}</p>

            <div className="mt-6">
              <CatalogSearchBar initial={q} />
            </div>
          </div>
        </div>

        {/* Content: sidebar + grid */}
        <div className="container-mc py-10">
          <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
            <CatalogFilters
              selectedCategory={category}
              minPrice={min}
              maxPrice={max}
              q={q}
              sort={sort}
            />

            <div>
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-semibold text-ink-600">
                  {t('resultsCount', { count: products.length })}
                </p>
              </div>

              {/* Sponsored slot — renders null if no active campaigns */}
              <SponsoredSlot placement="search_top" categoryId={category} limit={3} />

              {products.length === 0 ? (
                <div className="card-mc flex flex-col items-center justify-center px-6 py-20 text-center">
                  <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-ink-100 text-ink-400">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="11" cy="11" r="7" />
                      <path d="m21 21-4.5-4.5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-ink-900">{t('noResults')}</h3>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
