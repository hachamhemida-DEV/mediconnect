import type React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

type BKey = 'register' | 'discount' | 'refund' | 'freeSupport';

const BENEFITS: Array<{ key: BKey; Icon: (p: { className?: string }) => React.ReactElement }> = [
  { key: 'register',    Icon: UserPlusIcon },
  { key: 'discount',    Icon: PercentIcon  },
  { key: 'refund',      Icon: RefreshIcon  },
  { key: 'freeSupport', Icon: HeadsetIcon  },
];

export function CTA() {
  const t = useTranslations('cta');

  return (
    <section id="cta" className="section-pad">
      <div className="container-mc">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-500 via-sky-500 to-brand-500 p-8 text-white shadow-card-lg md:p-16">
          {/* decorative orbs */}
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />

          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
              </svg>
              {t('badge')}
            </div>

            <h2 className="mt-6 text-4xl font-extrabold leading-tight md:text-6xl">
              {t('title')}
              <br />
              <span className="bg-gradient-to-l from-white to-brand-100 bg-clip-text text-transparent">
                {t('subtitle')}
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
              {t('desc')}
            </p>

            {/* Benefits grid */}
            <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map(({ key, Icon }) => (
                <div
                  key={key}
                  className="rounded-2xl bg-white/10 p-5 text-center ring-1 ring-white/20 backdrop-blur transition hover:bg-white/15"
                >
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/15">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-4 text-base font-bold">
                    {t(`benefits.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-white/80">
                    {t(`benefits.${key}.desc`)}
                  </p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-brand-700 shadow-card-lg transition hover:bg-ink-50 active:scale-[0.98]"
              >
                <UserPlusIcon className="h-5 w-5" />
                {t('primary')}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-8 py-4 font-semibold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/15"
              >
                <PhoneIcon className="h-5 w-5" />
                {t('secondary')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M20 8v6M23 11h-6" /></svg>;
}
function PercentIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 5 5 19" /><circle cx="7" cy="7" r="3" /><circle cx="17" cy="17" r="3" /></svg>;
}
function RefreshIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M1 4v6h6" /><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10" /></svg>;
}
function HeadsetIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 14a9 9 0 0 1 18 0" /><path d="M3 14v3a2 2 0 0 0 2 2h2v-5H3z" /><path d="M21 14v3a2 2 0 0 1-2 2h-2v-5h4z" /></svg>;
}
function PhoneIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" /></svg>;
}
