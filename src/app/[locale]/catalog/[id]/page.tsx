import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/catalog/ProductCard';
import { AddToCartButton } from '@/components/catalog/AddToCartButton';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import {
  productName, productDesc, productSpecs, categoryName,
} from '@/lib/seed';
import {
  findProduct, findCategory, findSupplier, listProducts,
} from '@/lib/catalog';
import { WILAYAS, wilayaName } from '@/lib/wilayas';
import { formatDZD } from '@/lib/utils';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const product = await findProduct(id);
  if (!product) notFound();

  const category = await findCategory(product.categoryId);
  const supplier = await findSupplier(product.supplierId);
  const activeLocale = await getLocale();
  const t  = await getTranslations('product');
  const tc = await getTranslations('catalog');

  const supplierWilaya = supplier && WILAYAS.find((w) => w.code === supplier.wilayaCode);
  const currencyLoc = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';

  // Related: same category, different product, up to 4
  const all = await listProducts({ categoryId: product.categoryId });
  const related = all.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <>
      <Header />
      <main className="flex-1 bg-ink-50">
        {/* Breadcrumb */}
        <div className="border-b border-ink-200 bg-white">
          <div className="container-mc py-4">
            <nav className="flex items-center gap-1.5 text-sm text-ink-500">
              <Link href="/catalog" className="hover:text-brand-600">
                {tc('title')}
              </Link>
              {category && (
                <>
                  <span className="text-ink-300">/</span>
                  <Link href={`/catalog?category=${category.id}`} className="hover:text-brand-600">
                    {categoryName(category, activeLocale)}
                  </Link>
                </>
              )}
              <span className="text-ink-300">/</span>
              <span className="truncate text-ink-800">{productName(product, activeLocale)}</span>
            </nav>
          </div>
        </div>

        <div className="container-mc py-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
            {/* Gallery */}
            <div>
              <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink-200/60">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-ink-50 to-ink-100">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-8xl">
                      {category?.icon ?? '📦'}
                    </div>
                  )}
                  {product.featured && (
                    <span className="absolute top-4 start-4 inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-card-lg">
                      ★ {tc('featured')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col">
              {category && (
                <Link
                  href={`/catalog?category=${category.id}`}
                  className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200"
                >
                  <span aria-hidden>{category.icon}</span>
                  {categoryName(category, activeLocale)}
                </Link>
              )}

              <div className="mt-3 text-sm font-semibold uppercase tracking-wider text-ink-500">
                {product.brand}
              </div>
              <h1 className="mt-1 text-2xl font-extrabold leading-tight text-ink-900 md:text-4xl">
                {productName(product, activeLocale)}
              </h1>

              {/* Rating */}
              <div className="mt-4 flex items-center gap-2 text-sm">
                <div className="flex gap-0.5 text-amber-400">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <svg
                      key={i}
                      width="18" height="18" viewBox="0 0 24 24"
                      fill={i < Math.round(product.rating) ? 'currentColor' : 'none'}
                      stroke="currentColor" strokeWidth="2" aria-hidden
                    >
                      <path d="M12 2l2.6 6.2L21 9l-5 4.3L17.2 20 12 16.8 6.8 20 8 13.3 3 9l6.4-.8L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className="font-bold text-ink-900">{product.rating.toFixed(1)}</span>
                <span className="text-ink-500">
                  ({t('reviewsCount', { count: product.reviewsCount })})
                </span>
              </div>

              {/* Description */}
              <p className="mt-6 leading-relaxed text-ink-700">
                {productDesc(product, activeLocale)}
              </p>

              {/* Price + stock */}
              <div className="mt-6 flex flex-wrap items-baseline gap-3">
                <span className="text-4xl font-extrabold text-brand-700">
                  {formatDZD(product.price, currencyLoc)}
                </span>
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {tc('inStock', { count: product.stock })}
                  </span>
                ) : (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                    {tc('outOfStock')}
                  </span>
                )}
              </div>

              {/* Qty + add to cart */}
              <div className="mt-6">
                <AddToCartButton productId={product.id} stock={product.stock} />
              </div>

              {/* Supplier card */}
              {supplier && (
                <div className="mt-8 rounded-2xl border border-ink-200 bg-white p-5">
                  <div className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-500">
                    {t('supplier')}
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={
                      'grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white shadow-card ' +
                      (supplier.plan === 'gold' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                       supplier.plan === 'pro'  ? 'bg-gradient-to-br from-sky-500 to-sky-600' :
                                                  'bg-gradient-to-br from-ink-500 to-ink-600')
                    }>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M3 21V8l9-5 9 5v13" /><path d="M9 21V12h6v9" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink-900">{supplier.businessName}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                            <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {t('verified')}
                        </span>
                      </div>
                      {supplierWilaya && (
                        <div className="mt-1 text-xs text-ink-500">
                          📍 {wilayaName(supplierWilaya, activeLocale)}
                        </div>
                      )}
                      <div className="mt-1 text-xs text-ink-500">
                        ★ {supplier.rating.toFixed(1)} · {supplier.reviewsCount} {t('reviews')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Specifications */}
          <section className="mt-14">
            <h2 className="mb-5 text-xl font-bold text-ink-900 md:text-2xl">
              {t('specifications')}
            </h2>
            <div className="card-mc overflow-hidden">
              <ul className="divide-y divide-ink-100">
                {productSpecs(product, activeLocale).map((spec, i) => (
                  <li key={i} className="flex items-center gap-3 px-5 py-4">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    </span>
                    <span className="text-ink-800">{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Reviews */}
          <section className="mt-14">
            <h2 className="mb-5 text-xl font-bold text-ink-900 md:text-2xl">
              {t('reviewsCount', { count: product.reviewsCount })}
            </h2>
            <ReviewsList productId={product.id} />
          </section>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-14">
              <h2 className="mb-5 text-xl font-bold text-ink-900 md:text-2xl">
                {t('relatedProducts')}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
