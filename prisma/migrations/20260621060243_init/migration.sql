-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'FARM_MANAGER', 'FARM_STAFF', 'SALES_STAFF');

-- CreateEnum
CREATE TYPE "AnimalType" AS ENUM ('BROILER', 'LAYER');

-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('ACTIVE', 'HARVESTING', 'CLOSED');

-- CreateEnum
CREATE TYPE "FeedCategory" AS ENUM ('BROILER', 'LAYER', 'FISH');

-- CreateEnum
CREATE TYPE "HealthEventType" AS ENUM ('VACCINATION', 'MEDICATION', 'VET_VISIT', 'OUTBREAK');

-- CreateEnum
CREATE TYPE "InventoryKind" AS ENUM ('LIVE_POULTRY', 'LIVE_FISH', 'FROZEN_CHICKEN', 'FRESH_FISH', 'SMOKED_FISH', 'EGGS');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('FEED', 'MEDICATION', 'FUEL', 'STAFF', 'TRANSPORTATION', 'MAINTENANCE', 'UTILITIES', 'OTHER');

-- CreateEnum
CREATE TYPE "RevenueSource" AS ENUM ('ONLINE', 'OFFLINE', 'WHOLESALE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimalGroup" (
    "id" TEXT NOT NULL,
    "type" "AnimalType" NOT NULL,
    "label" TEXT NOT NULL,
    "breed" TEXT,
    "arrivalDate" TIMESTAMP(3) NOT NULL,
    "initialCount" INTEGER NOT NULL,
    "currentCount" INTEGER NOT NULL,
    "expectedHarvest" TIMESTAMP(3),
    "status" "GroupStatus" NOT NULL DEFAULT 'ACTIVE',
    "houseName" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnimalGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pond" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "species" TEXT NOT NULL DEFAULT 'Catfish',
    "quantityStocked" INTEGER NOT NULL,
    "currentCount" INTEGER NOT NULL,
    "stockedDate" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pond_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EggLog" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "collected" INTEGER NOT NULL,
    "grade" TEXT,
    "broken" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EggLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedPurchase" (
    "id" TEXT NOT NULL,
    "category" "FeedCategory" NOT NULL,
    "bags" DOUBLE PRECISION NOT NULL,
    "costNGN" DECIMAL(12,2) NOT NULL,
    "vendor" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedUsage" (
    "id" TEXT NOT NULL,
    "category" "FeedCategory" NOT NULL,
    "bags" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT,
    "pondId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedStock" (
    "category" "FeedCategory" NOT NULL,
    "bags" DOUBLE PRECISION NOT NULL,
    "lowThreshold" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedStock_pkey" PRIMARY KEY ("category")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'unit',
    "purchaseDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "remaining" DOUBLE PRECISION NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthEvent" (
    "id" TEXT NOT NULL,
    "type" "HealthEventType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT,
    "pondId" TEXT,
    "medicationId" TEXT,
    "dosage" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MortalityRecord" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "animalType" TEXT NOT NULL,
    "groupId" TEXT,
    "pondId" TEXT,
    "quantity" INTEGER NOT NULL,
    "cause" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MortalityRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HarvestRecord" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT,
    "pondId" TEXT,
    "quantity" INTEGER NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HarvestRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "kind" "InventoryKind" NOT NULL,
    "label" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amountNGN" DECIMAL(12,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "vendor" TEXT,
    "notes" TEXT,
    "groupId" TEXT,
    "pondId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revenue" (
    "id" TEXT NOT NULL,
    "source" "RevenueSource" NOT NULL,
    "amountNGN" DECIMAL(12,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "customer" TEXT,
    "notes" TEXT,
    "groupId" TEXT,
    "pondId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "EggLog" ADD CONSTRAINT "EggLog_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AnimalGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedUsage" ADD CONSTRAINT "FeedUsage_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AnimalGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedUsage" ADD CONSTRAINT "FeedUsage_pondId_fkey" FOREIGN KEY ("pondId") REFERENCES "Pond"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthEvent" ADD CONSTRAINT "HealthEvent_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AnimalGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthEvent" ADD CONSTRAINT "HealthEvent_pondId_fkey" FOREIGN KEY ("pondId") REFERENCES "Pond"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthEvent" ADD CONSTRAINT "HealthEvent_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MortalityRecord" ADD CONSTRAINT "MortalityRecord_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AnimalGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MortalityRecord" ADD CONSTRAINT "MortalityRecord_pondId_fkey" FOREIGN KEY ("pondId") REFERENCES "Pond"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HarvestRecord" ADD CONSTRAINT "HarvestRecord_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AnimalGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HarvestRecord" ADD CONSTRAINT "HarvestRecord_pondId_fkey" FOREIGN KEY ("pondId") REFERENCES "Pond"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AnimalGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_pondId_fkey" FOREIGN KEY ("pondId") REFERENCES "Pond"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AnimalGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_pondId_fkey" FOREIGN KEY ("pondId") REFERENCES "Pond"("id") ON DELETE SET NULL ON UPDATE CASCADE;
