import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { findUsedListing } from '@/lib/db-phase2';
import { findCategory, categoryName } from '@/lib/seed';
import { WILAYAS, wilayaName } from '@/lib/wilayas';
import { formatDZD } from '@/lib/utils';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function UsedListingPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const listing = await findUsedListing(id);
  if (!listing || !listing.active) notFound();

  const cat = findCategory(listing.categoryId);
  const wilaya = WILAYAS.find((w) => w.code === listing.wilayaCode);
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
        <div className="container-mc py-10">
          <Link href="/used" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-flip-on-rtl aria-hidden>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t('title')}
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-ink-50 to-ink-100 text-8xl shadow-card">
              {cat?.icon ?? '📦'}
            </div>

            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${conditionClasses[listing.condition]}`}>
                  {t(`conditions.${listing.condition}`)}
                </span>
                {cat && (
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
                    {cat.icon} {categoryName(cat, activeLocale)}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-extrabold leading-tight text-ink-900 md:text-4xl">
                {listing.title}
              </h1>

              <div className="mt-5 text-4xl font-extrabold text-brand-700">
                {formatDZD(listing.price, currencyLoc)}
              </div>

              <p className="mt-6 leading-relaxed text-ink-700">{listing.description}</p>

              <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-white p-5 ring-1 ring-ink-200">
                {listing.yearOfManufacture && (
                  <div>
                    <dt className="text-xs text-ink-500">{t('yearOfManufacture')}</dt>
                    <dd className="mt-1 font-bold text-ink-900">{listing.yearOfManufacture}</dd>
                  </div>
                )}
                {wilaya && (
                  <div>
                    <dt className="text-xs text-ink-500">{t('form.wilaya')}</dt>
                    <dd className="mt-1 font-bold text-ink-900">📍 {wilayaName(wilaya, activeLocale)}</dd>
                  </div>
                )}
              </dl>

              <a
                href={`tel:${listing.phone}`}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 font-semibold text-white shadow-card transition hover:bg-brand-600"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
                </svg>
                {t('contactSeller')} — {listing.phone}
              </a>

              <p className="mt-4 rounded-xl bg-amber-50 p-4 text-xs text-amber-900 ring-1 ring-amber-200">
                ⚠️ {t('form.disclaimer')}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
