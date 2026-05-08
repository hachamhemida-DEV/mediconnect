import { getRequestConfig } from 'next-intl/server';
import { routing, type Locale } from './routing';

function isKnownLocale(x: unknown): x is Locale {
  return typeof x === 'string' && (routing.locales as readonly string[]).includes(x);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = isKnownLocale(requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'Africa/Algiers',
    now: new Date(),
  };
});
