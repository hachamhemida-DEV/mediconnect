/**
 * Ad serving + tracking helpers.
 *
 * Placements:
 *   - `search_top`         — above the catalog results grid
 *   - `homepage_banner`    — hero strip on the landing page
 *   - `category_sidebar`   — right rail on a category-filtered catalog
 *
 * Models:
 *   - `cpm`   — budget spent per 1000 impressions
 *   - `cpc`   — budget spent per click
 *   - `time`  — flat fee for a fixed start→end window (no per-interaction deduction)
 *
 * The `active` flag is flipped by the admin on moderation; `startsAt` /
 * `endsAt` further scope whether a campaign is currently serving. For
 * real-money CPM/CPC billing we'd deduct from `budgetDZD` on each event —
 * Phase 3.5.2 territory. For now we just record impressions + clicks.
 */

import { prisma } from './prisma';

export type Placement = 'search_top' | 'homepage_banner' | 'category_sidebar';

interface ServeOptions {
  placement:    Placement;
  categoryId?:  string;
  limit?:       number;
}

/**
 * Return the currently-eligible campaigns for a given placement. Order is
 * a mild ranking: Gold suppliers first, then newer campaigns.
 */
export async function listActiveAds(opts: ServeOptions) {
  const now = new Date();
  const rows = await prisma.adCampaign.findMany({
    where: {
      active:    true,
      placement: opts.placement,
      startsAt:  { lte: now },
      endsAt:    { gte: now },
      // Only campaigns with remaining budget (for cpm/cpc models); time-based
      // campaigns have no per-event cost so budget stays untouched.
      OR: [
        { model: 'time' },
        { budgetDZD: { gt: 0 } },
      ],
    },
    include: {
      supplier: {
        select: { businessName: true, plan: true },
      },
    },
    orderBy: [
      { createdAt: 'desc' },
    ],
    take: opts.limit ?? 6,
  });

  // In-memory rank: Gold suppliers bubble to the top
  return rows.sort((a, b) => {
    const aw = a.supplier.plan === 'gold' ? 0 : 1;
    const bw = b.supplier.plan === 'gold' ? 0 : 1;
    return aw - bw;
  });
}

/**
 * Increment impression counter. Used on page render for CPM-style
 * accountability. Exceptions swallowed — an ad counter failing must never
 * break catalog rendering.
 */
export async function trackImpressions(campaignIds: string[]) {
  if (campaignIds.length === 0) return;
  try {
    await prisma.adCampaign.updateMany({
      where: { id: { in: campaignIds } },
      data:  { impressions: { increment: 1 } },
    });
  } catch {
    /* swallow */
  }
}

/**
 * Increment click counter. Fired from the client-side click handler via
 * `/api/ads/[id]/track`. Returns the product URL to navigate to on success,
 * or null if the campaign doesn't match.
 */
export async function trackClick(campaignId: string) {
  try {
    const c = await prisma.adCampaign.update({
      where: { id: campaignId },
      data:  { clicks: { increment: 1 } },
      select: { productId: true },
    });
    return c.productId;
  } catch {
    return null;
  }
}
