import type React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

type Key = 's1' | 's2' | 's3' | 's4' | 's5';

const STEPS: Array<{ key: Key; gradient: string; iconBg: string; iconFg: string; Icon: (p: { className?: string }) => React.ReactElement }> = [
  { key: 's1', gradient: 'from-sky-400 to-sky-600',       iconBg: 'bg-sky-100',    iconFg: 'text-sky-600',    Icon: UserPlusIcon },
  { key: 's2', gradient: 'from-emerald-400 to-teal-500',  iconBg: 'bg-emerald-100',iconFg: 'text-emerald-600',Icon: SearchIcon },
  { key: 's3', gradient: 'from-teal-400 to-brand-500',    iconBg: 'bg-teal-100',   iconFg: 'text-teal-600',   Icon: ScaleIcon },
  { key: 's4', gradient: 'from-violet-500 to-indigo-600', iconBg: 'bg-violet-100', iconFg: 'text-violet-600', Icon: ChatIcon },
  { key: 's5', gradient: 'from-amber-400 to-orange-500',  iconBg: 'bg-amber-100',  iconFg: 'text-amber-600',  Icon: CheckIcon },
];

export function HowItWorks() {
  const t = useTranslations('how');

  return (
    <section id="how" className="section-pad">
      <div className="container-mc">
        <div className="mb-14 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold leading-tight text-ink-900 md:text-5xl">
              {t('title')}
            </h2>
            <p className="mt-3 text-base text-ink-600 md:text-lg">
              {t('subtitle')}
            </p>
          </div>
          <span className="badge-mc bg-sky-500/10 text-sky-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 5 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            {t('badge')}
          </span>
        </div>

        {/* Timeline: 5 circles connected by gradient lines */}
        <div className="relative">
          <div
            className="absolute top-8 hidden h-1 w-full rounded-full bg-gradient-to-r from-sky-400 via-teal-400 to-amber-400 opacity-30 md:block"
            aria-hidden
          />

          <ol className="grid gap-10 md:grid-cols-5 md:gap-6">
            {STEPS.map(({ key, gradient, iconBg, iconFg, Icon }, i) => (
              <li key={key} className="relative flex flex-col items-center text-center">
                <div
                  className={`relative z-10 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br ${gradient} text-xl font-extrabold text-white shadow-card-lg`}
                >
                  {i + 1}
                </div>
                <div className={`mt-5 grid h-12 w-12 place-items-center rounded-xl ${iconBg} ${iconFg}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-ink-900 md:text-lg">
                  {t(`steps.${key}.title`)}
                </h3>
                <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-ink-600">
                  {t(`steps.${key}.desc`)}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Footer banner */}
        <div className="mt-14 overflow-hidden rounded-2xl bg-brand-gradient p-6 text-white shadow-card-lg md:p-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold md:text-2xl">
                  {t('footerNote')}
                </h3>
                <p className="mt-1 text-sm text-white/90 md:text-base">
                  {t('footerDesc')}
                </p>
              </div>
            </div>
            <Link
              href="/auth/register"
              className="rounded-xl bg-white px-8 py-3 font-semibold text-brand-700 shadow-card transition hover:bg-ink-50"
            >
              {t('cta')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Icons */
function UserPlusIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M20 8v6M23 11h-6" /></svg>;
}
function SearchIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m21 21-4.5-4.5" /></svg>;
}
function ScaleIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3v18M6 7h12" /><path d="M5 7l-3 6a3 3 0 0 0 6 0z" /><path d="M19 7l-3 6a3 3 0 0 0 6 0z" /></svg>;
}
function ChatIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z" /></svg>;
}
function CheckIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>;
}
