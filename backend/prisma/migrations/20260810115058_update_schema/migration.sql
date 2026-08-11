-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "pdfUrl" TEXT;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "fileSizeBytes" BIGINT,
ADD COLUMN     "mimeType" TEXT;
