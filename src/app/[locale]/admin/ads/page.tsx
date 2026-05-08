import { setRequestLocale, getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { formatDZD } from '@/lib/utils';
import { AdModerateActions } from '@/components/admin/AdModerateActions';

interface Props { params: Promise<{ locale: string }>; }

export default async function AdminAdsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('admin.ads');
  const currencyLoc = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';

  const [pending, active] = await Promise.all([
    prisma.adCampaign.findMany({
      where:   { active: false, endsAt: { gt: new Date() } },
      include: { supplier: { select: { businessName: true, plan: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.adCampaign.findMany({
      where:   { active: true, endsAt: { gt: new Date() } },
      include: { supplier: { select: { businessName: true, plan: true } } },
      orderBy: { createdAt: 'desc' },
      take:    30,
    }),
  ]);

  const planBadge = (plan: string) =>
    plan === 'gold' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' :
    plan === 'pro'  ? 'bg-sky-100 text-sky-700' :
                      'bg-ink-100 text-ink-700';

  return (
    <>
      <h1 className="mb-2 text-3xl font-extrabold text-ink-900 md:text-4xl">{t('title')}</h1>
      <p className="mb-8 text-ink-600">{t('subtitle')}</p>

      <section className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-bold text-ink-900">{t('pending')}</h2>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
            {pending.length}
          </span>
        </div>

        {pending.length === 0 ? (
          <div className="card-mc p-6 text-center text-ink-500">{t('noPending')}</div>
        ) : (
          <div className="grid gap-3">
            {pending.map((c) => (
              <article key={c.id} className="card-mc p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className={`rounded-full px-2 py-0.5 font-bold uppercase ${planBadge(c.supplier.plan)}`}>
                        {c.supplier.plan}
                      </span>
                      <span className="rounded-full bg-ink-100 px-2 py-0.5 font-bold uppercase">{c.placement.replace('_', ' ')}</span>
                      <span className="rounded-full bg-ink-100 px-2 py-0.5 font-bold uppercase">{c.model}</span>
                    </div>
                    <h3 className="text-base font-bold text-ink-900">{c.supplier.businessName}</h3>

                    <dl className="mt-3 grid gap-3 text-xs text-ink-600 sm:grid-cols-3">
                      <div>
                        <dt className="uppercase tracking-wider text-ink-400">{t('budget')}</dt>
                        <dd className="mt-0.5 font-bold text-brand-700">
                          {formatDZD(c.budgetDZD, currencyLoc)}
                        </dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-wider text-ink-400">{t('starts')}</dt>
                        <dd className="mt-0.5 text-ink-700">{c.startsAt.toLocaleDateString(locale)}</dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-wider text-ink-400">{t('ends')}</dt>
                        <dd className="mt-0.5 text-ink-700">{c.endsAt.toLocaleDateString(locale)}</dd>
                      </div>
                    </dl>
                  </div>
                  <AdModerateActions adId={c.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-bold text-ink-900">{t('active')}</h2>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
            {active.length}
          </span>
        </div>
        {active.length === 0 ? (
          <div className="card-mc p-6 text-center text-ink-500">{t('noActive')}</div>
        ) : (
          <div className="card-mc overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-start text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-5 py-3 text-start">{t('supplier')}</th>
                  <th className="px-5 py-3 text-start">{t('placement')}</th>
                  <th className="px-5 py-3 text-end">{t('budget')}</th>
                  <th className="px-5 py-3 text-center">{t('impressions')}</th>
                  <th className="px-5 py-3 text-center">{t('clicks')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {active.map((c) => (
                  <tr key={c.id}>
                    <td className="px-5 py-3 text-ink-800">{c.supplier.businessName}</td>
                    <td className="px-5 py-3 text-ink-600">{c.placement}</td>
                    <td className="px-5 py-3 text-end font-bold text-brand-700">
                      {formatDZD(c.budgetDZD, currencyLoc)}
                    </td>
                    <td className="px-5 py-3 text-center">{c.impressions.toLocaleString(currencyLoc)}</td>
                    <td className="px-5 py-3 text-center">{c.clicks.toLocaleString(currencyLoc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
