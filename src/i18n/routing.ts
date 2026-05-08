import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ar', 'fr', 'en'] as const,
  defaultLocale: 'ar',
  // Arabic default: no prefix on /ar, prefix on /fr and /en
  localePrefix: 'as-needed',
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

/** Metadata used across the app */
export const localeMeta: Record<Locale, { label: string; dir: 'rtl' | 'ltr'; flag: string }> = {
  ar: { label: 'العربية',  dir: 'rtl', flag: '🇩🇿' },
  fr: { label: 'Français', dir: 'ltr', flag: '🇫🇷' },
  en: { label: 'English',  dir: 'ltr', flag: '🇬🇧' },
};
