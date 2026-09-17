-- AlterTable
ALTER TABLE "Lecturer" ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "photoData" BYTEA,
ADD COLUMN     "photoMime" TEXT DEFAULT 'image/jpeg',
ADD COLUMN     "telegram" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "youtube" TEXT;

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL,
    "titleHy" TEXT,
    "titleRu" TEXT,
    "titleEn" TEXT,
    "bodyHy" TEXT,
    "bodyRu" TEXT,
    "bodyEn" TEXT,
    "imageData" BYTEA,
    "mimeType" TEXT DEFAULT 'image/jpeg',
    "sourceUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewsItem_published_publishedAt_idx" ON "NewsItem"("published", "publishedAt");
