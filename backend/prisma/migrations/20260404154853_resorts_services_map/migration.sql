-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN "serviceCategory" TEXT;

-- CreateTable
CREATE TABLE "Resort" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT,
    "address" TEXT NOT NULL,
    "mapOverview" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ResortService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resortId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hours" TEXT,
    "locationNote" TEXT,
    "howToBook" TEXT,
    CONSTRAINT "ResortService_resortId_fkey" FOREIGN KEY ("resortId") REFERENCES "Resort" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MapPlace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resortId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "building" TEXT,
    "floor" TEXT,
    "directionsFromLobby" TEXT NOT NULL,
    CONSTRAINT "MapPlace_resortId_fkey" FOREIGN KEY ("resortId") REFERENCES "Resort" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pricePerNight" INTEGER NOT NULL,
    "resortId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Room_resortId_fkey" FOREIGN KEY ("resortId") REFERENCES "Resort" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Room" ("createdAt", "description", "id", "name", "pricePerNight") SELECT "createdAt", "description", "id", "name", "pricePerNight" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE INDEX "Room_resortId_idx" ON "Room"("resortId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Resort_slug_key" ON "Resort"("slug");

-- CreateIndex
CREATE INDEX "ResortService_resortId_idx" ON "ResortService"("resortId");

-- CreateIndex
CREATE INDEX "ResortService_resortId_category_idx" ON "ResortService"("resortId", "category");

-- CreateIndex
CREATE INDEX "MapPlace_resortId_idx" ON "MapPlace"("resortId");

-- CreateIndex
CREATE INDEX "MapPlace_resortId_category_idx" ON "MapPlace"("resortId", "category");
