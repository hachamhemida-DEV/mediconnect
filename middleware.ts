import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './src/i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Random request-id — uses crypto.randomUUID() on the edge runtime.
 * Falls back to a timestamp+random string if unavailable (older edges).
 */
function newRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function middleware(req: NextRequest) {
  // Let next-intl do its locale negotiation first. If it returns a
  // redirect or rewrite, respect it unchanged.
  const response = intlMiddleware(req);

  // Generate a request-id (honor one from upstream proxies if present).
  const incoming = req.headers.get('x-request-id');
  const requestId = incoming && /^[a-zA-Z0-9_-]{6,64}$/.test(incoming) ? incoming : newRequestId();

  response.headers.set('x-request-id', requestId);

  // Also mirror it onto the request for server components + API handlers to read.
  response.headers.set('x-correlation-id', requestId);

  return response;
}

export const config = {
  // Match everything except Next internals and static files.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
