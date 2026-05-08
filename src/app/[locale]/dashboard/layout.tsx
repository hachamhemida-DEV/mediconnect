import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/ui/Logo';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { LogoutButton } from '@/components/layout/LogoutButton';
import { CartBadge } from '@/components/layout/CartBadge';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/auth/login`);
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/85 backdrop-blur-md">
        <div className="container-mc flex h-16 items-center justify-between gap-4">
          <Link href="/" aria-label="MediConnect">
            <Logo withText size={36} />
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-700 md:block">
              {session.fullName} · <span className="text-ink-500">{session.role}</span>
            </div>
            <LocaleSwitcher variant="compact" />
            <CartBadge />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container-mc py-8 md:py-12">
        {children}
      </main>
    </div>
  );
}
