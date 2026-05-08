import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations, getLocale } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { WILAYAS, wilayaName } from '@/lib/wilayas';
import { formatDZD } from '@/lib/utils';
import { ShipmentStatusSelect } from '@/components/delivery/ShipmentStatusSelect';

interface Props { params: Promise<{ locale: string }>; }

export default async function DeliveryDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session) redirect(`/${locale}/auth/login`);
  if (session.role !== 'delivery' && session.role !== 'admin') {
    redirect(`/${locale}/`);
  }

  const t   = await getTranslations('delivery.dashboard');
  const ts  = await getTranslations('delivery.status');
  const activeLocale = await getLocale();
  const currencyLoc = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';

  // All shipments (admins see everything; for a logged-in delivery company
  // in a real deployment we'd filter by deliveryCompanyId matched to the user).
  const shipments = await prisma.shipment.findMany({
    include: {
      order: {
        include: { user: { select: { fullName: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
    take:    100,
  });

  const counts = {
    pending:    shipments.filter((s) => s.status === 'pending').length,
    inTransit:  shipments.filter((s) => s.status === 'in_transit' || s.status === 'picked_up').length,
    delivered:  shipments.filter((s) => s.status === 'delivered').length,
  };
  const revenue = shipments
    .filter((s) => s.status === 'delivered')
    .reduce((sum, s) => sum + Math.round(s.order.totalDZD * 0.05), 0); // 5% delivery commission mock

  const statusStyles: Record<string, string> = {
    pending:    'bg-amber-100 text-amber-700',
    picked_up:  'bg-sky-100 text-sky-700',
    in_transit: 'bg-sky-100 text-sky-700',
    delivered:  'bg-emerald-100 text-emerald-700',
    failed:     'bg-red-100 text-red-700',
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-ink-50">
        <div className="container-mc py-10">
          <header className="mb-8">
            <h1 className="text-3xl font-extrabold text-ink-900 md:text-4xl">{t('title')}</h1>
            <p className="mt-2 text-ink-600">{t('subtitle')}</p>
          </header>

          {/* Stats */}
          <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={t('stats.pending')}   value={counts.pending}   bg="bg-amber-100"   text="text-amber-700"   icon="⏳" />
            <StatCard label={t('stats.inTransit')} value={counts.inTransit} bg="bg-sky-100"     text="text-sky-700"     icon="🚚" />
            <StatCard label={t('stats.delivered')} value={counts.delivered} bg="bg-emerald-100" text="text-emerald-700" icon="✓"  />
            <StatCard label={t('stats.revenue')}   value={formatDZD(revenue, currencyLoc)} bg="bg-brand-100"  text="text-brand-700" icon="💰" />
          </section>

          {/* Shipments table */}
          <section>
            <h2 className="mb-3 text-xl font-bold text-ink-900">{t('shipments')}</h2>
            {shipments.length === 0 ? (
              <div className="card-mc p-10 text-center text-ink-500">{t('noShipments')}</div>
            ) : (
              <div className="card-mc overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-ink-50 text-start text-xs uppercase tracking-wider text-ink-500">
                    <tr>
                      <th className="px-5 py-3 text-start">{t('orderId')}</th>
                      <th className="px-5 py-3 text-start">{t('destination')}</th>
                      <th className="px-5 py-3 text-end">DZD</th>
                      <th className="px-5 py-3 text-start">{t('status')}</th>
                      <th className="px-5 py-3 text-end">{t('action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {shipments.map((s) => {
                      const wilaya = WILAYAS.find((w) => w.code === s.order.wilayaCode);
                      return (
                        <tr key={s.id}>
                          <td className="px-5 py-3 font-mono text-xs text-ink-500">
                            #{s.orderId.slice(-8)}
                          </td>
                          <td className="px-5 py-3 text-ink-800">
                            <div className="font-semibold">{s.order.user.fullName}</div>
                            <div className="text-xs text-ink-500">
                              📍 {wilaya ? wilayaName(wilaya, activeLocale) : `#${s.order.wilayaCode}`}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-end font-bold text-brand-700">
                            {formatDZD(s.order.totalDZD, currencyLoc)}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusStyles[s.status]}`}>
                              {ts(s.status as 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'failed')}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-end">
                            <ShipmentStatusSelect shipmentId={s.id} currentStatus={s.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function StatCard({
  label, value, bg, text, icon,
}: { label: string; value: string | number; bg: string; text: string; icon: string }) {
  return (
    <div className="card-mc p-5">
      <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${bg} ${text} text-xl`}>{icon}</div>
      <div className="text-2xl font-extrabold text-ink-900">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</div>
    </div>
  );
}
