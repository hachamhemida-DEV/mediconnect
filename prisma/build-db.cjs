/**
 * Creates prisma/dev.db using sql.js so we can bypass Prisma's
 * engine download (blocked in this sandbox).
 *
 * Runs: CREATE TABLE statements from prisma/init.sql, then inserts
 * the seed data from src/lib/seed.ts, plus 4 demo user accounts.
 */

const fs = require('node:fs');
const path = require('node:path');
const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');

// Use tsx's loader to import the TS seed data at runtime
require('tsx/cjs');
const { CATEGORIES, SUPPLIERS, PRODUCTS } = require('../src/lib/seed.ts');

async function main() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  const schema = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
  db.exec(schema);

  // Categories
  const catStmt = db.prepare(
    'INSERT INTO "Category" (id, slug, nameAr, nameFr, nameEn, icon, color) VALUES (?,?,?,?,?,?,?)'
  );
  for (const c of CATEGORIES) {
    catStmt.run([c.id, c.slug, c.nameAr, c.nameFr, c.nameEn, c.icon, c.color]);
  }
  catStmt.free();

  // Admin user
  const adminPwd = bcrypt.hashSync('admin123', 10);
  db.run(
    'INSERT INTO "User" (id, role, email, fullName, passwordHash, verified) VALUES (?,?,?,?,?,?)',
    ['admin_demo', 'admin', 'admin@mediconnect.dz', 'Admin MediConnect', adminPwd, 1]
  );

  // Buyer user
  const buyerPwd = bcrypt.hashSync('buyer123', 10);
  db.run(
    'INSERT INTO "User" (id, role, email, phone, fullName, wilaya, passwordHash, verified) VALUES (?,?,?,?,?,?,?,?)',
    ['buyer_demo', 'buyer', 'buyer@demo.dz', '+213 555 00 00 01', 'Dr. Ahmed Demo', '16', buyerPwd, 1]
  );

  // Supplier users + supplier rows
  const supPwd = bcrypt.hashSync('supplier123', 10);
  for (const sup of SUPPLIERS) {
    const userId = `user_${sup.id}`;
    db.run(
      'INSERT INTO "User" (id, role, email, phone, fullName, passwordHash, verified) VALUES (?,?,?,?,?,?,?)',
      [userId, 'supplier', `${sup.id}@demo.dz`, '+213 555 00 00 10', sup.businessName + ' Manager', supPwd, 1]
    );
    db.run(
      'INSERT INTO "Supplier" (id, userId, businessName, wilayaCode, plan, verifyStatus, rating, reviewsCount, memberSince) VALUES (?,?,?,?,?,?,?,?,?)',
      [sup.id, userId, sup.businessName, sup.wilayaCode, sup.plan, 'approved', sup.rating, sup.reviewsCount, new Date(sup.memberSince).toISOString()]
    );
  }

  // Products
  const prodStmt = db.prepare(
    `INSERT INTO "Product" (id, categoryId, supplierId, nameAr, nameFr, nameEn, brand,
     descAr, descFr, descEn, specsAr, specsFr, specsEn, priceDZD, stock, imagesJson,
     rating, reviewsCount, featured, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  );
  for (const p of PRODUCTS) {
    prodStmt.run([
      p.id, p.categoryId, p.supplierId, p.nameAr, p.nameFr, p.nameEn, p.brand,
      p.descAr, p.descFr, p.descEn,
      JSON.stringify(p.specsAr), JSON.stringify(p.specsFr), JSON.stringify(p.specsEn),
      p.price, p.stock, JSON.stringify(p.images ?? []),
      p.rating, p.reviewsCount, p.featured ? 1 : 0,
      new Date(p.createdAt).toISOString(),
    ]);
  }
  prodStmt.free();

  // Two demo used listings
  db.run(
    `INSERT INTO "UsedListing" (id, sellerId, categoryId, title, description, condition, yearOfManufacture, priceDZD, wilayaCode, phone)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    ['use_demo1', 'buyer_demo', 'c3',
     'جهاز إيكوغرافي مستعمل — حالة ممتازة',
     'جهاز إيكوغرافي Mindray استخدم لمدة سنتين فقط، مع جميع المستشعرات والملحقات الأصليّة.',
     'like_new', 2023, 520000, 16, '+213 555 00 12 34']
  );
  db.run(
    `INSERT INTO "UsedListing" (id, sellerId, categoryId, title, description, condition, yearOfManufacture, priceDZD, wilayaCode, phone)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    ['use_demo2', 'buyer_demo', 'c6',
     'كرسي أسنان بحالة جيّدة — يحتاج صيانة بسيطة',
     'كرسي أسنان يعمل بشكل كامل، الضوء LED سليم، يحتاج تغيير جلد الكرسي فقط.',
     'good', 2019, 380000, 31, '+213 666 11 22 33']
  );

  // Pretend a migration has been applied so Prisma doesn't complain
  db.run(
    `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, applied_steps_count)
     VALUES ('init', 'manual', CURRENT_TIMESTAMP, '0_init_manual', 1)`
  );

  const bytes = db.export();
  fs.writeFileSync(path.join(__dirname, 'dev.db'), Buffer.from(bytes));
  console.log(`✓ prisma/dev.db written (${bytes.length} bytes)`);
  console.log('  12 categories, 3 suppliers, 24 products, 2 used listings');
  console.log('  Demo accounts: admin@mediconnect.dz · buyer@demo.dz · sup1-3@demo.dz');
}

main().catch((e) => { console.error(e); process.exit(1); });
