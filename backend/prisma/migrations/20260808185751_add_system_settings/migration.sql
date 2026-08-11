-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Article_courseId_idx" ON "Article"("courseId");

-- CreateIndex
CREATE INDEX "Article_order_idx" ON "Article"("order");

-- CreateIndex
CREATE INDEX "Course_category_idx" ON "Course"("category");

-- CreateIndex
CREATE INDEX "Course_level_idx" ON "Course"("level");

-- CreateIndex
CREATE INDEX "Resource_expertProfileId_idx" ON "Resource"("expertProfileId");

-- CreateIndex
CREATE INDEX "Resource_courseId_idx" ON "Resource"("courseId");

-- CreateIndex
CREATE INDEX "Resource_isPublished_idx" ON "Resource"("isPublished");

-- CreateIndex
CREATE INDEX "Resource_type_idx" ON "Resource"("type");

-- CreateIndex
CREATE INDEX "Resource_order_idx" ON "Resource"("order");

-- CreateIndex
CREATE INDEX "Video_expertProfileId_idx" ON "Video"("expertProfileId");

-- CreateIndex
CREATE INDEX "Video_courseId_idx" ON "Video"("courseId");

-- CreateIndex
CREATE INDEX "Video_isPublished_idx" ON "Video"("isPublished");

-- CreateIndex
CREATE INDEX "Video_category_idx" ON "Video"("category");

-- CreateIndex
CREATE INDEX "Video_order_idx" ON "Video"("order");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
