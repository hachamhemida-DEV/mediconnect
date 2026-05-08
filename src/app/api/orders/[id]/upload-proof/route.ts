import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadLimiter, rateLimitResponse } from '@/lib/rate-limit';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const rl = await uploadLimiter.limit(session.sub);
  if (!rl.success) return rateLimitResponse(rl);

  const { id } = await ctx.params;

  // Ownership check
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  if (order.userId !== session.sub && session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }
  if (order.paymentMethod !== 'ccp') {
    return NextResponse.json({ error: 'NOT_CCP_ORDER' }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get('proof');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'NO_FILE' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'FILE_TOO_LARGE' }, { status: 413 });
  }
  if (!ALLOWED_MIMES.includes(file.type)) {
    return NextResponse.json({ error: 'INVALID_FILE_TYPE' }, { status: 415 });
  }

  // Save file under ./uploads/ccp/<orderId>.<ext>
  const uploadsDir = process.env.UPLOADS_DIR ?? './uploads';
  const dir = path.join(uploadsDir, 'ccp');
  await mkdir(dir, { recursive: true });

  const ext =
    file.type === 'image/jpeg' ? '.jpg' :
    file.type === 'image/png'  ? '.png' :
    file.type === 'image/webp' ? '.webp' :
                                 '.pdf';
  const filename = `${id}${ext}`;
  const filepath = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  // Relative URL served from /uploads (see next.config.mjs rewrites in Phase 3.5)
  const url = `/uploads/ccp/${filename}`;

  await prisma.order.update({
    where: { id },
    data:  { paymentProofUrl: url },
  });

  return NextResponse.json({ ok: true, data: { url } });
}
