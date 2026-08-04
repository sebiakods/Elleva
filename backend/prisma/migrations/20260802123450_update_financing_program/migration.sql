/*
  Warnings:

  - You are about to drop the column `rate` on the `FinancingProgram` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "FinancingProgram_category_idx";

-- DropIndex
DROP INDEX "FinancingProgram_isPublished_idx";

-- DropIndex
DROP INDEX "FinancingProgram_slug_idx";

-- AlterTable
ALTER TABLE "FinancingProgram" DROP COLUMN "rate",
ADD COLUMN     "closingDate" TIMESTAMP(3),
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'DZD',
ADD COLUMN     "email" TEXT,
ADD COLUMN     "fundingType" TEXT,
ADD COLUMN     "openingDate" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "sector" TEXT,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "targetAudience" TEXT,
ADD COLUMN     "website" TEXT;
