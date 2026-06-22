-- Link a feed purchase to its auto-created FEED expense.
ALTER TABLE "Expense" ADD COLUMN "feedPurchaseId" TEXT;

CREATE UNIQUE INDEX "Expense_feedPurchaseId_key" ON "Expense"("feedPurchaseId");

ALTER TABLE "Expense" ADD CONSTRAINT "Expense_feedPurchaseId_fkey"
  FOREIGN KEY ("feedPurchaseId") REFERENCES "FeedPurchase"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
