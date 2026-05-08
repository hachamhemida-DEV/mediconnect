/**
 * Root layout — App Router requires a root layout even when every route
 * actually lives under /[locale]. This file exists purely to satisfy that
 * requirement; it renders children with no chrome. The real HTML shell is
 * set up in src/app/[locale]/layout.tsx, where we know the active locale
 * and can pick `lang` and `dir`.
 */

import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
