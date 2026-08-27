-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lecture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "lecturerId" TEXT,
    "titleHy" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionHy" TEXT,
    "descriptionRu" TEXT,
    "descriptionEn" TEXT,
    "category" TEXT,
    "level" TEXT,
    "durationMin" INTEGER,
    "videoUrl" TEXT,
    "coverImage" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lecture_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "Lecturer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lecture" ("category", "coverImage", "createdAt", "descriptionEn", "descriptionHy", "descriptionRu", "durationMin", "featured", "id", "lecturerId", "level", "slug", "titleEn", "titleHy", "titleRu", "videoUrl") SELECT "category", "coverImage", "createdAt", "descriptionEn", "descriptionHy", "descriptionRu", "durationMin", "featured", "id", "lecturerId", "level", "slug", "titleEn", "titleHy", "titleRu", "videoUrl" FROM "Lecture";
DROP TABLE "Lecture";
ALTER TABLE "new_Lecture" RENAME TO "Lecture";
CREATE UNIQUE INDEX "Lecture_slug_key" ON "Lecture"("slug");
CREATE INDEX "Lecture_lecturerId_idx" ON "Lecture"("lecturerId");
CREATE INDEX "Lecture_category_idx" ON "Lecture"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
