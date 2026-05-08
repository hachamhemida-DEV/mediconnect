'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

export function CCPProofUploader({
  orderId,
  existingUrl,
}: {
  orderId: string;
  existingUrl?: string;
}) {
  const t = useTranslations('payment');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile]     = useState<File | null>(null);
  const [busy, setBusy]     = useState(false);
  const [done, setDone]     = useState(!!existingUrl);
  const [error, setError]   = useState<string | null>(null);

  async function upload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('proof', file);
      const res = await fetch(`/api/orders/${orderId}/upload-proof`, {
        method: 'POST',
        body:   fd,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? 'uploadError');
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError('uploadError');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" />
        </svg>
        <span className="font-semibold">{t('uploaded')}</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-ink-200">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" />
          </svg>
        </span>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-ink-900">{t('uploadProof')}</h4>
          <p className="mt-0.5 text-xs text-ink-600">{t('uploadDesc')}</p>
          <p className="mt-1 text-[11px] text-ink-400">{t('maxSize')} · {t('allowedFormats')}</p>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-ink-700 ring-1 ring-ink-200 transition hover:bg-ink-50"
            >
              {t('chooseFile')}
            </button>
            <span className="text-xs text-ink-500">
              {file ? file.name : t('noFile')}
            </span>
          </div>

          {error && (
            <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200">
              {t('uploadError')}
            </div>
          )}

          <button
            type="button"
            onClick={upload}
            disabled={!file || busy}
            className="mt-3 rounded-lg bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-card transition hover:bg-brand-600 disabled:opacity-50"
          >
            {busy ? '...' : t('uploadProof')}
          </button>
        </div>
      </div>
    </div>
  );
}
