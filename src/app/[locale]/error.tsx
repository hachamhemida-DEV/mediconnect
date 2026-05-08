'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[locale-error]', { name: error.name, message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-[70vh] bg-ink-50">
      <div className="container-mc grid place-items-center py-24">
        <div className="card-mc w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-amber-100 text-3xl">
            ⚠️
          </div>
          <h1 className="text-2xl font-extrabold text-ink-900">
            {t('errorTitle')}
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            {t('errorDesc')}
          </p>

          {error.digest && (
            <p className="mt-3 text-[11px] text-ink-400">
              Ref: <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono">{error.digest}</code>
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              onClick={reset}
              className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600"
            >
              {t('errorRetry')}
            </button>
            <Link
              href="/"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-ink-700 ring-1 ring-ink-200 transition hover:bg-ink-50"
            >
              {t('errorHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
