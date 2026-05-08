import { setRequestLocale, getTranslations, getLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { VerifyPaymentActions } from '@/components/admin/VerifyPaymentActions';
import { WILAYAS, wilayaName } from '@/lib/wilayas';
import { formatDZD } from '@/lib/utils';

interface Props { params: Promise<{ locale: string }>; }

export default async function AdminPaymentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('admin.payments');
  const activeLocale = await getLocale();
  const currencyLoc = locale === 'ar' ? 'ar-DZd' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';

  const [pending, verified] = await Promise.all([
    prisma.order.findMany({
      where:   { paymentMethod: 'ccp', paymentVerified: false },
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.findMany({
      where:   { paymentMethod: 'ccp', paymentVerified: true },
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { updatedAt: 'desc' },
      take:    20,
    }),
  ]);

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
            {pending.map((o) => {
              const wilaya = WILAYAS.find((w) => w.code === o.wilayaCode);
              return (
                <article key={o.id} className="card-mc p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-ink-500">#{o.id.slice(-8)}</span>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase text-amber-700">CCP</span>
                      </div>
                      <h3 className="mt-1 text-base font-bold text-ink-900">
                        {o.user.fullName}
                      </h3>
                      <div className="mt-0.5 text-sm text-ink-500">{o.user.email}</div>

                      <dl className="mt-3 grid gap-2 text-xs text-ink-600 sm:grid-cols-3">
                        <div>
                          <dt className="uppercase tracking-wider text-ink-400">{t('amount')}</dt>
                          <dd className="mt-0.5 font-bold text-brand-700">{formatDZD(o.totalDZD, currencyLoc)}</dd>
                        </div>
                        <div>
                          <dt className="uppercase tracking-wider text-ink-400">📍</dt>
                          <dd className="mt-0.5 text-ink-700">{wilaya ? wilayaName(wilaya, activeLocale) : `#${o.wilayaCode}`}</dd>
                        </div>
                        <div>
                          <dt className="uppercase tracking-wider text-ink-400">📅</dt>
                          <dd className="mt-0.5 text-ink-700">{new Date(o.createdAt).toLocaleDateString(activeLocale)}</dd>
                        </div>
                      </dl>

                      <div className="mt-3">
                        <dt className="mb-1 text-[11px] font-bold uppercase tracking-wider text-ink-400">{t('proof')}</dt>
                        {o.paymentProofUrl ? (
                          <a
                            href={o.paymentProofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-100"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                            </svg>
                            {t('viewProof')}
                          </a>
                        ) : (
                          <span className="inline-flex items-center rounded-lg bg-ink-100 px-3 py-1.5 text-sm font-semibold text-ink-500">
                            {t('noProof')}
                          </span>
                        )}
                      </div>
                    </div>

                    {o.paymentProofUrl && <VerifyPaymentActions orderId={o.id} />}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-bold text-ink-900">{t('verified')}</h2>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
            {verified.length}
          </span>
        </div>
        <div className="card-mc overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-start text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-5 py-3 text-start">#</th>
                <th className="px-5 py-3 text-start">{t('buyer')}</th>
                <th className="px-5 py-3 text-end">{t('amount')}</th>
                <th className="px-5 py-3 text-center">—</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {verified.map((o) => (
                <tr key={o.id}>
                  <td className="px-5 py-3 font-mono text-xs text-ink-500">#{o.id.slice(-8)}</td>
                  <td className="px-5 py-3 text-ink-800">{o.user.fullName}</td>
                  <td className="px-5 py-3 text-end font-bold text-brand-700">
                    {formatDZD(o.totalDZD, currencyLoc)}
                  </td>
                  <td className="px-5 py-3 text-center text-emerald-600">✓</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
