import { setRequestLocale, getTranslations, getLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { formatDZD } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { DeleteProductButton } from '@/components/admin/DeleteProductButton';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function AdminProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q, category } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('admin.products');
  const activeLocale = await getLocale();
  const currencyLoc = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';

  const where: Record<string, unknown> = {};
  if (category) where.categoryId = category;
  if (q) {
    where.OR = [
      { nameAr: { contains: q } },
      { nameFr: { contains: q } },
      { nameEn: { contains: q } },
      { brand:  { contains: q } },
      { supplier: { businessName: { contains: q } } },
    ];
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 150,
      include: {
        category: true,
        supplier: { select: { id: true, businessName: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { id: 'asc' } }),
  ]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900 md:text-4xl">{t('title')}</h1>
          <p className="mt-1 text-sm text-ink-600">{t('subtitle')}</p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1 text-xs font-bold text-ink-700">
          {products.length} {activeLocale === 'ar' ? 'منتج' : 'products'}
        </span>
      </div>

      {/* Filters */}
      <div className="card-mc mb-6 p-4">
        <form method="GET" className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              name="q"
              defaultValue={q || ''}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm text-ink-900 placeholder-ink-400 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <select
            name="category"
            defaultValue={category || ''}
            className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm text-ink-800 shadow-sm transition focus:border-brand-500 focus:outline-none"
          >
            <option value="">{t('allCategories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {activeLocale === 'ar' ? c.nameAr : activeLocale === 'fr' ? c.nameFr : c.nameEn}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600"
          >
            {activeLocale === 'ar' ? 'بحث' : 'Filter'}
          </button>

          {(q || category) && (
            <Link
              href="/admin/products"
              className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-600 transition hover:bg-ink-50"
            >
              {activeLocale === 'ar' ? 'إعادة ضبط' : 'Reset'}
            </Link>
          )}
        </form>
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="card-mc p-12 text-center text-ink-500">{t('empty')}</div>
      ) : (
        <div className="card-mc overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-start text-xs uppercase tracking-wider text-ink-500">
                <tr className="border-b border-ink-200">
                  <th className="px-4 py-3.5 text-start">{activeLocale === 'ar' ? 'المنتج' : 'Product'}</th>
                  <th className="px-4 py-3.5 text-start">{activeLocale === 'ar' ? 'المورد' : 'Supplier'}</th>
                  <th className="px-4 py-3.5 text-start">{activeLocale === 'ar' ? 'الفئة' : 'Category'}</th>
                  <th className="px-4 py-3.5 text-start">{activeLocale === 'ar' ? 'السعر' : 'Price'}</th>
                  <th className="px-4 py-3.5 text-start">{activeLocale === 'ar' ? 'المخزون' : 'Stock'}</th>
                  <th className="px-4 py-3.5 text-end">{activeLocale === 'ar' ? 'الإجراء' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {products.map((p) => {
                  const name =
                    activeLocale === 'ar' ? p.nameAr : activeLocale === 'fr' ? p.nameFr : p.nameEn;
                  const catName =
                    activeLocale === 'ar'
                      ? p.category.nameAr
                      : activeLocale === 'fr'
                      ? p.category.nameFr
                      : p.category.nameEn;

                  let images: string[] = [];
                  try {
                    images = JSON.parse(p.imagesJson);
                  } catch {
                    images = [];
                  }
                  const thumb = images[0];

                  return (
                    <tr key={p.id} className="transition hover:bg-ink-50/50">
                      {/* Product details */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="grid h-full w-full place-items-center text-lg">
                                {p.category.icon}
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/catalog/${p.id}`}
                              target="_blank"
                              className="font-bold text-ink-900 transition hover:text-brand-600 line-clamp-1"
                            >
                              {name}
                            </Link>
                            <div className="text-xs text-ink-500 font-medium">
                              {p.brand} {p.cataloguePdf && <span className="text-brand-600 font-bold ml-1">📄 PDF</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="px-4 py-3.5 text-ink-700 font-medium">
                        {p.supplier.businessName}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-700">
                          <span>{p.category.icon}</span>
                          <span>{catName}</span>
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5 font-bold text-ink-900">
                        {formatDZD(p.priceDZD, currencyLoc)}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            p.stock > 0
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-end">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/catalog/${p.id}`}
                            target="_blank"
                            title="View"
                            className="rounded-xl border border-ink-200 bg-white p-2 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </Link>
                          <DeleteProductButton productId={p.id} productName={name} />
                        </div>
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
