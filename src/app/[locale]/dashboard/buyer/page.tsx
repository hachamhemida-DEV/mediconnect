import type React from 'react';
import { getSession } from '@/lib/auth';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

interface Props {
  params: Promise<{ locale: string }>;
}

const ACTIONS: Array<{
  key: 'browse' | 'rfq' | 'orders' | 'used';
  href: string;
  bg: string;
  fg: string;
  Icon: (p: { className?: string }) => React.ReactElement;
}> = [
  { key: 'browse', href: '/catalog',                bg: 'bg-sky-100',    fg: 'text-sky-600',    Icon: GridIcon },
  { key: 'rfq',    href: '/dashboard/buyer/rfq',   bg: 'bg-brand-100',  fg: 'text-brand-600',  Icon: ChatIcon },
  { key: 'orders', href: '/dashboard/buyer/orders',bg: 'bg-violet-100', fg: 'text-violet-600', Icon: PackageIcon },
  { key: 'used',   href: '/used',                  bg: 'bg-amber-100',  fg: 'text-amber-600',  Icon: RecycleIcon },
];

export default async function BuyerDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  const t = await getTranslations('dashboard');
  const firstName = session?.fullName.split(' ')[0] ?? '';

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink-900 md:text-4xl">
          {t('greeting', { name: firstName })}
        </h1>
        <p className="mt-2 text-base text-ink-600">{t('welcome')}</p>
      </header>

      {/* Quick actions */}
      <section className="mb-10">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink-500">
          {t('quickActions')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIONS.map(({ key, href, bg, fg, Icon }) => (
            <Link
              key={key}
              href={href}
              className="card-mc group p-5 transition hover:-translate-y-1 hover:shadow-card-lg"
            >
              <div className={`mb-4 grid h-12 w-12 place-items-center rounded-xl ${bg} ${fg}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="text-base font-bold text-ink-900">
                {t(`actions.${key}.title`)}
              </div>
              <p className="mt-1 text-sm text-ink-600">
                {t(`actions.${key}.desc`)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Catalog placeholder */}
      <section className="card-mc p-6 md:p-10">
        <div className="flex flex-col items-start gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink-900 md:text-3xl">
              {t('catalog.title')}
            </h2>
            <p className="mt-1 text-sm text-ink-600">{t('catalog.subtitle')}</p>
          </div>
        </div>

        {/* search bar */}
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-400" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.5-4.5" />
          </svg>
          <input
            type="search"
            placeholder={t('catalog.searchPlaceholder')}
            className="flex-1 bg-transparent text-sm text-ink-900 placeholder-ink-400 focus:outline-none"
          />
        </div>

        {/* Empty / coming-soon state */}
        <div className="mt-10 flex flex-col items-center justify-center py-16 text-center">
          <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-brand-400 to-sky-500 text-white shadow-card-lg">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <h3 className="mt-6 text-xl font-bold text-ink-900">
            {t('catalog.comingSoon')}
          </h3>
          <p className="mt-2 max-w-md text-sm text-ink-600">
            {t('empty')}
          </p>
        </div>
      </section>
    </>
  );
}

function GridIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
}
function ChatIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z" /></svg>;
}
function PackageIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3 3 8v8l9 5 9-5V8z" /><path d="m3 8 9 5 9-5M12 13v8" /></svg>;
}
function RecycleIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 19H4a1 1 0 0 1-.9-1.5L4.7 14" /><path d="M9 22 5 18l4-4" /><path d="M17.5 4.5 19 3l2 2-1.5 1.5" /><path d="M14 2h4a2 2 0 0 1 2 2v4" /><path d="m2 13 3.6-3.6A2 2 0 0 1 7 9h3" /></svg>;
}
