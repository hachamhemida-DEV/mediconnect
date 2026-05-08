/**
 * Prisma client singleton.
 *
 * Next.js hot-reload recreates modules between requests in dev, which would
 * open a new DB connection every time and eventually exhaust the pool.
 * We cache the client on `globalThis` in dev to survive HMR.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
