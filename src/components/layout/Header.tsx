'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/ui/Logo';
import { LocaleSwitcher } from './LocaleSwitcher';
import { CartBadge } from './CartBadge';
import { cn } from '@/lib/utils';

export function Header() {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: '/',           label: t('home') },
    { href: '/#pricing',   label: t('pricing') },
    { href: '/catalog',    label: t('catalog') },
    { href: '/used',       label: t('used') },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/60 bg-white/80 backdrop-blur-md">
      <div className="container-mc flex h-16 items-center justify-between gap-4 md:h-20">
        <Link href="/" className="flex items-center" aria-label="MediConnect">
          <Logo withText size={40} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-100 hover:text-ink-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LocaleSwitcher />
          <CartBadge />
          <Link
            href="/auth/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-100"
          >
            {t('login')}
          </Link>
          <Link
            href="/auth/register"
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600"
          >
            {t('register')}
          </Link>
        </div>

        {/* mobile hamburger */}
        <button
          className="rounded-lg p-2 text-ink-700 hover:bg-ink-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            ) : (
              <>
                <path d="M4 7h16" strokeLinecap="round" />
                <path d="M4 12h16" strokeLinecap="round" />
                <path d="M4 17h16" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* mobile menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-[max-height] duration-300',
          open ? 'max-h-96' : 'max-h-0',
        )}
      >
        <div className="container-mc flex flex-col gap-2 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-ink-700 hover:bg-ink-100"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center justify-between gap-3 border-t border-ink-200 pt-3">
            <LocaleSwitcher variant="compact" />
            <CartBadge />
          </div>
          <Link
            href="/auth/login"
            onClick={() => setOpen(false)}
            className="rounded-xl px-4 py-2.5 text-center font-semibold text-ink-700 ring-1 ring-ink-200"
          >
            {t('login')}
          </Link>
          <Link
            href="/auth/register"
            onClick={() => setOpen(false)}
            className="rounded-xl bg-brand-500 px-4 py-2.5 text-center font-semibold text-white"
          >
            {t('register')}
          </Link>
        </div>
      </div>
    </header>
  );
}
