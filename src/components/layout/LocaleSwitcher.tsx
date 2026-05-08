'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTransition } from 'react';
import { routing, localeMeta, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

/**
 * Dropdown-free language switcher: shows the 3 locale pills inline.
 * Clicking one pushes the user to the same path under that locale.
 * Using a <select> under the hood would lose the pill aesthetic of the
 * reference designs.
 */
export function LocaleSwitcher({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const active = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === active) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1 rounded-full bg-ink-100 p-1">
        {routing.locales.map((loc) => (
          <button
            key={loc}
            onClick={() => switchTo(loc)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold transition',
              active === loc
                ? 'bg-white text-ink-900 shadow-sm'
                : 'text-ink-600 hover:text-ink-900',
            )}
            aria-pressed={active === loc}
          >
            {loc.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-full bg-ink-100/80 p-1 ring-1 ring-ink-200/60 backdrop-blur">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchTo(loc)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition',
            active === loc
              ? 'bg-white text-ink-900 shadow-sm'
              : 'text-ink-600 hover:text-ink-900',
          )}
          aria-pressed={active === loc}
          aria-label={localeMeta[loc].label}
        >
          <span aria-hidden>{localeMeta[loc].flag}</span>
          <span className="hidden sm:inline">{localeMeta[loc].label}</span>
        </button>
      ))}
    </div>
  );
}
