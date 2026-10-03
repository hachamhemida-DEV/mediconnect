import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import { listProducts, countProducts } from '@/lib/catalog';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/catalog/ProductCard';
import { CatalogFilters } from '@/components/catalog/CatalogFilters';
import { CatalogSearchBar } from '@/components/catalog/CatalogSearchBar';
import { SponsoredSlot } from '@/components/ads/SponsoredSlot';
import { Link } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 24;

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
  const page     = Math.max(1, Number(single(sp.page)) || 1);

  const t = await getTranslations('catalog');

  const filterOpts = {
    categoryId: category,
    minPrice:   min ? Number(min) : undefined,
    maxPrice:   max ? Number(max) : undefined,
    q,
  };

  // Run product listing + count in parallel for speed
  const [products, totalCount] = await Promise.all([
    listProducts({
      ...filterOpts,
      sort: sort as 'featured' | 'priceAsc' | 'priceDesc' | 'rating' | 'newest',
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    countProducts(filterOpts),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Build pagination URL helper
  function pageUrl(p: number) {
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (category) sp.set('category', category);
    if (min) sp.set('min', min);
    if (max) sp.set('max', max);
    if (sort && sort !== 'featured') sp.set('sort', sort);
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return qs ? `/catalog?${qs}` : '/catalog';
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
                  {t('resultsCount', { count: totalCount })}
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
                <>
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav className="mt-8 flex items-center justify-center gap-2">
                      {page > 1 && (
                        <Link
                          href={pageUrl(page - 1)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 hover:border-brand-300"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M15 18l-6-6 6-6" />
                          </svg>
                          {t('previous') ?? 'Previous'}
                        </Link>
                      )}

                      <span className="rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-bold text-brand-700 ring-1 ring-brand-200">
                        {page} / {totalPages}
                      </span>

                      {page < totalPages && (
                        <Link
                          href={pageUrl(page + 1)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 hover:border-brand-300"
                        >
                          {t('next') ?? 'Next'}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </Link>
                      )}
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

