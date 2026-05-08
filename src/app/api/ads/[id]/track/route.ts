import { NextResponse } from 'next/server';
import { trackClick } from '@/lib/ads';

/**
 * Ad click endpoint. Increments the counter, returns 204 on success.
 * The sponsored slot on the client first navigates to this URL, then to
 * the target product page; we fire it as a `sendBeacon` so it doesn't
 * block the user's navigation.
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  await trackClick(id);
  return new NextResponse(null, { status: 204 });
}
