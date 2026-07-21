-- CreateTable
CREATE TABLE "FarmPrice" (
    "kind" "InventoryKind" NOT NULL,
    "unit" TEXT NOT NULL,
    "priceNGN" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmPrice_pkey" PRIMARY KEY ("kind")
);
