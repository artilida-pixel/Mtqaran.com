-- CreateTable
CREATE TABLE "VillagePhoto" (
    "id" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,
    "imageData" BYTEA NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'image/jpeg',
    "caption" TEXT,
    "submittedBy" TEXT,
    "contact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VillagePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VillagePhoto_villageId_idx" ON "VillagePhoto"("villageId");

-- CreateIndex
CREATE INDEX "VillagePhoto_status_idx" ON "VillagePhoto"("status");

-- AddForeignKey
ALTER TABLE "VillagePhoto" ADD CONSTRAINT "VillagePhoto_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE CASCADE ON UPDATE CASCADE;
