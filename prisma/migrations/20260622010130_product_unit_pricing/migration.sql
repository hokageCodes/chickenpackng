/*
  Warnings:

  - You are about to drop the column `variantId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the `ProductVariant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_variantId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_productId_fkey";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "variantId",
ADD COLUMN     "productId" TEXT,
ALTER COLUMN "qty" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "minQty" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "pricePerUnitNGN" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "step" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'kg';

-- DropTable
DROP TABLE "ProductVariant";

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
