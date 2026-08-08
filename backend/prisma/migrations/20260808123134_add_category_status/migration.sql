/*
  Warnings:

  - The `status` column on the `Category` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('active', 'hidden');

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "status",
ADD COLUMN     "status" "CategoryStatus" NOT NULL DEFAULT 'active';
