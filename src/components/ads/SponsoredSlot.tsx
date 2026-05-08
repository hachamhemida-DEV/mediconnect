import { Link } from '@/i18n/routing';
import { listActiveAds, trackImpressions, type Placement } from '@/lib/ads';
import { findProduct } from '@/lib/catalog';
import { productName } from '@/lib/seed';
import { getLocale, getTranslations } from 'next-intl/server';
import { SponsoredClickLink } from './SponsoredClickLink';
import { formatDZD } from '@/lib/utils';

interface Props {
  placement:   Placement;
  categoryId?: string;
  limit?:      number;
}

/**
 * Server-rendered sponsored ad row. Fetches eligible campaigns, fires
 * impression tracking, then renders a horizontal strip of sponsored cards.
 * Nothing renders if no campaigns match — the block fades out cleanly.
 */
export async function SponsoredSlot({ placement, categoryId, limit = 3 }: Props) {
  const ads = await listActiveAds({ placement, categoryId, limit });
  if (ads.length === 0) return null;

  // Fire-and-forget impression bump. Runs server-side every render.
  await trackImpressions(ads.map((a) => a.id));

  const locale = await getLocale();
  const t = await getTranslations('ads.sponsored');
  const currencyLoc = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ';

  // Pre-resolve linked products so the card can show a price
  const products = await Promise.all(
    ads.map(async (a) => (a.productId ? findProduct(a.productId) : undefined)),
  );

  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-700">
          ★ {t('label')}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ads.map((a, i) => {
          const product = products[i];
          const title = product ? productName(product, locale) : a.supplier.businessName;
          const href  = product ? `/catalog/${product.id}` : `/catalog`;
          return (
            <SponsoredClickLink key={a.id} adId={a.id} href={href}>
              <article className="card-mc flex h-full flex-col p-4 transition hover:-translate-y-1 hover:shadow-card-lg">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                    {a.supplier.businessName}
                  </span>
                  {a.supplier.plan === 'gold' && (
                    <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">★ Gold</span>
                  )}
                </div>
                <h3 className="flex-1 text-sm font-bold text-ink-900 line-clamp-2">
                  {title}
                </h3>
                {product && (
                  <div className="mt-2 text-base font-extrabold text-brand-700">
                    {formatDZD(product.price, currencyLoc)}
                  </div>
                )}
              </article>
            </SponsoredClickLink>
          );
        })}
      </div>
    </section>
  );
}
