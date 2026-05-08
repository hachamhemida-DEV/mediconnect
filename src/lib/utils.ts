import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as DZD currency respecting the active locale. */
export function formatDZD(value: number, locale = 'ar-DZ'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format a plain number respecting the active locale (Arabic-Indic → Latin digits for DZ). */
export function formatNumber(value: number, locale = 'ar-DZ'): string {
  // Force Latin digits in Arabic (Algerian convention)
  const effectiveLocale = locale.startsWith('ar') ? 'ar-DZ-u-nu-latn' : locale;
  return new Intl.NumberFormat(effectiveLocale).format(value);
}
