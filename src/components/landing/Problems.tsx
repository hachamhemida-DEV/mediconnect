import type React from 'react';
import { useTranslations } from 'next-intl';

type Key = 'delay' | 'prices' | 'trust' | 'info' | 'complex' | 'noGuarantee';

const CARDS: Array<{ key: Key; color: string; bg: string; fg: string; icon: (p: { className?: string }) => React.ReactElement }> = [
  { key: 'delay',       color: '#f59e0b', bg: 'bg-amber-100',  fg: 'text-amber-600',   icon: TruckIcon },
  { key: 'prices',      color: '#fb923c', bg: 'bg-orange-100', fg: 'text-orange-600',  icon: QuestionIcon },
  { key: 'trust',       color: '#ef4444', bg: 'bg-red-100',    fg: 'text-red-600',     icon: SearchIcon },
  { key: 'info',        color: '#a855f7', bg: 'bg-violet-100', fg: 'text-violet-600',  icon: InfoIcon },
  { key: 'complex',     color: '#ec4899', bg: 'bg-pink-100',   fg: 'text-pink-600',    icon: DocIcon },
  { key: 'noGuarantee', color: '#ef4444', bg: 'bg-rose-100',   fg: 'text-rose-600',    icon: WarnShieldIcon },
];

export function Problems() {
  const t = useTranslations('problems');

  return (
    <section id="problems" className="section-pad relative">
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
          <span className="badge-mc bg-red-100 text-red-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
            {t('badge')}
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map(({ key, color, bg, fg, icon: Icon }) => (
            <article
              key={key}
              className="accent-bar card-mc group p-6 transition hover:-translate-y-1 hover:shadow-card-lg"
              style={{ ['--bar-color' as string]: color }}
            >
              <div className={`mb-4 grid h-12 w-12 place-items-center rounded-xl ${bg} ${fg}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-ink-900">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {t(`items.${key}.desc`)}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex items-start gap-3 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
          <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-400 text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-amber-900 md:text-base">
            <span className="font-bold">{t('solutionHint').split(':')[0]}:</span>
            {t('solutionHint').slice(t('solutionHint').indexOf(':') + 1)}
          </p>
        </div>
      </div>
    </section>
  );
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="1" y="6" width="14" height="11" rx="1.5" /><path d="M15 10h4l3 3v4h-7z" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" />
    </svg>
  );
}
function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" /><path d="M12 17h.01" />
    </svg>
  );
}
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.5-4.5" />
    </svg>
  );
}
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}
function DocIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h6" />
    </svg>
  );
}
function WarnShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" /><path d="M12 9v4M12 16h.01" />
    </svg>
  );
}
