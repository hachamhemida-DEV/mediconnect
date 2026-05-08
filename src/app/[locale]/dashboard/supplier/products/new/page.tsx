import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getSession } from '@/lib/auth';
import { listCategories } from '@/lib/catalog';
import { ProductForm } from '@/components/supplier/ProductForm';

interface Props { params: Promise<{ locale: string }>; }

export default async function NewProductPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session) redirect(`/${locale}/auth/login`);
  if (session.role !== 'supplier' && session.role !== 'admin') {
    redirect(`/${locale}/dashboard/buyer`);
  }

  const t = await getTranslations('productCrud');
  const categories = await listCategories();

  return (
    <>
      <h1 className="mb-2 text-3xl font-extrabold text-ink-900 md:text-4xl">{t('newTitle')}</h1>
      <p className="mb-6 text-ink-600">{t('newSubtitle')}</p>

      <ProductForm
        categories={categories}
        submitUrl="/api/supplier/products"
        submitMethod="POST"
        redirectTo="/dashboard/supplier"
      />
    </>
  );
}
