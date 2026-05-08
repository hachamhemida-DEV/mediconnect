import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { listProducts } from '@/lib/catalog';
import { NewAdCampaignForm } from '@/components/supplier/NewAdCampaignForm';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ locale: string }>; }

export default async function NewAdPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session) redirect(`/${locale}/auth/login`);
  if (session.role !== 'supplier') redirect(`/${locale}/`);

  const supplier = await prisma.supplier.findUnique({ where: { userId: session.sub } });
  if (!supplier) redirect(`/${locale}/dashboard/supplier`);
  if (supplier.plan === 'basic') redirect(`/${locale}/dashboard/supplier/ads`);

  const t = await getTranslations('ads.form');
  const myProducts = await listProducts({ supplierId: supplier.id });

  return (
    <>
      <h1 className="mb-2 text-3xl font-extrabold text-ink-900 md:text-4xl">{t('title')}</h1>
      <p className="mb-6 text-ink-600">{t('subtitle')}</p>

      <NewAdCampaignForm myProducts={myProducts} />
    </>
  );
}
