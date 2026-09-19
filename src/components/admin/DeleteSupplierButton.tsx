'use client';

import { useState, useTransition } from 'react';
import { useRouter } from '@/i18n/routing';

interface Props {
  supplierId: string;
  businessName: string;
}

export function DeleteSupplierButton({ supplierId, businessName }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [, startTransition] = useTransition();

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/suppliers/${supplierId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setShowModal(false);
        startTransition(() => router.refresh());
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        title="Delete Seller"
        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        <span>Delete</span>
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-ink-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink-900">Delete Seller</h3>
                <p className="text-xs text-ink-500">{businessName}</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-ink-600">
              Are you sure you want to delete this seller? All products associated with this seller will also be permanently removed.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isDeleting}
                className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Delete Seller'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
