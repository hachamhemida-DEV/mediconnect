import { setRequestLocale, getTranslations, getLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { WILAYAS, wilayaName } from '@/lib/wilayas';
import { VerifyActions } from '@/components/admin/VerifyActions';
import { DeleteSupplierButton } from '@/components/admin/DeleteSupplierButton';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ locale: string }>; }

export default async function AdminSuppliersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('admin.suppliers');
  const activeLocale = await getLocale();

  const [pending, approved] = await Promise.all([
    prisma.supplier.findMany({
      where:   { verifyStatus: 'pending' },
      include: {
        user: { select: { email: true, fullName: true, phone: true, createdAt: true } },
        _count: { select: { products: true } },
      },
      orderBy: { memberSince: 'desc' },
    }),
    prisma.supplier.findMany({
      where:   { verifyStatus: 'approved' },
      include: {
        user: { select: { email: true, fullName: true, phone: true } },
        _count: { select: { products: true } },
      },
      orderBy: { memberSince: 'desc' },
      take:    100,
    }),
  ]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900 md:text-4xl">{t('title')}</h1>
          <p className="mt-1 text-sm text-ink-600">{t('subtitle')}</p>
        </div>
      </div>

      {/* Pending Suppliers Section */}
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
            {pending.map((s) => {
              const wilaya = WILAYAS.find((w) => w.code === s.wilayaCode);
              return (
                <article key={s.id} className="card-mc p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-ink-900">{s.businessName}</h3>
                      <div className="mt-1 text-sm text-ink-600">
                        {s.user.fullName} · <span className="text-ink-500">{s.user.email}</span>
                        {s.user.phone && <> · {s.user.phone}</>}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                        <span>📍 {wilaya ? wilayaName(wilaya, activeLocale) : `#${s.wilayaCode}`}</span>
                        <span>📅 {new Date(s.memberSince).toLocaleDateString(activeLocale)}</span>
                        <span className="rounded-full bg-ink-100 px-2 py-0.5 font-bold uppercase">{s.plan}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <VerifyActions supplierId={s.id} />
                      <DeleteSupplierButton supplierId={s.id} businessName={s.businessName} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Approved Suppliers Section */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-bold text-ink-900">{t('approved')}</h2>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
            {approved.length}
          </span>
        </div>
        <div className="card-mc overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-start text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-5 py-3 text-start">{t('business')}</th>
                  <th className="px-5 py-3 text-start">{t('email')}</th>
                  <th className="px-5 py-3 text-start">{activeLocale === 'ar' ? 'المنتجات' : 'Products'}</th>
                  <th className="px-5 py-3 text-start">{t('plan')}</th>
                  <th className="px-5 py-3 text-center">★</th>
                  <th className="px-5 py-3 text-end">{activeLocale === 'ar' ? 'الإجراء' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {approved.map((s) => (
                  <tr key={s.id} className="transition hover:bg-ink-50/50">
                    <td className="px-5 py-3.5 font-semibold text-ink-900">
                      <div>{s.businessName}</div>
                      <div className="text-xs font-normal text-ink-400">{s.user.fullName}</div>
                    </td>
                    <td className="px-5 py-3.5 text-ink-600">
                      <div>{s.user.email}</div>
                      {s.user.phone && <div className="text-xs text-ink-400">{s.user.phone}</div>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                        {s._count.products}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-bold uppercase text-ink-700">
                        {s.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center text-amber-500 font-bold">
                      {s.rating.toFixed(1)}
                    </td>
                    <td className="px-5 py-3.5 text-end">
                      <DeleteSupplierButton supplierId={s.id} businessName={s.businessName} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
