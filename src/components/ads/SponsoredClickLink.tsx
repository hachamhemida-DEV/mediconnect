'use client';

import { Link } from '@/i18n/routing';
import type { ReactNode } from 'react';

interface Props {
  adId:     string;
  href:     string;
  children: ReactNode;
}

/**
 * Wraps a sponsored card in a link that fires a non-blocking click beacon
 * before navigating. Using `sendBeacon` means the tracking fire-and-forgets
 * and the user's navigation isn't held up.
 */
export function SponsoredClickLink({ adId, href, children }: Props) {
  function onClick() {
    try {
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        navigator.sendBeacon(`/api/ads/${adId}/track`);
      } else {
        fetch(`/api/ads/${adId}/track`, { method: 'POST', keepalive: true }).catch(() => {});
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <Link href={href} onClick={onClick}>
      {children}
    </Link>
  );
}
