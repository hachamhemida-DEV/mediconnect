import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

/**
 * Primary pricing display (screenshot 9): buyer (free) / pro / enterprise.
 * The full 3-tier supplier ladder (basic / pro / gold) + delivery plan
 * lives on its own /pricing route, which we'll build fully in Phase 2.
 */
export function Pricing() {
  const t = useTranslations('pricing');

  return (
    <section
      id="pricing"
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
              <path d="m20.6 13.4-8.2 8.2a2 2 0 0 1-2.8 0L2 13.9V2h11.9l7.7 7.6a2 2 0 0 1 0 2.8l-1 1z" /><circle cx="7" cy="7" r="1.5" fill="currentColor" />
            </svg>
            {t('badge')}
          </span>
        </div>

        <div className="grid items-stretch gap-6 md:grid-cols-3">
          {/* Buyer / Free */}
          <PlanCard
            accent="ink"
            name={t('buyer.name')}
            audience={t('buyer.audience')}
            price={t('buyer.price')}
            priceSuffix={t('buyer.priceSuffix')}
            features={t.raw('buyer.features') as string[]}
            cta={t('buyer.cta')}
            ctaHref="/auth/register?role=buyer"
            includedCount={3}
          />

          {/* Pro / Featured */}
          <PlanCard
            accent="brand"
            featured
            popular={t('pro.popular')}
            name={t('pro.name')}
            audience={t('pro.audience')}
            price={t('pro.price')}
            priceSuffix={t('perMonth')}
            features={t.raw('pro.features') as string[]}
            cta={t('pro.cta')}
            ctaHref="/auth/register?role=supplier&plan=pro"
            includedCount={99}
          />

          {/* Enterprise / Custom */}
          <PlanCard
            accent="violet"
            name={t('enterprise.name')}
            audience={t('enterprise.audience')}
            price={t('enterprise.price')}
            priceSuffix={t('enterprise.priceSuffix')}
            features={t.raw('enterprise.features') as string[]}
            cta={t('enterprise.cta')}
            ctaHref="/contact"
            includedCount={99}
          />
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            عرض كلّ الباقات ↴ · View all packages
          </Link>
        </div>
      </div>
    </section>
  );
}

interface PlanCardProps {
  accent: 'ink' | 'brand' | 'violet';
  name: string;
  audience: string;
  price: string;
  priceSuffix?: string;
  features: string[];
  cta: string;
  ctaHref: string;
  featured?: boolean;
  popular?: string;
  /** Features 0..includedCount are highlighted as included; the rest rendered muted. */
  includedCount?: number;
}

function PlanCard({
  accent,
  name,
  audience,
  price,
  priceSuffix,
  features,
  cta,
  ctaHref,
  featured,
  popular,
  includedCount = 99,
}: PlanCardProps) {
  const header =
    accent === 'brand'
      ? 'bg-brand-500'
      : accent === 'violet'
      ? 'bg-gradient-to-br from-violet-600 to-purple-700'
      : 'bg-ink-700';

  return (
    <article
      className={
        'relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-200/60 transition ' +
        (featured ? 'md:-translate-y-2 md:scale-[1.02] ring-brand-500/30 shadow-card-lg' : '')
      }
    >
      {popular && (
        <div className="absolute top-0 end-8 z-10 translate-y-[-50%] rounded-full bg-amber-500 px-4 py-1 text-xs font-bold text-white shadow-card">
          ★ {popular}
        </div>
      )}

      <header className={`${header} p-6 text-center text-white`}>
        <div className="text-lg font-bold md:text-xl">{name}</div>
        <div className="mt-1 text-sm opacity-90">{audience}</div>
      </header>

      <div className="flex flex-1 flex-col p-6">
        <div className="text-center">
          <div className={
            'text-5xl font-extrabold ' +
            (accent === 'brand' ? 'text-brand-600' : accent === 'violet' ? 'text-violet-600' : 'text-ink-900')
          }>
            {price}
          </div>
          {priceSuffix && (
            <div className="mt-2 text-sm text-ink-500">{priceSuffix}</div>
          )}
        </div>

        <ul className="mt-6 flex-1 space-y-3">
          {features.map((f, i) => {
            const included = i < includedCount;
            return (
              <li key={f} className="flex items-start gap-2.5">
                <span
                  className={
                    'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ' +
                    (included
                      ? accent === 'brand'
                        ? 'bg-brand-500 text-white'
                        : accent === 'violet'
                        ? 'bg-violet-500 text-white'
                        : 'bg-ink-700 text-white'
                      : 'bg-ink-100 text-ink-400')
                  }
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    {included ? <path d="M5 12l5 5L20 7" /> : <path d="M6 6l12 12M6 18L18 6" />}
                  </svg>
                </span>
                <span className={'text-sm ' + (included ? 'text-ink-800' : 'text-ink-400 line-through')}>
                  {f}
                </span>
              </li>
            );
          })}
        </ul>

        <Link
          href={ctaHref}
          className={
            'mt-6 block rounded-xl px-6 py-3 text-center font-semibold transition ' +
            (accent === 'brand'
              ? 'bg-brand-500 text-white hover:bg-brand-600'
              : accent === 'violet'
              ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200 hover:bg-violet-100'
              : 'bg-ink-100 text-ink-800 ring-1 ring-ink-200 hover:bg-ink-200')
          }
        >
          {cta}
        </Link>
      </div>
    </article>
  );
}
