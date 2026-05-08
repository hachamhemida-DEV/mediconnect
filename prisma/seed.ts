/**
 * Prisma seed — runs once via `npx prisma db seed`.
 *
 * Populates:
 *  - 12 medical categories
 *  - 1 admin user, 3 demo supplier accounts, 1 demo buyer
 *  - 24 sample products (same data as Phase 2's /lib/seed.ts, now persisted)
 *  - 2 demo used-equipment listings
 *
 * Safe to re-run: every upsert keys on a stable ID, so the script is idempotent.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { CATEGORIES, SUPPLIERS, PRODUCTS } from '../src/lib/seed';

const prisma = new PrismaClient();

async function main() {
  console.log('→ Seeding categories…');
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
  }

  console.log('→ Seeding demo admin…');
  const adminPwd = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where:  { email: 'admin@mediconnect.dz' },
    update: {},
    create: {
      email:        'admin@mediconnect.dz',
      role:         'admin',
      fullName:     'Admin MediConnect',
      passwordHash: adminPwd,
      verified:     true,
    },
  });

  console.log('→ Seeding demo buyer…');
  const buyerPwd = await bcrypt.hash('buyer123', 10);
  await prisma.user.upsert({
    where:  { email: 'buyer@demo.dz' },
    update: {},
    create: {
      email:        'buyer@demo.dz',
      role:         'buyer',
      fullName:     'Dr. Ahmed Demo',
      phone:        '+213 555 00 00 01',
      wilaya:       '16',
      passwordHash: buyerPwd,
      verified:     true,
    },
  });

  console.log('→ Seeding demo suppliers…');
  for (const sup of SUPPLIERS) {
    const email = `${sup.id}@demo.dz`;
    const pwd = await bcrypt.hash('supplier123', 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        role:         'supplier',
        fullName:     sup.businessName + ' Manager',
        phone:        '+213 555 00 00 10',
        passwordHash: pwd,
        verified:     true,
      },
    });
    await prisma.supplier.upsert({
      where:  { userId: user.id },
      update: {
        plan:         sup.plan,
        verifyStatus: 'approved',
        rating:       sup.rating,
        reviewsCount: sup.reviewsCount,
      },
      create: {
        id:           sup.id,
        userId:       user.id,
        businessName: sup.businessName,
        wilayaCode:   sup.wilayaCode,
        plan:         sup.plan,
        verifyStatus: 'approved',
        rating:       sup.rating,
        reviewsCount: sup.reviewsCount,
        memberSince:  new Date(sup.memberSince),
      },
    });
  }

  console.log('→ Seeding products…');
  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where:  { id: p.id },
      update: {},
      create: {
        id:           p.id,
        categoryId:   p.categoryId,
        supplierId:   p.supplierId,
        nameAr:       p.nameAr,
        nameFr:       p.nameFr,
        nameEn:       p.nameEn,
        brand:        p.brand,
        descAr:       p.descAr,
        descFr:       p.descFr,
        descEn:       p.descEn,
        specsAr:      JSON.stringify(p.specsAr),
        specsFr:      JSON.stringify(p.specsFr),
        specsEn:      JSON.stringify(p.specsEn),
        priceDZD:     p.price,
        stock:        p.stock,
        imagesJson:   JSON.stringify(p.images),
        rating:       p.rating,
        reviewsCount: p.reviewsCount,
        featured:     p.featured,
        createdAt:    new Date(p.createdAt),
      },
    });
  }

  // Demo used listings
  console.log('→ Seeding used listings…');
  const demoBuyer = await prisma.user.findUnique({ where: { email: 'buyer@demo.dz' } });
  if (demoBuyer) {
    await prisma.usedListing.upsert({
      where:  { id: 'use_demo1' },
      update: {},
      create: {
        id:                'use_demo1',
        sellerId:          demoBuyer.id,
        categoryId:        'c3',
        title:             'جهاز إيكوغرافي مستعمل — حالة ممتازة',
        description:       'جهاز إيكوغرافي Mindray استخدم لمدة سنتين فقط، مع جميع المستشعرات والملحقات الأصليّة.',
        condition:         'like_new',
        yearOfManufacture: 2023,
        priceDZD:          520000,
        wilayaCode:        16,
        phone:             '+213 555 00 12 34',
      },
    });
    await prisma.usedListing.upsert({
      where:  { id: 'use_demo2' },
      update: {},
      create: {
        id:                'use_demo2',
        sellerId:          demoBuyer.id,
        categoryId:        'c6',
        title:             'كرسي أسنان بحالة جيّدة — يحتاج صيانة بسيطة',
        description:       'كرسي أسنان يعمل بشكل كامل، الضوء LED سليم، يحتاج تغيير جلد الكرسي فقط.',
        condition:         'good',
        yearOfManufacture: 2019,
        priceDZD:          380000,
        wilayaCode:        31,
        phone:             '+213 666 11 22 33',
      },
    });
  }

  console.log('\n✓ Seed complete.');
  console.log('  Demo accounts (password in parens):');
  console.log('    admin@mediconnect.dz (admin123)');
  console.log('    buyer@demo.dz        (buyer123)');
  console.log('    sup1@demo.dz         (supplier123)  — Gold plan');
  console.log('    sup2@demo.dz         (supplier123)  — Pro plan');
  console.log('    sup3@demo.dz         (supplier123)  — Basic plan\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
