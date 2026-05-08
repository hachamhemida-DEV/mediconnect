import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Tajawal, Inter } from 'next/font/google';
import { routing, localeMeta, type Locale } from '@/i18n/routing';
import '../globals.css';

function isKnownLocale(x: unknown): x is Locale {
  return typeof x === 'string' && (routing.locales as readonly string[]).includes(x);
}

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-arabic',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-latin',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isKnownLocale(locale)) return {};

  const t = await getTranslations({ locale, namespace: 'meta' });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mediconnect.dz';

  return {
    title:       t('title'),
    description: t('description'),
    metadataBase: new URL(appUrl),
    openGraph: {
      title:       t('title'),
      description: t('description'),
      type:        'website',
      locale:      locale,
      url:         appUrl,
      siteName:    'MediConnect',
    },
    twitter: {
      card:        'summary_large_image',
      title:       t('title'),
      description: t('description'),
    },
    alternates: {
      languages: {
        ar: '/ar',
        fr: '/fr',
        en: '/en',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isKnownLocale(locale)) notFound();

  // Enables static rendering of translated content.
  setRequestLocale(locale);

  const messages = await getMessages();
  const meta = localeMeta[locale as Locale];

  return (
    <html
      lang={locale}
      dir={meta.dir}
      className={`${tajawal.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
