/**
 * Small composition helper for API route handlers.
 *
 * Wrap a handler with `apiHandler(fn, opts)` to get, for free:
 *   - a generated / forwarded `x-request-id`
 *   - a child logger tagged with that request-id
 *   - optional rate limiting (by IP for auth, by user for mutations)
 *   - a try/catch that turns thrown errors into a safe 500 JSON response
 *     and emits an `error` log line (without leaking stack traces to clients)
 *   - automatic `x-request-id` echoed on every response for client-side logs
 *
 * Handlers remain idiomatic — receive `Request`, return `Response` or
 * `NextResponse` — they just also receive a `ctx` object with `logger`
 * and `requestId`.
 */

import { NextResponse } from 'next/server';
import { logger as baseLogger, type LogContext } from './logger';
import {
  type RateLimiter,
  clientKey,
  rateLimitResponse,
} from './rate-limit';

export interface HandlerContext {
  requestId: string;
  logger:    ReturnType<typeof baseLogger.with>;
  params?:   Record<string, string | string[]>;
}

export interface ApiHandlerOptions {
  /** Optional rate limiter to apply before invoking the handler. */
  limiter?:      RateLimiter;
  /** How to derive the rate-limit key. Defaults to `x-forwarded-for`. */
  limiterKey?:   (req: Request) => string | Promise<string>;
  /** Route name, added to every log line for grep-ability. */
  route?:        string;
}

type NextRouteContext<P = Record<string, string | string[]>> = {
  params: Promise<P>;
};

export function apiHandler<P = Record<string, string | string[]>>(
  handler: (req: Request, ctx: HandlerContext & { params: P }) => Promise<Response> | Response,
  opts: ApiHandlerOptions = {},
) {
  return async function wrapped(
    req: Request,
    routeCtx: NextRouteContext<P> = { params: Promise.resolve({} as P) },
  ): Promise<Response> {
    const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID();
    const ctxLog: LogContext = { requestId };
    if (opts.route) ctxLog.route = opts.route;
    const log = baseLogger.with(ctxLog);

    // Rate limit if configured
    if (opts.limiter) {
      const key = opts.limiterKey ? await opts.limiterKey(req) : clientKey(req);
      const r = await opts.limiter.limit(key);
      if (!r.success) {
        log.warn('rate_limit_exceeded', { key, limit: r.limit });
        const res = rateLimitResponse(r);
        res.headers.set('x-request-id', requestId);
        return res;
      }
    }

    const started = performance.now();
    let response: Response;

    try {
      const params = await routeCtx.params;
      response = await handler(req, { requestId, logger: log, params });
    } catch (err) {
      const e = err as Error;
      log.error('handler_exception', { name: e.name, message: e.message, stack: e.stack });
      response = NextResponse.json(
        { error: 'INTERNAL_ERROR', requestId },
        { status: 500 },
      );
    }

    response.headers.set('x-request-id', requestId);
    log.info('request_complete', {
      status:  response.status,
      ms:      Math.round(performance.now() - started),
      method:  req.method,
      url:     new URL(req.url).pathname,
    });
    return response;
  };
}
