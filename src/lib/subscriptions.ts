/**
 * Supplier subscription pricing + helpers.
 *
 * Plans and prices are the ones published on the landing page's pricing section
 * (DZD per month). Gold is the flagship tier; Enterprise is custom-priced on
 * request and sits outside the self-service flow.
 */

import { prisma } from './prisma';

export type Plan = 'basic' | 'pro' | 'gold';

export const PLAN_PRICES: Record<Plan, number> = {
  basic: 3000,
  pro:   5000,
  gold:  10000,
};

export const PLAN_DURATION_DAYS = 30;

/**
 * Fetch the active subscription for a supplier (the one whose period covers
 * today, if any). Suppliers without an active paid subscription fall back to
 * the "basic" default seeded on their Supplier row.
 */
export async function getActiveSubscription(supplierId: string) {
  const now = new Date();
  return prisma.supplierSubscription.findFirst({
    where: {
      supplierId,
      paid:        true,
      periodEnd:   { gt: now },
      periodStart: { lte: now },
    },
    orderBy: { periodEnd: 'desc' },
  });
}

/**
 * Fetch the supplier's most recent pending subscription request awaiting
 * admin verification.
 */
export async function getPendingSubscription(supplierId: string) {
  return prisma.supplierSubscription.findFirst({
    where:   { supplierId, paid: false },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Create a new pending subscription request. The supplier will complete
 * payment out-of-band (cash at office or CCP receipt upload); the admin
 * flips `paid` to true on verification, which activates the plan.
 */
export async function createSubscriptionRequest(
  supplierId: string,
  plan: Plan,
  paymentMethod: 'cash' | 'ccp' | 'edahabia',
) {
  const now   = new Date();
  const start = now;
  const end   = new Date(now.getTime() + PLAN_DURATION_DAYS * 24 * 60 * 60 * 1000);
  return prisma.supplierSubscription.create({
    data: {
      supplierId,
      plan,
      priceDZD:    PLAN_PRICES[plan],
      periodStart: start,
      periodEnd:   end,
      paid:        false,
      paymentMethod,
    },
  });
}

/**
 * Approve a pending subscription: mark paid, roll the supplier's plan forward.
 */
export async function approveSubscription(subscriptionId: string) {
  const sub = await prisma.supplierSubscription.findUnique({ where: { id: subscriptionId } });
  if (!sub) return null;

  await prisma.$transaction([
    prisma.supplierSubscription.update({
      where: { id: subscriptionId },
      data:  { paid: true },
    }),
    prisma.supplier.update({
      where: { id: sub.supplierId },
      data:  { plan: sub.plan },
    }),
  ]);
  return sub;
}
