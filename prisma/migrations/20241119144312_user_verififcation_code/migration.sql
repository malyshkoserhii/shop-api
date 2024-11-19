-- AlterTable
ALTER TABLE "users" ADD COLUMN     "code" INTEGER,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false;
