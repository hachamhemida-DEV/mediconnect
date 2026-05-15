import { setRequestLocale, getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { formatDZD } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ locale: string }>; }

export default async function AdminOrdersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  const currencyLoc = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      buyer: { select: { fullName: true, email: true } },
      items: { include: { product: { select: { nameFr: true, nameAr: true, nameEn: true } } } },
    },
  });

  const statusColors: Record<string, string> = {
    pending:    'bg-amber-100 text-amber-700',
    confirmed:  'bg-blue-100 text-blue-700',
    shipped:    'bg-violet-100 text-violet-700',
    delivered:  'bg-emerald-100 text-emerald-700',
    cancelled:  'bg-red-100 text-red-700',
  };

  return (
    <>
      <h1 className="mb-2 text-3xl font-extrabold text-ink-900 md:text-4xl">{t('nav.orders')}</h1>
      <p className="mb-8 text-ink-600">Gérer et suivre toutes les commandes de la plateforme</p>

      {orders.length === 0 ? (
        <div className="card-mc p-10 text-center text-ink-500">Aucune commande pour le moment.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-xs font-bold uppercase tracking-wider text-ink-500">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Acheteur</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Paiement</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-ink-100 transition hover:bg-ink-50">
                  <td className="px-4 py-3 font-mono text-xs text-ink-500">{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink-900">{o.buyer.fullName}</div>
                    <div className="text-xs text-ink-400">{o.buyer.email}</div>
                  </td>
                  <td className="px-4 py-3 font-bold text-ink-900">{formatDZD(o.totalDZD, currencyLoc)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-700">
                      {o.paymentMethod}
                    </span>
                    {o.paymentVerified && <span className="ml-1 text-emerald-500">✓</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusColors[o.status] ?? 'bg-ink-100 text-ink-700'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">
                    {new Date(o.createdAt).toLocaleDateString(currencyLoc)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
