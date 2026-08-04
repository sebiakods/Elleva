/*
  Warnings:

  - You are about to drop the column `city` on the `InstitutionApplication` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `InstitutionApplication` table. All the data in the column will be lost.
  - You are about to drop the column `institutionName` on the `InstitutionApplication` table. All the data in the column will be lost.
  - Added the required column `contactName` to the `InstitutionApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motivation` to the `InstitutionApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationName` to the `InstitutionApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationType` to the `InstitutionApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wilaya` to the `InstitutionApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InstitutionApplication" DROP COLUMN "city",
DROP COLUMN "description",
DROP COLUMN "institutionName",
ADD COLUMN     "contactName" TEXT NOT NULL,
ADD COLUMN     "contactRole" TEXT,
ADD COLUMN     "motivation" TEXT NOT NULL,
ADD COLUMN     "organizationName" TEXT NOT NULL,
ADD COLUMN     "organizationType" TEXT NOT NULL,
ADD COLUMN     "sectors" TEXT,
ADD COLUMN     "wilaya" TEXT NOT NULL;
