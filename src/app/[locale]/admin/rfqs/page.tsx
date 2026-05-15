import { setRequestLocale, getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ locale: string }>; }

export default async function AdminRfqsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  const currencyLoc = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';

  const rfqs = await prisma.rfq.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      buyer: { select: { fullName: true, email: true, wilaya: true } },
    },
  });

  const statusColors: Record<string, string> = {
    open:      'bg-emerald-100 text-emerald-700',
    closed:    'bg-ink-100 text-ink-700',
    fulfilled: 'bg-blue-100 text-blue-700',
  };

  return (
    <>
      <h1 className="mb-2 text-3xl font-extrabold text-ink-900 md:text-4xl">{t('nav.rfqs')}</h1>
      <p className="mb-8 text-ink-600">Toutes les demandes de devis reçues</p>

      {rfqs.length === 0 ? (
        <div className="card-mc p-10 text-center text-ink-500">Aucune demande de devis pour le moment.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-xs font-bold uppercase tracking-wider text-ink-500">
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Acheteur</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Qté</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Réponses</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.map((r) => (
                <tr key={r.id} className="border-b border-ink-100 transition hover:bg-ink-50">
                  <td className="px-4 py-3 font-semibold text-ink-900">{r.title}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink-800">{r.buyer.fullName}</div>
                    <div className="text-xs text-ink-400">{r.buyer.email}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{r.categoryId ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">{r.quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusColors[r.status] ?? 'bg-ink-100 text-ink-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-ink-900">{r.repliesCount}</td>
                  <td className="px-4 py-3 text-xs text-ink-500">
                    {new Date(r.createdAt).toLocaleDateString(currencyLoc)}
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
