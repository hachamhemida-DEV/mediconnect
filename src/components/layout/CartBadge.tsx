'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';

/**
 * A small cart icon with a count badge. The count is refreshed:
 *  - on mount
 *  - whenever the client-side route changes (good enough for add/remove/checkout
 *    since every write triggers a router.refresh() / navigation)
 *  - when the tab regains focus (covers multi-tab scenarios)
 */
export function CartBadge() {
  const pathname = usePathname();
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch('/api/cart/count', { cache: 'no-store' });
        if (!res.ok || !alive) return;
        const body = await res.json();
        if (alive && typeof body.count === 'number') setCount(body.count);
      } catch {
        /* ignore */
      }
    }
    load();
    function onFocus() { if (alive) load(); }
    window.addEventListener('focus', onFocus);
    return () => { alive = false; window.removeEventListener('focus', onFocus); };
  }, [pathname]);

  return (
    <Link
      href="/cart"
      className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-700 transition hover:bg-ink-100"
      aria-label={`Cart${count > 0 ? ` (${count})` : ''}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -end-0.5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white ring-2 ring-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
