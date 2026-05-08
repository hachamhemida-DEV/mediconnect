/**
 * Orders, RFQs, used listings, reviews — Phase 3: Prisma-backed.
 *
 * Same exported function names as the Phase 2 in-memory module; every
 * caller stays untouched. Writes are now durable and the site survives
 * process restarts.
 */

import { prisma } from './prisma';
import type { Order, Rfq, RfqReply, UsedListing, OrderLine } from './types';

// --- row-to-domain mappers ------------------------------------------------

function mapOrder(row: {
  id: string; userId: string; status: string; paymentMethod: string;
  paymentProofUrl: string | null; paymentVerified: boolean;
  subtotalDZD: number; tvaDZD: number; shippingDZD: number; totalDZD: number;
  wilayaCode: number; address: string; phone: string; notes: string | null;
  createdAt: Date;
  items: Array<{ productId: string; priceSnapshot: number; nameSnapshot: string; quantity: number }>;
}): Order {
  return {
    id:            row.id,
    userId:        row.userId,
    items:         row.items.map((i) => ({
                     productId:     i.productId,
                     priceSnapshot: i.priceSnapshot,
                     nameSnapshot:  i.nameSnapshot,
                     quantity:      i.quantity,
                   })),
    subtotal:      row.subtotalDZD,
    tva:           row.tvaDZD,
    shipping:      row.shippingDZD,
    total:         row.totalDZD,
    paymentMethod: row.paymentMethod as Order['paymentMethod'],
    paymentProof:  row.paymentProofUrl ?? undefined,
    status:        row.status as Order['status'],
    wilayaCode:    row.wilayaCode,
    address:       row.address,
    phone:         row.phone,
    notes:         row.notes ?? undefined,
    createdAt:     row.createdAt.toISOString(),
  };
}

function mapRfq(row: {
  id: string; buyerId: string; categoryId: string; title: string; description: string;
  quantity: number; budgetMax: number | null; wilayaCode: number; status: string;
  createdAt: Date;
  replies: Array<{ id: string; rfqId: string; supplierId: string; priceOffer: number; message: string; createdAt: Date }>;
}): Rfq {
  return {
    id:          row.id,
    buyerId:     row.buyerId,
    categoryId:  row.categoryId,
    title:       row.title,
    description: row.description,
    quantity:    row.quantity,
    budgetMax:   row.budgetMax ?? undefined,
    wilayaCode:  row.wilayaCode,
    status:      row.status as Rfq['status'],
    createdAt:   row.createdAt.toISOString(),
    replies:     row.replies.map((r) => ({
                   id:         r.id,
                   rfqId:      r.rfqId,
                   supplierId: r.supplierId,
                   priceOffer: r.priceOffer,
                   message:    r.message,
                   createdAt:  r.createdAt.toISOString(),
                 })),
  };
}

function mapUsedListing(row: {
  id: string; sellerId: string; categoryId: string; title: string; description: string;
  condition: string; yearOfManufacture: number | null; priceDZD: number;
  imagesJson: string; wilayaCode: number; phone: string; active: boolean; createdAt: Date;
}): UsedListing {
  return {
    id:                row.id,
    sellerId:          row.sellerId,
    categoryId:        row.categoryId,
    title:             row.title,
    description:       row.description,
    condition:         row.condition as UsedListing['condition'],
    yearOfManufacture: row.yearOfManufacture ?? undefined,
    price:             row.priceDZD,
    images:            JSON.parse(row.imagesJson) as string[],
    wilayaCode:        row.wilayaCode,
    phone:             row.phone,
    active:            row.active,
    createdAt:         row.createdAt.toISOString(),
  };
}

// --- orders ---------------------------------------------------------------

export async function createOrder(
  input: Omit<Order, 'id' | 'createdAt' | 'status'>,
): Promise<Order> {
  const row = await prisma.order.create({
    data: {
      userId:        input.userId,
      status:        input.paymentMethod === 'edahabia' ? 'confirmed' : 'pending',
      paymentMethod: input.paymentMethod,
      subtotalDZD:   input.subtotal,
      tvaDZD:        input.tva,
      shippingDZD:   input.shipping,
      totalDZD:      input.total,
      wilayaCode:    input.wilayaCode,
      address:       input.address,
      phone:         input.phone,
      notes:         input.notes,
      items: {
        create: input.items.map((i: OrderLine) => ({
          productId:     i.productId,
          priceSnapshot: i.priceSnapshot,
          nameSnapshot:  i.nameSnapshot,
          quantity:      i.quantity,
        })),
      },
    },
    include: { items: true },
  });
  // Also create a matching shipment row in 'pending' for the delivery dashboard
  await prisma.shipment.create({ data: { orderId: row.id, status: 'pending' } });
  return mapOrder(row);
}

export async function findOrder(id: string): Promise<Order | undefined> {
  const row = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  return row ? mapOrder(row) : undefined;
}

export async function listOrdersForUser(userId: string): Promise<Order[]> {
  const rows = await prisma.order.findMany({
    where:   { userId },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
  return rows.map(mapOrder);
}

// --- RFQs -----------------------------------------------------------------

export async function createRfq(
  input: Omit<Rfq, 'id' | 'createdAt' | 'status' | 'replies'>,
): Promise<Rfq> {
  const row = await prisma.rfq.create({
    data: {
      buyerId:     input.buyerId,
      categoryId:  input.categoryId,
      title:       input.title,
      description: input.description,
      quantity:    input.quantity,
      budgetMax:   input.budgetMax,
      wilayaCode:  input.wilayaCode,
    },
    include: { replies: true },
  });
  return mapRfq(row);
}

export async function findRfq(id: string): Promise<Rfq | undefined> {
  const row = await prisma.rfq.findUnique({ where: { id }, include: { replies: true } });
  return row ? mapRfq(row) : undefined;
}

export async function listRfqsForBuyer(buyerId: string): Promise<Rfq[]> {
  const rows = await prisma.rfq.findMany({
    where:   { buyerId },
    orderBy: { createdAt: 'desc' },
    include: { replies: true },
  });
  return rows.map(mapRfq);
}

export async function listOpenRfqs(): Promise<Rfq[]> {
  const rows = await prisma.rfq.findMany({
    where:   { status: 'open' },
    orderBy: { createdAt: 'desc' },
    include: { replies: true },
  });
  return rows.map(mapRfq);
}

export async function addRfqReply(
  rfqId: string,
  input: Omit<RfqReply, 'id' | 'rfqId' | 'createdAt'>,
): Promise<RfqReply | null> {
  const rfq = await prisma.rfq.findUnique({ where: { id: rfqId } });
  if (!rfq) return null;
  const row = await prisma.rfqReply.create({
    data: {
      rfqId,
      supplierId: input.supplierId,
      priceOffer: input.priceOffer,
      message:    input.message,
    },
  });
  return {
    id:         row.id,
    rfqId:      row.rfqId,
    supplierId: row.supplierId,
    priceOffer: row.priceOffer,
    message:    row.message,
    createdAt:  row.createdAt.toISOString(),
  };
}

// --- used listings --------------------------------------------------------

export async function createUsedListing(
  input: Omit<UsedListing, 'id' | 'createdAt' | 'active'>,
): Promise<UsedListing> {
  const row = await prisma.usedListing.create({
    data: {
      sellerId:          input.sellerId,
      categoryId:        input.categoryId,
      title:             input.title,
      description:       input.description,
      condition:         input.condition,
      yearOfManufacture: input.yearOfManufacture,
      priceDZD:          input.price,
      imagesJson:        JSON.stringify(input.images ?? []),
      wilayaCode:        input.wilayaCode,
      phone:             input.phone,
    },
  });
  return mapUsedListing(row);
}

export async function findUsedListing(id: string): Promise<UsedListing | undefined> {
  const row = await prisma.usedListing.findUnique({ where: { id } });
  return row ? mapUsedListing(row) : undefined;
}

export async function listUsedListings(): Promise<UsedListing[]> {
  const rows = await prisma.usedListing.findMany({
    where:   { active: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapUsedListing);
}

export async function listUsedListingsBySeller(sellerId: string): Promise<UsedListing[]> {
  const rows = await prisma.usedListing.findMany({
    where:   { sellerId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapUsedListing);
}
