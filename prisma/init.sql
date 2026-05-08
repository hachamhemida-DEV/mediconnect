-- Schema translated from prisma/schema.prisma for environments where
-- `prisma migrate` can't download its engine (sandboxed CI, offline dev).
-- Column types match what @prisma/client expects.

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "role" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "phone" TEXT,
  "fullName" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "wilaya" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "verified" BOOLEAN NOT NULL DEFAULT 0
);
CREATE INDEX "User_role_idx"  ON "User"("role");
CREATE INDEX "User_email_idx" ON "User"("email");

CREATE TABLE "Supplier" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "businessName" TEXT NOT NULL,
  "wilayaCode" INTEGER NOT NULL,
  "plan" TEXT NOT NULL DEFAULT 'basic',
  "verifyStatus" TEXT NOT NULL DEFAULT 'pending',
  "rating" REAL NOT NULL DEFAULT 0,
  "reviewsCount" INTEGER NOT NULL DEFAULT 0,
  "memberSince" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "Supplier_plan_idx"          ON "Supplier"("plan");
CREATE INDEX "Supplier_verifyStatus_idx"  ON "Supplier"("verifyStatus");

CREATE TABLE "SupplierSubscription" (
  "id" TEXT PRIMARY KEY,
  "supplierId" TEXT NOT NULL,
  "plan" TEXT NOT NULL,
  "priceDZD" INTEGER NOT NULL,
  "periodStart" DATETIME NOT NULL,
  "periodEnd" DATETIME NOT NULL,
  "paid" BOOLEAN NOT NULL DEFAULT 0,
  "paymentMethod" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE
);
CREATE INDEX "SupplierSubscription_supplierId_idx" ON "SupplierSubscription"("supplierId");
CREATE INDEX "SupplierSubscription_periodEnd_idx"  ON "SupplierSubscription"("periodEnd");

CREATE TABLE "DeliveryCompany" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "businessName" TEXT NOT NULL,
  "wilayasCovered" TEXT NOT NULL,
  "verifyStatus" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "Category" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "nameAr" TEXT NOT NULL,
  "nameFr" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "color" TEXT NOT NULL
);

CREATE TABLE "Product" (
  "id" TEXT PRIMARY KEY,
  "categoryId" TEXT NOT NULL,
  "supplierId" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "nameFr" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "brand" TEXT NOT NULL,
  "descAr" TEXT NOT NULL,
  "descFr" TEXT NOT NULL,
  "descEn" TEXT NOT NULL,
  "specsAr" TEXT NOT NULL,
  "specsFr" TEXT NOT NULL,
  "specsEn" TEXT NOT NULL,
  "priceDZD" INTEGER NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "imagesJson" TEXT NOT NULL DEFAULT '[]',
  "rating" REAL NOT NULL DEFAULT 0,
  "reviewsCount" INTEGER NOT NULL DEFAULT 0,
  "featured" BOOLEAN NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id"),
  FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE
);
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_supplierId_idx" ON "Product"("supplierId");
CREATE INDEX "Product_featured_idx"   ON "Product"("featured");

CREATE TABLE "Order" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "paymentMethod" TEXT NOT NULL,
  "paymentProofUrl" TEXT,
  "paymentVerified" BOOLEAN NOT NULL DEFAULT 0,
  "subtotalDZD" INTEGER NOT NULL,
  "tvaDZD" INTEGER NOT NULL,
  "shippingDZD" INTEGER NOT NULL,
  "totalDZD" INTEGER NOT NULL,
  "wilayaCode" INTEGER NOT NULL,
  "address" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "Order_status_idx" ON "Order"("status");

CREATE TABLE "OrderItem" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "priceSnapshot" INTEGER NOT NULL,
  "nameSnapshot" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
);
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

CREATE TABLE "Shipment" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL UNIQUE,
  "deliveryCompanyId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "trackingCode" TEXT,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
  FOREIGN KEY ("deliveryCompanyId") REFERENCES "DeliveryCompany"("id")
);

CREATE TABLE "Rfq" (
  "id" TEXT PRIMARY KEY,
  "buyerId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "budgetMax" INTEGER,
  "wilayaCode" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
);
CREATE INDEX "Rfq_buyerId_idx" ON "Rfq"("buyerId");
CREATE INDEX "Rfq_status_idx"  ON "Rfq"("status");

CREATE TABLE "RfqReply" (
  "id" TEXT PRIMARY KEY,
  "rfqId" TEXT NOT NULL,
  "supplierId" TEXT NOT NULL,
  "priceOffer" INTEGER NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("rfqId") REFERENCES "Rfq"("id") ON DELETE CASCADE,
  FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE
);
CREATE INDEX "RfqReply_rfqId_idx" ON "RfqReply"("rfqId");

CREATE TABLE "UsedListing" (
  "id" TEXT PRIMARY KEY,
  "sellerId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "condition" TEXT NOT NULL,
  "yearOfManufacture" INTEGER,
  "priceDZD" INTEGER NOT NULL,
  "imagesJson" TEXT NOT NULL DEFAULT '[]',
  "wilayaCode" INTEGER NOT NULL,
  "phone" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
);
CREATE INDEX "UsedListing_active_idx"     ON "UsedListing"("active");
CREATE INDEX "UsedListing_categoryId_idx" ON "UsedListing"("categoryId");

CREATE TABLE "Review" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("userId", "productId", "orderId"),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE,
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE
);
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

CREATE TABLE "AdCampaign" (
  "id" TEXT PRIMARY KEY,
  "supplierId" TEXT NOT NULL,
  "productId" TEXT,
  "placement" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "budgetDZD" INTEGER NOT NULL,
  "startsAt" DATETIME NOT NULL,
  "endsAt" DATETIME NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT 1,
  "impressions" INTEGER NOT NULL DEFAULT 0,
  "clicks" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE
);
CREATE INDEX "AdCampaign_supplierId_idx" ON "AdCampaign"("supplierId");
CREATE INDEX "AdCampaign_active_idx"     ON "AdCampaign"("active");

-- Prisma's migration tracking table — it expects this to exist.
CREATE TABLE "_prisma_migrations" (
  "id" TEXT PRIMARY KEY,
  "checksum" TEXT NOT NULL,
  "finished_at" DATETIME,
  "migration_name" TEXT NOT NULL,
  "logs" TEXT,
  "rolled_back_at" DATETIME,
  "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);
