-- AlterTable
ALTER TABLE "Settings" ADD COLUMN "dailyStartPoints" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "Settings" ADD COLUMN "lastDayStarted" DATETIME;
