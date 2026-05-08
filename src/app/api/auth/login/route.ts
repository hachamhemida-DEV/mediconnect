import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyCredentials } from '@/lib/db';
import { signSession, setSessionCookie } from '@/lib/auth';
import { apiHandler } from '@/lib/api-handler';
import { authLimiter, clientKey } from '@/lib/rate-limit';

const Schema = z.object({
  email:    z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

export const POST = apiHandler(async (req, { logger }) => {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await verifyCredentials(email, password);
  if (!user) {
    logger.warn('login_failed', { email });
    return NextResponse.json({ error: 'INVALID_CREDENTIALS' }, { status: 401 });
  }

  const token = await signSession({
    sub:      user.id,
    email:    user.email,
    role:     user.role,
    fullName: user.fullName,
  });
  await setSessionCookie(token);

  logger.info('login_success', { userId: user.id, role: user.role });
  return NextResponse.json({ ok: true, data: user });
}, {
  route:      'auth.login',
  limiter:    authLimiter,
  // Key by IP + email prefix to thwart both distributed and targeted login-bombs.
  limiterKey: async (req) => {
    const ip = clientKey(req);
    try {
      const cloned = req.clone();
      const body = await cloned.json().catch(() => null) as { email?: string } | null;
      const email = body?.email?.toLowerCase() ?? '';
      return email ? `${ip}::${email}` : ip;
    } catch {
      return ip;
    }
  },
});
