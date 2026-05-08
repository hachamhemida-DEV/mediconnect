import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';

const BOOT_TS = Date.now();

/**
 * Health check endpoint — meant for load balancers and uptime monitors.
 *
 * - Always returns JSON.
 * - `200` when the database is reachable.
 * - `503` when the database ping fails — signalling the LB to stop routing
 *   traffic to this pod until it recovers.
 *
 * Never cache this route.
 */
export const GET = apiHandler(async (_req, { logger }) => {
  const started = performance.now();
  try {
    // A trivial query that forces a connection round-trip
    await prisma.$queryRaw`SELECT 1`;
    const dbMs = Math.round(performance.now() - started);
    return NextResponse.json(
      {
        status:    'ok',
        ts:        new Date().toISOString(),
        uptimeSec: Math.floor((Date.now() - BOOT_TS) / 1000),
        db:        { ok: true, latencyMs: dbMs },
      },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (err) {
    const e = err as Error;
    logger.error('health_db_fail', { name: e.name, message: e.message });
    return NextResponse.json(
      { status: 'degraded', ts: new Date().toISOString(), db: { ok: false } },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }
}, { route: 'health' });
