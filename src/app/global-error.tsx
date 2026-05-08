'use client';

/**
 * Global error boundary — rendered by Next.js when any route or nested
 * segment throws an unhandled error in production. Keeps the user from
 * staring at a blank page, gives them a reset button, and (in dev)
 * surfaces enough detail to debug.
 *
 * The `requestId` is forwarded from the server via the `digest` prop that
 * Next.js populates automatically, so users can quote it to support.
 */

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Client-side breadcrumb; wired to a real tracker (Sentry/Rollbar) in phase 4.
    // eslint-disable-next-line no-console
    console.error('[global-error]', { name: error.name, message: error.message, digest: error.digest });
  }, [error]);

  return (
    <html>
      <body>
        <div style={styles.page}>
          <div style={styles.card}>
            <div style={styles.icon} aria-hidden>⚠️</div>
            <h1 style={styles.h1}>Something went wrong</h1>
            <p style={styles.p}>
              An unexpected error occurred. We've logged it and will investigate.
              Please try again in a moment.
            </p>
            {error.digest && (
              <p style={styles.digest}>
                Ref: <code style={styles.code}>{error.digest}</code>
              </p>
            )}
            <div style={styles.actions}>
              <button onClick={reset} style={styles.btnPrimary}>Try again</button>
              <a href="/" style={styles.btnSecondary}>Go home</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh', display: 'grid', placeItems: 'center',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2ef 100%)',
    fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
    padding: '2rem',
  },
  card: {
    maxWidth: 440, width: '100%', background: '#fff',
    borderRadius: 24, padding: '2.5rem 2rem', textAlign: 'center',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  },
  icon:  { fontSize: 56, marginBottom: 16 },
  h1:    { fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' },
  p:     { fontSize: 15, color: '#475569', lineHeight: 1.5, margin: '0 0 20px' },
  digest:{ fontSize: 12, color: '#64748b', margin: '0 0 24px' },
  code:  { fontFamily: 'ui-monospace, SFMono-Regular, monospace',
           background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 },
  actions: { display: 'flex', gap: 8, justifyContent: 'center' },
  btnPrimary: {
    background: '#15b886', color: '#fff', border: 'none',
    padding: '10px 20px', borderRadius: 12, fontWeight: 600,
    cursor: 'pointer', fontSize: 14,
  },
  btnSecondary: {
    background: '#f1f5f9', color: '#334155', textDecoration: 'none',
    padding: '10px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14,
  },
};
