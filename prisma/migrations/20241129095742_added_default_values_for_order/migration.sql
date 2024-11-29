/*
  Warnings:

  - The values [ORDER_PLACED] on the enum `DeliveryStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DeliveryStatus_new" AS ENUM ('PENDING', 'IN_TRANSIT', 'DELIVERED');
ALTER TABLE "orders" ALTER COLUMN "delivery_status" TYPE "DeliveryStatus_new" USING ("delivery_status"::text::"DeliveryStatus_new");
ALTER TYPE "DeliveryStatus" RENAME TO "DeliveryStatus_old";
ALTER TYPE "DeliveryStatus_new" RENAME TO "DeliveryStatus";
DROP TYPE "DeliveryStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "payment_status" SET DEFAULT 'PENDING',
ALTER COLUMN "delivery_status" SET DEFAULT 'PENDING';
