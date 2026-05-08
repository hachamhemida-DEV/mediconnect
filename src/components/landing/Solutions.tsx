import type React from 'react';
import { useTranslations } from 'next-intl';

type Key = 'network' | 'compare' | 'delivery' | 'guarantees' | 'details' | 'simple';

const CARDS: Array<{
  key: Key;
  color: string;
  bg: string;
  fg: string;
  cta: string;
  icon: (p: { className?: string }) => React.ReactElement;
}> = [
  { key: 'network',    color: '#15b886', bg: 'bg-brand-100',  fg: 'text-brand-600',    cta: 'text-brand-600',    icon: NetworkIcon },
  { key: 'compare',    color: '#2a9ed4', bg: 'bg-sky-100',    fg: 'text-sky-600',      cta: 'text-sky-600',      icon: ScaleIcon },
  { key: 'delivery',   color: '#14b8a6', bg: 'bg-teal-100',   fg: 'text-teal-600',     cta: 'text-teal-600',     icon: FastTruckIcon },
  { key: 'guarantees', color: '#7c6ef2', bg: 'bg-violet-100', fg: 'text-violet-600',   cta: 'text-violet-600',   icon: ShieldGuardIcon },
  { key: 'details',    color: '#a855f7', bg: 'bg-purple-100', fg: 'text-purple-600',   cta: 'text-purple-600',   icon: DocDetailIcon },
  { key: 'simple',     color: '#2a9ed4', bg: 'bg-sky-100',    fg: 'text-sky-600',      cta: 'text-sky-600',      icon: EditIcon },
];

export function Solutions() {
  const t = useTranslations('solutions');

  return (
    <section id="solutions" className="section-pad bg-gradient-to-b from-white to-brand-50/40">
      <div className="container-mc">
        <div className="mb-12 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold leading-tight text-ink-900 md:text-5xl">
              {t('title')}
            </h2>
            <p className="mt-3 text-base text-ink-600 md:text-lg">
              {t('subtitle')}
            </p>
          </div>
          <span className="badge-mc bg-brand-100 text-brand-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="9" /><path d="m9 12 2 2 4-4" />
            </svg>
            {t('badge')}
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {CARDS.map(({ key, color, bg, fg, cta, icon: Icon }) => (
            <article
              key={key}
              className="accent-bar card-mc group flex items-start gap-5 p-6 transition hover:-translate-y-1 hover:shadow-card-lg"
              style={{ ['--bar-color' as string]: color }}
            >
              <div className="flex-1">
                <h3 className="text-lg font-bold text-ink-900 md:text-xl">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  {t(`items.${key}.desc`)}
                </p>
                <div className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${cta}`}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    data-flip-on-rtl
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  {t(`items.${key}.cta`)}
                </div>
              </div>
              <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${bg} ${fg}`}>
                <Icon className="h-7 w-7" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function NetworkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="2" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" /><rect x="16" y="16" width="6" height="6" rx="1" /><path d="M12 8v4M12 12H5v4M12 12h7v4" />
    </svg>
  );
}
function ScaleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v18M6 7h12" /><path d="M5 7l-3 6a3 3 0 0 0 6 0z" /><path d="M19 7l-3 6a3 3 0 0 0 6 0z" /><path d="M9 21h6" />
    </svg>
  );
}
function FastTruckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="7" width="12" height="10" rx="1" /><path d="M15 10h4l3 3v4h-7z" /><circle cx="7" cy="19" r="1.8" /><circle cx="18" cy="19" r="1.8" /><path d="M1 11h4M1 14h3" />
    </svg>
  );
}
function ShieldGuardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function DocDetailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h6M8 9h2" />
    </svg>
  );
}
function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
