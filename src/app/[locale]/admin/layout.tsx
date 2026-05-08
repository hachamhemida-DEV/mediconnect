import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getSession } from '@/lib/auth';
import { Logo } from '@/components/ui/Logo';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { LogoutButton } from '@/components/layout/LogoutButton';

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session) redirect(`/${locale}/auth/login`);
  if (session.role !== 'admin') redirect(`/${locale}/`);

  const t = await getTranslations('admin');

  const nav = [
    { href: '/admin',            label: t('nav.overview'),  icon: '📊' },
    { href: '/admin/suppliers',  label: t('nav.suppliers'), icon: '🏬' },
    { href: '/admin/orders',     label: t('nav.orders'),    icon: '🧾' },
    { href: '/admin/payments',   label: t('nav.payments'),  icon: '💳' },
    { href: '/admin/rfqs',       label: t('nav.rfqs'),      icon: '💬' },
  ];

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/90 backdrop-blur-md">
        <div className="container-mc flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="MediConnect">
              <Logo withText size={36} />
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-purple-700 px-3 py-1 text-xs font-bold text-white shadow-card">
              ★ {t('badge')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-700 md:block">
              {session.fullName}
            </div>
            <LocaleSwitcher variant="compact" />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="container-mc py-8">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <nav className="card-mc p-3">
              <ul className="space-y-1">
                {nav.map((n) => (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-100"
                    >
                      <span aria-hidden>{n.icon}</span>
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
