'use client';

import { useState, useTransition } from 'react';
import { useRouter } from '@/i18n/routing';

interface Props {
  orderId: string;
  currentStatus: string;
}

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'Pending',   color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { value: 'confirmed', label: 'Confirmed', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { value: 'shipped',   label: 'Shipped',   color: 'text-violet-700 bg-violet-50 border-violet-200' },
  { value: 'delivered', label: 'Delivered', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-red-700 bg-red-50 border-red-200' },
];

export function OrderActions({ orderId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [, startTransition] = useTransition();

  async function handleStatusChange(newStatus: string) {
    if (newStatus === status) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        startTransition(() => router.refresh());
      }
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setShowConfirm(false);
        startTransition(() => router.refresh());
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Status Selector */}
      <select
        value={status}
        disabled={isUpdating}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-semibold text-ink-800 shadow-sm transition hover:border-ink-300 focus:border-brand-500 focus:outline-none disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Delete Button */}
      {showConfirm ? (
        <div className="flex items-center gap-1.5 animate-fadeIn">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-lg bg-red-600 px-2 py-1 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? '...' : 'Confirm'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
            className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs font-semibold text-ink-600 hover:bg-ink-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          title="Delete Order"
          className="rounded-lg p-1.5 text-ink-400 transition hover:bg-red-50 hover:text-red-600"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      )}
    </div>
  );
}
