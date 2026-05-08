import { setRequestLocale, getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { listUsedListings } from '@/lib/db-phase2';
import { findCategory, categoryName } from '@/lib/seed';
import { WILAYAS, wilayaName } from '@/lib/wilayas';
import { formatDZD } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function UsedMarketPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const listings = await listUsedListings();
  const t = await getTranslations('used');
  const activeLocale = await getLocale();
  const currencyLoc = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';

  const conditionClasses: Record<string, string> = {
    like_new:      'bg-emerald-100 text-emerald-700',
    good:          'bg-sky-100     text-sky-700',
    needs_service: 'bg-amber-100   text-amber-700',
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-ink-50">
        {/* Hero strip */}
        <div className="relative overflow-hidden bg-gradient-to-br from-sky-500 to-brand-500 text-white">
          <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
          <div className="container-mc relative py-12 md:py-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur">
              ♻️ {t('badge')}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold md:text-5xl">{t('title')}</h1>
            <p className="mt-2 max-w-2xl text-white/90 md:text-lg">{t('subtitle')}</p>

            <Link
              href="/dashboard/buyer/used/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 shadow-card-lg transition hover:bg-ink-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
              {t('sellNow')}
            </Link>
          </div>
        </div>

        <div className="container-mc py-10">
          {listings.length === 0 ? (
            <div className="card-mc flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-4xl">♻️</div>
              <h2 className="mt-4 text-lg font-bold text-ink-900">{t('empty')}</h2>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((l) => {
                const cat = findCategory(l.categoryId);
                const wilaya = WILAYAS.find((w) => w.code === l.wilayaCode);
                return (
                  <Link
                    key={l.id}
                    href={`/used/${l.id}`}
                    className="card-mc group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-card-lg"
                  >
                    <div className="relative grid aspect-[4/3] place-items-center bg-gradient-to-br from-ink-50 to-ink-100 text-5xl">
                      {cat?.icon ?? '📦'}
                      <span className={`absolute top-2 start-2 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${conditionClasses[l.condition]}`}>
                        {t(`conditions.${l.condition}`)}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      {cat && (
                        <div className="mb-1 text-xs text-ink-500">
                          {cat.icon} {categoryName(cat, activeLocale)}
                        </div>
                      )}
                      <h3 className="line-clamp-2 text-sm font-bold text-ink-900 group-hover:text-brand-600">
                        {l.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-ink-600">{l.description}</p>
                      <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                        <div>
                          <div className="text-lg font-extrabold text-brand-700">
                            {formatDZD(l.price, currencyLoc)}
                          </div>
                          {wilaya && (
                            <div className="text-[11px] text-ink-500">📍 {wilayaName(wilaya, activeLocale)}</div>
                          )}
                        </div>
                        {l.yearOfManufacture && (
                          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-semibold text-ink-700">
                            {l.yearOfManufacture}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
