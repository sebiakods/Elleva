-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "ExpertApplication" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "specialties" TEXT NOT NULL,
    "languages" TEXT,
    "linkedin" TEXT,
    "portfolio" TEXT,
    "certifications" TEXT,
    "motivation" TEXT NOT NULL,
    "cvPath" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "adminComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpertApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionApplication" (
    "id" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "city" TEXT,
    "description" TEXT NOT NULL,
    "documentPath" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "adminComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionApplication_pkey" PRIMARY KEY ("id")
);
