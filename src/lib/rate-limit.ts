/**
 * Rate limiter — sliding-window in-memory implementation that exposes the
 * same signature as `@upstash/ratelimit` so swapping to Redis in production
 * is a one-file change.
 *
 * Usage:
 *     const res = await authLimiter.limit(ip);
 *     if (!res.success) return new Response('Too many requests', { status: 429 });
 *
 * Memory notes
 * ------------
 * - A single Map per limiter. Each key keeps an array of request timestamps
 *   strictly within the current window.
 * - GC is opportunistic: entries are dropped the next time the key is touched
 *   AFTER `windowMs` has elapsed. That's fine for a single-node dev/staging
 *   process; for multi-node production, swap to Upstash.
 *
 * Scope
 * -----
 * - This limiter is process-local. Two Node workers = two independent limiters.
 *   For real production behind a load balancer, point it at Redis.
 */

export interface RateLimitResult {
  success:   boolean;  // true  = allow, false = deny
  limit:     number;   // bucket size
  remaining: number;   // attempts still available
  reset:     number;   // epoch ms when the oldest hit expires
}

export class RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  async limit(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    const existing = this.hits.get(key) ?? [];
    // Drop timestamps outside the window
    const fresh = existing.filter((t) => t > cutoff);

    if (fresh.length >= this.limit) {
      const reset = fresh[0]! + this.windowMs;
      this.hits.set(key, fresh);
      return {
        success:   false,
        limit:     this.limit,
        remaining: 0,
        reset,
      };
    }

    fresh.push(now);
    this.hits.set(key, fresh);
    return {
      success:   true,
      limit:     this.limit,
      remaining: this.limit - fresh.length,
      reset:     now + this.windowMs,
    };
  }
}

// ---------------------------------------------------------------------------
// Pre-configured limiters tuned for this application.
// ---------------------------------------------------------------------------

/** Auth endpoints (login, register): 10 attempts per 5 minutes per IP. */
export const authLimiter = new RateLimiter(10, 5 * 60 * 1000);

/** Mutation endpoints (create/update/delete): 60 per minute per user. */
export const mutationLimiter = new RateLimiter(60, 60 * 1000);

/** File uploads: 10 per minute per user. */
export const uploadLimiter = new RateLimiter(10, 60 * 1000);

/**
 * Extract a best-effort client identifier for rate-limiting.
 * Uses `x-forwarded-for` (behind a proxy), falling back to a header set
 * by Next.js middleware when available.
 */
export function clientKey(req: Request): string {
  const h = req.headers;
  const xff = h.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return h.get('x-real-ip') ?? 'unknown';
}

/** Helper: turn a limiter result into a 429 Response with standard headers. */
export function rateLimitResponse(r: RateLimitResult): Response {
  return new Response(
    JSON.stringify({ error: 'RATE_LIMIT_EXCEEDED', retryAfter: Math.ceil((r.reset - Date.now()) / 1000) }),
    {
      status: 429,
      headers: {
        'content-type':        'application/json',
        'x-ratelimit-limit':   String(r.limit),
        'x-ratelimit-remaining': String(r.remaining),
        'x-ratelimit-reset':   String(Math.floor(r.reset / 1000)),
        'retry-after':         String(Math.ceil((r.reset - Date.now()) / 1000)),
      },
    },
  );
}
