import { setRequestLocale, getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { getCart } from '@/lib/cart';
import { findProduct } from '@/lib/catalog';
import { formatDZD } from '@/lib/utils';

interface Props {
  params: Promise<{ locale: string }>;
}

const TVA_RATE = 0.19;

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const items = await getCart();
  const t  = await getTranslations('cart');
  const currencyLoc = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';

  // Join items with product data (filter out stale products)
  const lines = (
    await Promise.all(
      items.map(async (it) => {
        const p = await findProduct(it.productId);
        return p ? { product: p, quantity: it.quantity } : null;
      }),
    )
  ).filter((x): x is { product: NonNullable<Awaited<ReturnType<typeof findProduct>>>; quantity: number } => !!x);

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const tva      = Math.round(subtotal * TVA_RATE);
  const shipping = 0; // Free shipping in Phase 2
  const total    = subtotal + tva + shipping;
  const itemsCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <>
      <Header />
      <main className="flex-1 bg-ink-50">
        <div className="container-mc py-10">
          <header className="mb-8 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-ink-900 md:text-4xl">{t('title')}</h1>
              {lines.length > 0 && (
                <p className="mt-1 text-sm text-ink-600">
                  {t('itemsCount', { count: itemsCount })}
                </p>
              )}
            </div>
            <Link href="/catalog" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              ← {t('continueShopping')}
            </Link>
          </header>

          {lines.length === 0 ? (
            <div className="card-mc flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="grid h-20 w-20 place-items-center rounded-3xl bg-brand-100 text-brand-600">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                </svg>
              </div>
              <h2 className="mt-6 text-xl font-bold text-ink-900">{t('empty')}</h2>
              <p className="mt-2 max-w-md text-sm text-ink-600">{t('emptyHint')}</p>
              <Link
                href="/catalog"
                className="mt-6 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-card transition hover:bg-brand-600"
              >
                {t('browseCatalog')}
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              {/* Line items */}
              <div className="card-mc divide-y divide-ink-100">
                {lines.map((l) => (
                  <CartItemRow key={l.product.id} product={l.product} quantity={l.quantity} />
                ))}
              </div>

              {/* Summary */}
              <aside className="card-mc h-fit p-6 lg:sticky lg:top-24">
                <h2 className="mb-4 text-lg font-bold text-ink-900">{t('summary')}</h2>
                <dl className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-600">{t('subtotal')}</dt>
                    <dd className="font-semibold text-ink-900">{formatDZD(subtotal, currencyLoc)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-600">{t('tva')}</dt>
                    <dd className="font-semibold text-ink-900">{formatDZD(tva, currencyLoc)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-600">{t('shipping')}</dt>
                    <dd className="font-semibold text-emerald-600">{t('shippingFree')}</dd>
                  </div>
                </dl>
                <div className="my-4 h-px bg-ink-200" />
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-bold text-ink-900">{t('total')}</span>
                  <span className="text-2xl font-extrabold text-brand-700">
                    {formatDZD(total, currencyLoc)}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 font-semibold text-white shadow-card transition hover:bg-brand-600 active:scale-[0.98]"
                >
                  {t('checkout')}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-flip-on-rtl aria-hidden>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
