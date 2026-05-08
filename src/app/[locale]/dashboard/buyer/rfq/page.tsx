import { setRequestLocale, getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getSession } from '@/lib/auth';
import { listRfqsForBuyer } from '@/lib/db-phase2';
import { findCategory, categoryName } from '@/lib/seed';
import { WILAYAS, wilayaName } from '@/lib/wilayas';
import { formatDZD } from '@/lib/utils';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function RfqListPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  // Dashboard layout already guards for auth
  const rfqs = session ? await listRfqsForBuyer(session.sub) : [];

  const t = await getTranslations('rfq');
  const activeLocale = await getLocale();
  const currencyLoc = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';

  const statusColors: Record<string, string> = {
    open:      'bg-emerald-100 text-emerald-700',
    closed:    'bg-ink-200     text-ink-700',
    fulfilled: 'bg-brand-100   text-brand-700',
  };

  return (
    <>
      <div className="mb-8 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900 md:text-4xl">{t('title')}</h1>
          <p className="mt-2 text-ink-600">{t('subtitle')}</p>
        </div>
        <Link
          href="/dashboard/buyer/rfq/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white shadow-card transition hover:bg-brand-600"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          {t('createNew')}
        </Link>
      </div>

      {rfqs.length === 0 ? (
        <div className="card-mc flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-brand-600">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-bold text-ink-900">{t('empty')}</h3>
        </div>
      ) : (
        <div className="grid gap-4">
          {rfqs.map((rfq) => {
            const cat = findCategory(rfq.categoryId);
            const wilaya = WILAYAS.find((w) => w.code === rfq.wilayaCode);
            return (
              <article key={rfq.id} className="card-mc p-5 transition hover:shadow-card-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-1.5 flex items-center gap-2 text-xs">
                      <span className={`rounded-full px-2.5 py-0.5 font-bold ${statusColors[rfq.status] ?? ''}`}>
                        {t(`status.${rfq.status}`)}
                      </span>
                      {cat && (
                        <span className="text-ink-500">
                          <span aria-hidden>{cat.icon}</span> {categoryName(cat, activeLocale)}
                        </span>
                      )}
                      {wilaya && <span className="text-ink-500">· 📍 {wilayaName(wilaya, activeLocale)}</span>}
                    </div>
                    <h3 className="text-base font-bold text-ink-900">{rfq.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-ink-600">{rfq.description}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                      <span>📦 {rfq.quantity}</span>
                      {rfq.budgetMax && <span>💰 ≤ {formatDZD(rfq.budgetMax, currencyLoc)}</span>}
                      <span>💬 {t('repliesCount', { count: rfq.replies.length })}</span>
                    </div>
                  </div>
                </div>
                {rfq.replies.length === 0 && (
                  <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500">
                    {t('noReplies')}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
