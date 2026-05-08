import type React from 'react';
import { useTranslations } from 'next-intl';

type Key = 'time' | 'bestPrices' | 'rights' | 'support' | 'easy' | 'network';

const CARDS: Array<{
  key: Key;
  bar: string;
  iconBg: string;
  iconFg: string;
  pillBg: string;
  pillFg: string;
  Icon: (p: { className?: string }) => React.ReactElement;
  pillIcon: (p: { className?: string }) => React.ReactElement;
}> = [
  { key: 'time',       bar: '#a855f7', iconBg: 'bg-violet-100', iconFg: 'text-violet-600', pillBg: 'bg-violet-100', pillFg: 'text-violet-600', Icon: ClockIcon,  pillIcon: ArrowDownIcon },
  { key: 'bestPrices', bar: '#10b981', iconBg: 'bg-emerald-100',iconFg: 'text-emerald-600',pillBg: 'bg-emerald-100',pillFg: 'text-emerald-600',Icon: CoinIcon,   pillIcon: ArrowDownIcon },
  { key: 'rights',     bar: '#2a9ed4', iconBg: 'bg-sky-100',    iconFg: 'text-sky-600',    pillBg: 'bg-sky-100',    pillFg: 'text-sky-600',    Icon: ShieldIcon, pillIcon: CheckBadgeIcon },
  { key: 'support',    bar: '#f59e0b', iconBg: 'bg-amber-100',  iconFg: 'text-amber-600',  pillBg: 'bg-amber-100',  pillFg: 'text-amber-700',  Icon: PhoneIcon,  pillIcon: PhoneIcon },
  { key: 'easy',       bar: '#ef4444', iconBg: 'bg-red-100',    iconFg: 'text-red-600',    pillBg: 'bg-red-100',    pillFg: 'text-red-600',    Icon: SmileIcon,  pillIcon: SmileIcon },
  { key: 'network',    bar: '#15b886', iconBg: 'bg-brand-100',  iconFg: 'text-brand-600',  pillBg: 'bg-brand-100',  pillFg: 'text-brand-700',  Icon: NodesIcon,  pillIcon: PinIcon },
];

export function WhyUs() {
  const t = useTranslations('whyUs');

  return (
    <section id="why" className="section-pad bg-gradient-to-b from-white to-violet-50/30">
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
          <span className="badge-mc bg-violet-100 text-violet-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2L9.2 8.6 2 9.5l5.5 4.8L6 21l6-3.5L18 21l-1.5-6.7L22 9.5l-7.2-.9L12 2z" />
            </svg>
            {t('badge')}
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {CARDS.map(({ key, bar, iconBg, iconFg, pillBg, pillFg, Icon, pillIcon: PillIcon }) => (
            <article
              key={key}
              className="accent-bar card-mc p-6 transition hover:-translate-y-1 hover:shadow-card-lg"
              style={{ ['--bar-color' as string]: bar }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-ink-900 md:text-xl">
                    {t(`items.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    {t(`items.${key}.desc`)}
                  </p>
                </div>
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${iconBg} ${iconFg}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className={`mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${pillBg} ${pillFg}`}>
                <PillIcon className="h-4 w-4" />
                {t(`items.${key}.badge`)}
              </div>
            </article>
          ))}
        </div>

        {/* Bottom banner - purple gradient from screenshot */}
        <div className="mt-10 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white shadow-card-lg md:p-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <h3 className="text-xl font-bold md:text-2xl">
                {t('banner.title')}
              </h3>
              <p className="mt-1 text-sm text-white/90 md:text-base">
                {t('banner.desc')}
              </p>
            </div>
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="8" r="6" />
                <path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Icons */
function ClockIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
}
function CoinIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 21c5 0 9-4 9-9s-4-9-9-9-9 4-9 9 4 9 9 9z" /><path d="M12 7v10" /><path d="M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1.1-3 2.5S10.3 12 12 12s3 1.1 3 2.5-1.3 2.5-3 2.5-3-1.1-3-2.5" /></svg>;
}
function ShieldIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" /></svg>;
}
function PhoneIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" /></svg>;
}
function SmileIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><path d="M9 9h.01M15 9h.01" /></svg>;
}
function NodesIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="9" y="2" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" /><rect x="16" y="16" width="6" height="6" rx="1" /><path d="M12 8v4M12 12H5v4M12 12h7v4" /></svg>;
}
function ArrowDownIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 5v14M19 12l-7 7-7-7" /></svg>;
}
function CheckBadgeIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>;
}
function PinIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="3" /></svg>;
}
