import { notFound, redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getSession } from '@/lib/auth';
import { listCategories, findProduct } from '@/lib/catalog';
import { prisma } from '@/lib/prisma';
import { ProductForm } from '@/components/supplier/ProductForm';

interface Props { params: Promise<{ locale: string; id: string }>; }

export default async function EditProductPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session) redirect(`/${locale}/auth/login`);
  if (session.role !== 'supplier' && session.role !== 'admin') {
    redirect(`/${locale}/dashboard/buyer`);
  }

  const product = await findProduct(id);
  if (!product) notFound();

  // Ownership check (admins can edit any)
  if (session.role === 'supplier') {
    const supplier = await prisma.supplier.findUnique({ where: { userId: session.sub } });
    if (!supplier || supplier.id !== product.supplierId) notFound();
  }

  const t = await getTranslations('productCrud');
  const categories = await listCategories();

  return (
    <>
      <h1 className="mb-2 text-3xl font-extrabold text-ink-900 md:text-4xl">{t('editTitle')}</h1>
      <p className="mb-6 text-ink-600">{t('editSubtitle')}</p>

      <ProductForm
        categories={categories}
        productId={product.id}
        initial={{
          categoryId: product.categoryId,
          brand:      product.brand,
          nameAr:     product.nameAr, nameFr: product.nameFr, nameEn: product.nameEn,
          descAr:     product.descAr, descFr: product.descFr, descEn: product.descEn,
          specsAr:    product.specsAr, specsFr: product.specsFr, specsEn: product.specsEn,
          priceDZD:   product.price,
          stock:      product.stock,
        }}
        submitUrl={`/api/supplier/products/${product.id}`}
        submitMethod="PATCH"
        redirectTo="/dashboard/supplier"
      />
    </>
  );
}
