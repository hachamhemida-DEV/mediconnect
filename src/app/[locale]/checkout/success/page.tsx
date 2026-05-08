import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CCPProofUploader } from '@/components/checkout/CCPProofUploader';
import { findOrder } from '@/lib/db-phase2';
import { getSession } from '@/lib/auth';
import { formatDZD } from '@/lib/utils';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session) redirect(`/${locale}/auth/login`);

  const { order: orderId } = await searchParams;
  const order = orderId ? await findOrder(orderId) : undefined;
  if (!order || order.userId !== session.sub) redirect(`/${locale}/`);

  const t = await getTranslations('checkout');
  const tc = await getTranslations('cart');
  const currencyLoc = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';

  return (
    <>
      <Header />
      <main className="flex-1 bg-ink-50">
        <div className="container-mc max-w-3xl py-16">
          <div className="card-mc p-8 md:p-12">
            {/* Success icon */}
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-brand-500 text-white shadow-card-lg">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>

            <h1 className="mt-6 text-center text-3xl font-extrabold text-ink-900 md:text-4xl">
              {t('success')}
            </h1>
            <p className="mt-2 text-center text-ink-600">
              {t('successDesc', { orderId: order.id })}
            </p>

            {/* Order summary */}
            <div className="mt-8 rounded-2xl bg-ink-50 p-6">
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-600">{tc('subtotal')}</dt>
                  <dd className="font-semibold text-ink-900">{formatDZD(order.subtotal, currencyLoc)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-600">{tc('tva')}</dt>
                  <dd className="font-semibold text-ink-900">{formatDZD(order.tva, currencyLoc)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-600">{tc('shipping')}</dt>
                  <dd className="font-semibold text-emerald-600">{tc('shippingFree')}</dd>
                </div>
                <div className="my-1 h-px bg-ink-200" />
                <div className="flex items-baseline justify-between">
                  <dt className="text-base font-bold text-ink-900">{tc('total')}</dt>
                  <dd className="text-xl font-extrabold text-brand-700">
                    {formatDZD(order.total, currencyLoc)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* CCP account info — shown only for CCP orders */}
            {order.paymentMethod === 'ccp' && (
              <>
                <div className="mt-6 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
                  <h3 className="mb-3 font-bold text-amber-900">📬 CCP / Baridi Mob</h3>
                  <dl className="space-y-2 text-sm text-amber-900">
                    <div className="flex justify-between"><dt>Compte CCP</dt><dd className="font-mono font-bold">1234567 00</dd></div>
                    <div className="flex justify-between"><dt>Titulaire</dt><dd className="font-semibold">MEDICONNECT SARL</dd></div>
                    <div className="flex justify-between"><dt>Montant</dt><dd className="font-bold">{formatDZD(order.total, currencyLoc)}</dd></div>
                    <div className="flex justify-between"><dt>Référence</dt><dd className="font-mono font-bold">{order.id}</dd></div>
                  </dl>
                  <p className="mt-3 text-xs text-amber-800">
                    {t('ccpInfo')}
                  </p>
                </div>

                <div className="mt-4">
                  <CCPProofUploader orderId={order.id} existingUrl={order.paymentProof} />
                </div>
              </>
            )}

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/dashboard/buyer"
                className="rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-card transition hover:bg-brand-600"
              >
                {t('trackOrder')}
              </Link>
              <Link
                href="/catalog"
                className="rounded-xl bg-white px-6 py-3 font-semibold text-ink-800 ring-1 ring-ink-200 transition hover:bg-ink-50"
              >
                {tc('continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
