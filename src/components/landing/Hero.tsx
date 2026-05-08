import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/ui/Logo';

export function Hero() {
  const t = useTranslations('hero');

  const badges = [
    { key: 'competitive', color: 'brand',  icon: CoinIcon  },
    { key: 'fast',        color: 'sky',    icon: ClockIcon },
    { key: 'trusted',     color: 'violet', icon: ShieldIcon},
  ] as const;

  return (
    <section className="relative overflow-hidden bg-brand-gradient-soft">
      {/* background decorations */}
      <div className="absolute inset-0 bg-hero-mesh" aria-hidden />
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-300/20 blur-3xl" aria-hidden />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-500/10  blur-3xl" aria-hidden />

      <div className="container-mc relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center py-16 text-center md:py-24">
        {/* big logo floating */}
        <div className="animate-float halo-brand mb-10">
          <Logo size={108} />
        </div>

        <h1 className="text-5xl font-extrabold text-ink-900 md:text-7xl">
          {t('brand')}
        </h1>

        {/* tagline with gradient bars */}
        <div className="mt-6 flex items-center gap-3 md:gap-4">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-sky-500 md:w-24" aria-hidden />
          <span className="bg-gradient-to-l from-brand-500 to-sky-500 bg-clip-text text-lg font-semibold text-transparent md:text-2xl">
            {t('tagline')}
          </span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-brand-500 md:w-24" aria-hidden />
        </div>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-600 md:text-lg">
          {t('description')}
        </p>

        {/* badge row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {badges.map(({ key, color, icon: Icon }) => (
            <div
              key={key}
              className="flex items-center gap-2.5 rounded-full bg-white px-5 py-3 shadow-card ring-1 ring-ink-200/50"
            >
              <span
                className={
                  color === 'brand'
                    ? 'grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-brand-600'
                    : color === 'sky'
                    ? 'grid h-7 w-7 place-items-center rounded-full bg-sky-500/10 text-sky-600'
                    : 'grid h-7 w-7 place-items-center rounded-full bg-accent-violet/15 text-accent-violet'
                }
                aria-hidden
              >
                <Icon />
              </span>
              <span className="text-sm font-semibold text-ink-800 md:text-base">
                {t(`badges.${key}`)}
              </span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="rounded-xl bg-brand-gradient px-8 py-4 font-semibold text-white shadow-card-lg transition hover:shadow-card-lg hover:brightness-105 active:scale-[0.98]"
          >
            {t('cta.start')}
          </Link>
          <Link
            href="/catalog"
            className="rounded-xl bg-white px-8 py-4 font-semibold text-ink-800 ring-1 ring-ink-200 transition hover:bg-ink-50"
          >
            {t('cta.explore')}
          </Link>
        </div>
      </div>
    </section>
  );
}

function CoinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 21c5 0 9-4 9-9s-4-9-9-9-9 4-9 9 4 9 9 9z" />
      <path d="M12 7v10" />
      <path d="M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1.1-3 2.5S10.3 12 12 12s3 1.1 3 2.5-1.3 2.5-3 2.5-3-1.1-3-2.5" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
