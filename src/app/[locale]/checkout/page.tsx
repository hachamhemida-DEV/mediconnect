import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { getCart } from '@/lib/cart';
import { getSession } from '@/lib/auth';
import { findProduct } from '@/lib/catalog';

const TVA_RATE = 0.19;

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Guard: must be signed in to check out
  const session = await getSession();
  if (!session) redirect(`/${locale}/auth/login`);

  const items = await getCart();
  if (items.length === 0) redirect(`/${locale}/cart`);

  const t = await getTranslations('checkout');

  const subtotals = await Promise.all(items.map(async (it) => {
    const p = await findProduct(it.productId);
    return p ? p.price * it.quantity : 0;
  }));
  const subtotal = subtotals.reduce((a, b) => a + b, 0);
  const tva      = Math.round(subtotal * TVA_RATE);
  const shipping = 0;
  const total    = subtotal + tva + shipping;

  return (
    <>
      <Header />
      <main className="flex-1 bg-ink-50">
        <div className="container-mc py-10">
          <header className="mb-8">
            <h1 className="text-3xl font-extrabold text-ink-900 md:text-4xl">{t('title')}</h1>
            <p className="mt-2 text-ink-600">{t('subtitle')}</p>
          </header>

          <CheckoutForm
            subtotal={subtotal}
            tva={tva}
            shipping={shipping}
            total={total}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
