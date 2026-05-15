import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CATEGORIES } from '@/lib/seed';

export async function GET() {
  try {
    let count = 0;
    for (const c of CATEGORIES) {
      await prisma.category.upsert({
        where:  { id: c.id },
        update: {},
        create: {
          id:     c.id,
          slug:   c.slug,
          nameAr: c.nameAr,
          nameFr: c.nameFr,
          nameEn: c.nameEn,
          icon:   c.icon,
          color:  c.color,
        },
      });
      count++;
    }
    return NextResponse.json({ ok: true, message: `Successfully seeded ${count} categories.` });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
