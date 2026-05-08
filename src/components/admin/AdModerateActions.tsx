'use client';

import { useState, useTransition } from 'react';
import { useRouter } from '@/i18n/routing';

export function AdModerateActions({ adId }: { adId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const [, startTransition] = useTransition();

  async function act(decision: 'approve' | 'reject') {
    setBusy(decision);
    try {
      await fetch(`/api/admin/ads/${adId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      startTransition(() => router.refresh());
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex shrink-0 flex-col gap-2">
      <button
        onClick={() => act('approve')}
        disabled={busy !== null}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-emerald-600 disabled:opacity-60"
      >
        {busy === 'approve' ? '...' : 'Approve'}
      </button>
      <button
        onClick={() => act('reject')}
        disabled={busy !== null}
        className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100 disabled:opacity-60"
      >
        {busy === 'reject' ? '...' : 'Reject'}
      </button>
    </div>
  );
}
