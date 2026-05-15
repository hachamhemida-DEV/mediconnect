import { getSession } from '@/lib/auth';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatDZD } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ locale: string }>; }

export default async function BuyerOrdersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session || session.role !== 'buyer') redirect(`/${locale}/auth/login`);

  const t = await getTranslations('dashboard');
  const currencyLoc = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';

  const orders = await prisma.order.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: 'desc' },
    include: {
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
      <h1 className="mb-2 text-3xl font-extrabold text-ink-900 md:text-4xl">Mes Commandes</h1>
      <p className="mb-8 text-ink-600">Suivez l'état de vos commandes passées sur la plateforme.</p>

      {orders.length === 0 ? (
        <div className="card-mc p-10 text-center text-ink-500">Vous n'avez passé aucune commande pour le moment.</div>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <div key={o.id} className="card-mc flex flex-col p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-ink-900">CMD-{o.id.slice(0, 6)}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusColors[o.status] ?? 'bg-ink-100 text-ink-700'}`}>
                    {o.status}
                  </span>
                </div>
                <div className="text-sm text-ink-600">
                  {new Date(o.createdAt).toLocaleDateString(currencyLoc)} • {o.items.length} produit(s)
                </div>
              </div>
              
              <div className="mt-4 flex flex-col items-start md:mt-0 md:items-end">
                <div className="text-lg font-extrabold text-brand-600">
                  {formatDZD(o.totalDZD, currencyLoc)}
                </div>
                <div className="text-xs font-semibold uppercase text-ink-400">
                  {o.paymentMethod} {o.paymentVerified ? '(Vérifié)' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
