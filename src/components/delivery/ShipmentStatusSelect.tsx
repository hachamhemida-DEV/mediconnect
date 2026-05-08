'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

const STATUSES = ['pending', 'picked_up', 'in_transit', 'delivered', 'failed'] as const;
type Status = typeof STATUSES[number];

export function ShipmentStatusSelect({
  shipmentId,
  currentStatus,
}: {
  shipmentId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const ts = useTranslations('delivery.status');
  const [status, setStatus] = useState<Status>(currentStatus as Status);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  async function update(next: Status) {
    setStatus(next);
    setBusy(true);
    try {
      await fetch(`/api/delivery/shipments/${shipmentId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  return (
    <select
      value={status}
      onChange={(e) => update(e.target.value as Status)}
      disabled={busy}
      className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:opacity-60"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{ts(s)}</option>
      ))}
    </select>
  );
}
