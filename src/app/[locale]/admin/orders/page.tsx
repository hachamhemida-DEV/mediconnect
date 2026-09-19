import { setRequestLocale, getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { formatDZD } from '@/lib/utils';
import { OrderActions } from '@/components/admin/OrderActions';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ locale: string }>; }

export default async function AdminOrdersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  const currencyLoc = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { fullName: true, email: true, phone: true } },
      items: {
        include: {
          product: {
            select: {
              nameFr: true,
              nameAr: true,
              nameEn: true,
              brand: true,
            },
          },
        },
      },
    },
  });

  return (
    <>
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900 md:text-4xl">{t('nav.orders')}</h1>
          <p className="mt-1 text-sm text-ink-600">
            {locale === 'ar'
              ? 'متابعة وإدارة جميع طلبات المنصة، تغيير الحالات وحذف الطلبات'
              : locale === 'fr'
              ? 'Gérer et suivre toutes les commandes de la plateforme'
              : 'Manage, track, update status, and remove orders across the platform'}
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1 text-xs font-bold text-ink-700">
          {orders.length} {locale === 'ar' ? 'طلب' : locale === 'fr' ? 'commandes' : 'orders'}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="card-mc p-12 text-center text-ink-500">
          {locale === 'ar' ? 'لا توجد طلبات حتى الآن.' : 'Aucune commande pour le moment.'}
        </div>
      ) : (
        <div className="card-mc overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50/80 text-start text-xs font-bold uppercase tracking-wider text-ink-500">
                <tr className="border-b border-ink-200">
                  <th className="px-4 py-3.5 text-start">#</th>
                  <th className="px-4 py-3.5 text-start">{locale === 'ar' ? 'العميل' : 'Client / Buyer'}</th>
                  <th className="px-4 py-3.5 text-start">{locale === 'ar' ? 'المنتجات المطلوبة' : 'Items'}</th>
                  <th className="px-4 py-3.5 text-start">{locale === 'ar' ? 'المبلغ الإجمالي' : 'Total'}</th>
                  <th className="px-4 py-3.5 text-start">{locale === 'ar' ? 'الدفع' : 'Payment'}</th>
                  <th className="px-4 py-3.5 text-start">{locale === 'ar' ? 'الحالة والإجراء' : 'Status & Action'}</th>
                  <th className="px-4 py-3.5 text-start">{locale === 'ar' ? 'التاريخ' : 'Date'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {orders.map((o) => {
                  const itemCount = o.items.reduce((sum, it) => sum + it.quantity, 0);

                  return (
                    <tr key={o.id} className="transition hover:bg-ink-50/50">
                      {/* ID */}
                      <td className="px-4 py-4 font-mono text-xs text-ink-500">
                        #{o.id.slice(0, 8)}
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-4">
                        <div className="font-semibold text-ink-900">{o.user?.fullName || 'Anonymous'}</div>
                        <div className="text-xs text-ink-500">{o.user?.email}</div>
                        {(o.phone || o.user?.phone) && (
                          <div className="text-xs text-ink-400">📞 {o.phone || o.user?.phone}</div>
                        )}
                        <div className="mt-0.5 text-xs text-ink-400">
                          📍 Wilaya {o.wilayaCode} — {o.address}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-4 py-4">
                        <div className="max-w-xs space-y-1">
                          <span className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                          </span>
                          <ul className="text-xs text-ink-600">
                            {o.items.slice(0, 3).map((it) => {
                              const pName =
                                locale === 'ar'
                                  ? it.product.nameAr
                                  : locale === 'fr'
                                  ? it.product.nameFr
                                  : it.product.nameEn;
                              return (
                                <li key={it.id} className="truncate">
                                  {it.quantity}x {pName}
                                </li>
                              );
                            })}
                            {o.items.length > 3 && (
                              <li className="text-[11px] text-ink-400">
                                +{o.items.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-4 font-bold text-ink-900">
                        {formatDZD(o.totalDZD, currencyLoc)}
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-ink-700">
                            {o.paymentMethod}
                          </span>
                          {o.paymentVerified ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-700">
                              ✓
                            </span>
                          ) : (
                            <span className="text-xs text-amber-600 font-medium">pending</span>
                          )}
                        </div>
                      </td>

                      {/* Status & Actions */}
                      <td className="px-4 py-4">
                        <OrderActions orderId={o.id} currentStatus={o.status} />
                      </td>

                      {/* Date */}
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-ink-500">
                        {new Date(o.createdAt).toLocaleDateString(currencyLoc, {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
