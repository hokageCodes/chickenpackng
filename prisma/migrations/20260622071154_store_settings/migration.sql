-- CreateTable
CREATE TABLE "StoreSetting" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "storeName" TEXT NOT NULL DEFAULT 'Protein Pack',
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "whatsapp" TEXT,
    "address" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSetting_pkey" PRIMARY KEY ("id")
);
