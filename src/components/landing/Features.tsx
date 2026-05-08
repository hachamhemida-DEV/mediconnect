import type React from 'react';
import { useTranslations } from 'next-intl';

type Key = 'catalog' | 'search' | 'reviews' | 'support' | 'chat' | 'alerts' | 'reports' | 'integrations';

// Order matches the reference design: top row (reversed by RTL)
const CARDS: Array<{
  key: Key;
  bar: string;
  grad: string;
  icon: (p: { className?: string }) => React.ReactElement;
}> = [
  { key: 'catalog',      bar: '#2a9ed4', grad: 'from-sky-500 to-sky-600',        icon: GridIcon },
  { key: 'search',       bar: '#15b886', grad: 'from-brand-400 to-brand-600',    icon: SearchIcon },
  { key: 'reviews',      bar: '#f59e0b', grad: 'from-amber-400 to-amber-500',    icon: StarIcon },
  { key: 'support',      bar: '#ef4444', grad: 'from-red-400 to-red-500',        icon: HeadsetIcon },
  { key: 'chat',         bar: '#7c6ef2', grad: 'from-violet-500 to-indigo-600',  icon: ChatIcon },
  { key: 'alerts',       bar: '#10b981', grad: 'from-emerald-400 to-teal-500',   icon: BellIcon },
  { key: 'reports',      bar: '#0ea5e9', grad: 'from-sky-400 to-cyan-500',       icon: ReportIcon },
  { key: 'integrations', bar: '#a855f7', grad: 'from-purple-500 to-fuchsia-600', icon: PlugIcon },
];

export function Features() {
  const t = useTranslations('features');

  return (
    <section id="features" className="section-pad">
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
          <span className="badge-mc bg-sky-500/10 text-sky-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2l2.6 6.2L21 9l-5 4.3L17.2 20 12 16.8 6.8 20 8 13.3 3 9l6.4-.8L12 2z" />
            </svg>
            {t('badge')}
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map(({ key, bar, grad, icon: Icon }) => (
            <article
              key={key}
              className="card-mc group relative overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-card-lg"
            >
              {/* top color bar */}
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: bar }}
                aria-hidden
              />
              <div
                className={`mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${grad} text-white shadow-card`}
              >
                <Icon className="h-8 w-8" />
              </div>
              <h3 className="text-center text-base font-bold text-ink-900">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-center text-sm leading-relaxed text-ink-600">
                {t(`items.${key}.desc`)}
              </p>
            </article>
          ))}
        </div>

        {/* coming soon banner */}
        <div className="mt-10 overflow-hidden rounded-2xl bg-brand-gradient p-6 text-white shadow-card-lg md:p-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h3 className="text-xl font-bold md:text-2xl">
                {t('more.title')}
              </h3>
              <p className="mt-1 text-sm text-white/90 md:text-base">
                {t('more.desc')}
              </p>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 backdrop-blur">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Icons */
function GridIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
}
function SearchIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m21 21-4.5-4.5" /></svg>;
}
function StarIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2l2.6 6.2L21 9l-5 4.3L17.2 20 12 16.8 6.8 20 8 13.3 3 9l6.4-.8L12 2z" /></svg>;
}
function HeadsetIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 14a9 9 0 0 1 18 0" /><path d="M3 14v3a2 2 0 0 0 2 2h2v-5H3z" /><path d="M21 14v3a2 2 0 0 1-2 2h-2v-5h4z" /></svg>;
}
function ChatIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z" /></svg>;
}
function BellIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>;
}
function ReportIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 3v18h18" /><rect x="6" y="12" width="3" height="6" /><rect x="11" y="8" width="3" height="10" /><rect x="16" y="5" width="3" height="13" /></svg>;
}
function PlugIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 2v6M15 2v6M7 8h10v3a5 5 0 1 1-10 0V8z" /><path d="M12 16v6" /></svg>;
}
