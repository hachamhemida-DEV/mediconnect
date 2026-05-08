import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser } from '@/lib/db';
import { signSession, setSessionCookie } from '@/lib/auth';
import { apiHandler } from '@/lib/api-handler';
import { authLimiter } from '@/lib/rate-limit';

const Schema = z.object({
  role:         z.enum(['buyer', 'supplier', 'delivery']),
  fullName:     z.string().trim().min(2).max(120),
  businessName: z.string().trim().max(160).optional(),
  email:        z.string().trim().toLowerCase().email(),
  phone:        z.string().trim().max(32).optional(),
  wilaya:       z.string().trim().max(8).optional(),
  password:     z.string().min(8).max(200),
});

export const POST = apiHandler(async (req, { logger }) => {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: 'INVALID_INPUT', field: first?.path.join('.'), details: first?.message },
      { status: 400 },
    );
  }

  try {
    const user = await createUser(parsed.data);
    const token = await signSession({
      sub:      user.id,
      email:    user.email,
      role:     user.role,
      fullName: user.fullName,
    });
    await setSessionCookie(token);

    logger.info('register_success', { userId: user.id, role: user.role });
    return NextResponse.json({ ok: true, data: user }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'EMAIL_TAKEN') {
      return NextResponse.json({ error: 'EMAIL_TAKEN' }, { status: 409 });
    }
    const e = err as Error;
    logger.error('register_failed', { name: e.name, message: e.message });
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}, {
  route:   'auth.register',
  limiter: authLimiter,
});
