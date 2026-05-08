import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getSession } from '@/lib/auth';
import { listProducts, findSupplierByUserId } from '@/lib/catalog';
import { productName, categoryName } from '@/lib/seed';
import { prisma } from '@/lib/prisma';
import { formatDZD } from '@/lib/utils';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function SupplierDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session) redirect(`/${locale}/auth/login`);

  const t = await getTranslations('supplier');
  const tc = await getTranslations('catalog');
  const activeLocale = await getLocale();
  const currencyLoc = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';
  const firstName = session.fullName.split(' ')[0] ?? '';

  // Resolve the supplier row for the signed-in user (admin can impersonate for demo)
  const supplier = await findSupplierByUserId(session.sub)
    ?? await prisma.supplier.findFirst().then((s) => s ? {
        id: s.id, businessName: s.businessName, wilayaCode: s.wilayaCode,
        plan: s.plan as 'basic' | 'pro' | 'gold' | 'enterprise',
        verified: true as const, rating: s.rating,
        reviewsCount: s.reviewsCount, memberSince: s.memberSince.toISOString(),
      } : undefined);

  if (!supplier) {
    return <p className="p-10 text-ink-600">No supplier profile.</p>;
  }

  const myProducts = await listProducts({ supplierId: supplier.id });

  // Pull recent metrics from DB
  const [orderCount, rfqCount, revenueRow, categories] = await Promise.all([
    prisma.orderItem.count({ where: { product: { supplierId: supplier.id } } }),
    prisma.rfqReply.count({ where: { supplierId: supplier.id } }),
    prisma.orderItem.aggregate({
      where: { product: { supplierId: supplier.id }, order: { status: { not: 'cancelled' } } },
      _sum: { priceSnapshot: true, quantity: true },
    }),
    prisma.category.findMany(),
  ]);
  const revenue = (revenueRow._sum.priceSnapshot ?? 0) * (revenueRow._sum.quantity ?? 0 ? 1 : 1);
  // Above: simple approximation — real revenue calc would sum price * qty per line.
  const realRevenue = await prisma.orderItem.findMany({
    where: { product: { supplierId: supplier.id }, order: { status: { not: 'cancelled' } } },
    select: { priceSnapshot: true, quantity: true },
  });
  const trueRevenue = realRevenue.reduce((sum, it) => sum + it.priceSnapshot * it.quantity, 0);

  const planColors: Record<string, string> = {
    basic: 'bg-ink-100 text-ink-700',
    pro:   'bg-sky-100 text-sky-700',
    gold:  'bg-gradient-to-r from-amber-400 to-orange-500 text-white',
    enterprise: 'bg-gradient-to-r from-violet-600 to-purple-700 text-white',
  };

  const stats = [
    { key: 'products', value: myProducts.length,  Icon: GridIcon,   color: 'text-brand-600',   bg: 'bg-brand-100' },
    { key: 'orders',   value: orderCount,         Icon: BoxIcon,    color: 'text-sky-600',     bg: 'bg-sky-100' },
    { key: 'rfqs',     value: rfqCount,           Icon: ChatIcon,   color: 'text-violet-600',  bg: 'bg-violet-100' },
    { key: 'revenue',  value: trueRevenue,        Icon: CoinIcon,   color: 'text-emerald-600', bg: 'bg-emerald-100', money: true },
    { key: 'rating',   value: supplier.rating,    Icon: StarIcon,   color: 'text-amber-600',   bg: 'bg-amber-100',   rating: true },
  ];

  return (
    <>
      <header className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900 md:text-4xl">
            {t('greeting', { name: firstName })}
          </h1>
          <p className="mt-2 text-ink-600">{t('welcome')}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white p-3 shadow-card ring-1 ring-ink-200">
            <div className="text-xs uppercase tracking-wider text-ink-500">{t('plan')}</div>
            <div className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${planColors[supplier.plan] ?? planColors.basic}`}>
              {supplier.plan === 'gold' && '★'}
              {supplier.plan.toUpperCase()}
            </div>
          </div>
          <Link
            href="/#pricing"
            className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600"
          >
            {t('upgradePlan')}
          </Link>
        </div>
      </header>

      <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(({ key, value, Icon, color, bg, money, rating }) => (
          <div key={key} className="card-mc p-5">
            <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${bg} ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-extrabold text-ink-900">
              {money
                ? formatDZD(value, currencyLoc)
                : rating
                ? `★ ${value.toFixed(1)}`
                : new Intl.NumberFormat(currencyLoc).format(value)}
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-500">
              {t(`stats.${key}`)}
            </div>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink-900">{t('myProducts')}</h2>
          <Link
            href="/dashboard/supplier/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t('addProduct')}
          </Link>
        </div>

        {myProducts.length === 0 ? (
          <div className="card-mc p-10 text-center text-ink-500">{t('noProducts')}</div>
        ) : (
          <div className="card-mc overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-start text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-5 py-3 text-start">#</th>
                  <th className="px-5 py-3 text-start">{tc('category')}</th>
                  <th className="px-5 py-3 text-start">{t('stats.rating')}</th>
                  <th className="px-5 py-3 text-end">DZD</th>
                  <th className="px-5 py-3 text-center">Stock</th>
                  <th className="px-5 py-3 text-center">★</th>
                  <th className="px-5 py-3 text-end">—</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {myProducts.map((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId);
                  return (
                    <tr key={p.id} className="transition hover:bg-ink-50">
                      <td className="px-5 py-3">
                        <Link href={`/catalog/${p.id}`} className="flex items-center gap-2.5">
                          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-100 text-lg">
                            {cat?.icon ?? '📦'}
                          </span>
                          <span className="line-clamp-1 font-semibold text-ink-900">
                            {productName(p, activeLocale)}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-ink-600">{cat ? categoryName(cat, activeLocale) : '—'}</td>
                      <td className="px-5 py-3 text-ink-600">{p.brand}</td>
                      <td className="px-5 py-3 text-end font-bold text-brand-700">
                        {formatDZD(p.price, currencyLoc)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={
                          'inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ' +
                          (p.stock > 10 ? 'bg-emerald-100 text-emerald-700'
                            : p.stock > 0 ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700')
                        }>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-amber-500">
                        {p.rating.toFixed(1)}
                      </td>
                      <td className="px-5 py-3 text-end">
                        <Link
                          href={`/dashboard/supplier/products/${p.id}/edit`}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function GridIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
}
function BoxIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3 3 8v8l9 5 9-5V8z" /><path d="m3 8 9 5 9-5" /></svg>;
}
function ChatIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z" /></svg>;
}
function CoinIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v10M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1.1-3 2.5S10.3 12 12 12s3 1.1 3 2.5-1.3 2.5-3 2.5-3-1.1-3-2.5" /></svg>;
}
function StarIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2l2.6 6.2L21 9l-5 4.3L17.2 20 12 16.8 6.8 20 8 13.3 3 9l6.4-.8L12 2z" /></svg>;
}
