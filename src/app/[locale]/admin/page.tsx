import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { prisma } from '@/lib/prisma';
import { formatDZD } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ locale: string }>; }

export default async function AdminOverviewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  const currencyLoc = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';

  const [
    totalUsers, totalBuyers, totalSuppliers, totalDelivery,
    pendingSuppliers, pendingCCPOrders, pendingRfqs,
    totalProducts, totalOrders, revenueRows,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'buyer' } }),
    prisma.user.count({ where: { role: 'supplier' } }),
    prisma.user.count({ where: { role: 'delivery' } }),
    prisma.supplier.count({ where: { verifyStatus: 'pending' } }),
    prisma.order.count({ where: { paymentMethod: 'ccp', paymentVerified: false } }),
    prisma.rfq.count({ where: { status: 'open' } }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalDZD: true },
      where: { status: { not: 'cancelled' } },
    }),
  ]);
  const revenue = revenueRows._sum.totalDZD ?? 0;

  const kpis = [
    { key: 'users',     value: totalUsers,   color: 'text-brand-600',  bg: 'bg-brand-100',  icon: '👥', sub: `${totalBuyers}B · ${totalSuppliers}S · ${totalDelivery}D` },
    { key: 'products',  value: totalProducts,color: 'text-sky-600',    bg: 'bg-sky-100',    icon: '📦' },
    { key: 'orders',    value: totalOrders,  color: 'text-violet-600', bg: 'bg-violet-100', icon: '🧾' },
    { key: 'revenue',   value: revenue,      color: 'text-emerald-600',bg: 'bg-emerald-100',icon: '💰', money: true },
  ];

  const queues = [
    { key: 'pendingSuppliers', value: pendingSuppliers, href: '/admin/suppliers', color: 'bg-amber-500', icon: '🏬' },
    { key: 'pendingPayments',  value: pendingCCPOrders, href: '/admin/payments',  color: 'bg-red-500',   icon: '💳' },
    { key: 'openRfqs',         value: pendingRfqs,      href: '/admin/rfqs',      color: 'bg-violet-500',icon: '💬' },
  ];

  return (
    <>
      <h1 className="mb-2 text-3xl font-extrabold text-ink-900 md:text-4xl">{t('overview.title')}</h1>
      <p className="mb-8 text-ink-600">{t('overview.subtitle')}</p>

      {/* KPI cards */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ key, value, color, bg, icon, money, sub }) => (
          <div key={key} className="card-mc p-5">
            <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${bg} text-xl`}>{icon}</div>
            <div className={`text-3xl font-extrabold ${color}`}>
              {money ? formatDZD(value, currencyLoc) : new Intl.NumberFormat(currencyLoc).format(value)}
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-500">
              {t(`overview.kpi.${key}`)}
            </div>
            {sub && <div className="mt-1 text-[11px] text-ink-400">{sub}</div>}
          </div>
        ))}
      </section>

      {/* Action queues */}
      <h2 className="mb-3 text-xl font-bold text-ink-900">{t('overview.queuesTitle')}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {queues.map(({ key, value, href, color, icon }) => (
          <Link key={key} href={href} className="card-mc p-5 transition hover:-translate-y-1 hover:shadow-card-lg">
            <div className={`mb-3 inline-grid h-10 w-10 place-items-center rounded-xl ${color} text-white text-xl`}>{icon}</div>
            <div className="text-2xl font-extrabold text-ink-900">
              {value}
              {value > 0 && <span className="ms-2 text-xs font-semibold text-red-600">● pending</span>}
            </div>
            <div className="mt-1 text-sm font-semibold text-ink-700">
              {t(`overview.queue.${key}`)}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
