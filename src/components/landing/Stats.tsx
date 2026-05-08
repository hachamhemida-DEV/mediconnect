import { useTranslations } from 'next-intl';

const STAT_KEYS = ['suppliers', 'satisfied', 'volume', 'clients'] as const;
const STAT_COLORS = ['text-violet-600', 'text-amber-500', 'text-sky-500', 'text-brand-600'] as const;
const STAT_BARS   = ['bg-violet-500',  'bg-amber-400',  'bg-sky-500',   'bg-brand-500'  ] as const;

const TESTIMONIAL_KEYS = ['t1', 't2', 't3'] as const;
const TESTIMONIAL_BARS = ['bg-brand-500', 'bg-sky-500', 'bg-amber-400'] as const;

export function Stats() {
  const t = useTranslations('stats');

  return (
    <section
      id="stats"
      className="section-pad bg-gradient-to-b from-brand-50/50 to-white"
    >
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
              <path d="m3 17 6-6 4 4 8-8" /><path d="M17 7h4v4" />
            </svg>
            {t('badge')}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_KEYS.map((key, i) => (
            <article
              key={key}
              className="card-mc relative overflow-hidden p-6 text-center"
            >
              <div className={`absolute inset-x-0 top-0 h-1 ${STAT_BARS[i]}`} aria-hidden />
              <div className={`text-5xl font-extrabold ${STAT_COLORS[i]}`}>
                {t(`items.${key}.value`)}
              </div>
              <div className="mt-3 text-sm font-bold text-ink-900 md:text-base">
                {t(`items.${key}.label`)}
              </div>
              <div className="mt-1 text-xs text-ink-500">
                {t(`items.${key}.desc`)}
              </div>
            </article>
          ))}
        </div>

        {/* Testimonials row */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {TESTIMONIAL_KEYS.map((key, i) => {
            const bar = TESTIMONIAL_BARS[i] ?? 'bg-brand-500';
            const barColor = bar.includes('brand') ? '#15b886' : bar.includes('sky') ? '#2a9ed4' : '#f59e0b';
            return (
            <article
              key={key}
              className="accent-bar card-mc p-6"
              style={{ ['--bar-color' as string]: barColor }}
            >
              <header className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-ink-900">
                    {t(`testimonials.${key}.author`)}
                  </div>
                  <div className="text-xs text-ink-500">
                    {t(`testimonials.${key}.org`)}
                  </div>
                </div>
                <div className={`grid h-9 w-9 place-items-center rounded-full bg-ink-100 text-ink-400`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M4.5 10.5c0-3 2-5 5-5v2.5c-1.5 0-2.5 1-2.5 2.5H9v5H4.5v-5zm10 0c0-3 2-5 5-5v2.5c-1.5 0-2.5 1-2.5 2.5H19v5h-4.5v-5z" />
                  </svg>
                </div>
              </header>
              <p className="text-sm leading-relaxed text-ink-700">
                &ldquo;{t(`testimonials.${key}.text`)}&rdquo;
              </p>
              <div className="mt-4 flex gap-0.5 text-amber-400" aria-label="5 stars">
                {[0, 1, 2, 3, 4].map((n) => (
                  <svg key={n} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.6 6.2L21 9l-5 4.3L17.2 20 12 16.8 6.8 20 8 13.3 3 9l6.4-.8L12 2z" />
                  </svg>
                ))}
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
