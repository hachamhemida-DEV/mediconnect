import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDZD } from '@/lib/utils';

interface Props { params: Promise<{ locale: string }>; }

export default async function SupplierAdsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session) redirect(`/${locale}/auth/login`);
  if (session.role !== 'supplier') redirect(`/${locale}/`);

  const t = await getTranslations('ads.supplier');
  const currencyLoc = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';

  const supplier = await prisma.supplier.findUnique({ where: { userId: session.sub } });
  if (!supplier) redirect(`/${locale}/dashboard/supplier`);

  const campaigns = await prisma.adCampaign.findMany({
    where:   { supplierId: supplier!.id },
    orderBy: { createdAt: 'desc' },
    include: {
      // productId is optional so we `include` nothing; product lookup happens lazily
    },
  });

  const placementLabels: Record<string, string> = {
    search_top:       t('placements.search_top'),
    homepage_banner:  t('placements.homepage_banner'),
    category_sidebar: t('placements.category_sidebar'),
  };

  const canBuyAds = supplier.plan !== 'basic';

  return (
    <>
      <header className="mb-8 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900 md:text-4xl">{t('title')}</h1>
          <p className="mt-2 text-ink-600">{t('subtitle')}</p>
        </div>
        {canBuyAds ? (
          <Link
            href="/dashboard/supplier/ads/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white shadow-card transition hover:bg-brand-600"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t('newCampaign')}
          </Link>
        ) : (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
            {t('basicPlanNotice')}
          </div>
        )}
      </header>

      {campaigns.length === 0 ? (
        <div className="card-mc flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-3xl">📣</div>
          <h3 className="mt-4 text-lg font-bold text-ink-900">{t('empty')}</h3>
          <p className="mt-1 max-w-md text-sm text-ink-500">{t('emptyHint')}</p>
        </div>
      ) : (
        <div className="card-mc overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-start text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-5 py-3 text-start">{t('cols.placement')}</th>
                <th className="px-5 py-3 text-start">{t('cols.model')}</th>
                <th className="px-5 py-3 text-end">{t('cols.budget')}</th>
                <th className="px-5 py-3 text-center">{t('cols.impressions')}</th>
                <th className="px-5 py-3 text-center">{t('cols.clicks')}</th>
                <th className="px-5 py-3 text-center">{t('cols.ctr')}</th>
                <th className="px-5 py-3 text-center">{t('cols.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {campaigns.map((c) => {
                const ctr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
                const now = new Date();
                const isLive = c.active && c.startsAt <= now && c.endsAt >= now;
                const isEnded = c.endsAt < now;
                return (
                  <tr key={c.id} className="transition hover:bg-ink-50">
                    <td className="px-5 py-3 text-ink-800">{placementLabels[c.placement]}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-bold uppercase">{c.model}</span>
                    </td>
                    <td className="px-5 py-3 text-end font-bold text-brand-700">
                      {formatDZD(c.budgetDZD, currencyLoc)}
                    </td>
                    <td className="px-5 py-3 text-center text-ink-700">
                      {c.impressions.toLocaleString(currencyLoc)}
                    </td>
                    <td className="px-5 py-3 text-center text-ink-700">
                      {c.clicks.toLocaleString(currencyLoc)}
                    </td>
                    <td className="px-5 py-3 text-center text-ink-700">
                      {ctr.toFixed(2)}%
                    </td>
                    <td className="px-5 py-3 text-center">
                      {isEnded ? (
                        <span className="rounded-full bg-ink-200 px-2.5 py-0.5 text-[11px] font-bold text-ink-700">
                          {t('status.ended')}
                        </span>
                      ) : isLive ? (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                          ● {t('status.live')}
                        </span>
                      ) : c.active ? (
                        <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-700">
                          {t('status.scheduled')}
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                          {t('status.pending')}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
