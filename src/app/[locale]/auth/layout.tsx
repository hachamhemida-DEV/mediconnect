import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/ui/Logo';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-brand-gradient-soft">
      <div className="absolute inset-0 bg-hero-mesh" aria-hidden />
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />

      <header className="container-mc relative flex h-20 items-center justify-between">
        <Link href="/" aria-label="MediConnect">
          <Logo withText size={40} />
        </Link>
        <LocaleSwitcher />
      </header>

      <main className="container-mc relative flex flex-1 items-center justify-center py-10">
        {children}
      </main>

      <footer className="container-mc relative py-6 text-center text-xs text-ink-500">
        © {new Date().getFullYear()} MediConnect · mediconnect.dz
      </footer>
    </div>
  );
}
