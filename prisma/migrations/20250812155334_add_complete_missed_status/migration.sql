/*
  Warnings:

  - The values [LATE] on the enum `AssignmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [TEST,GROUP,CLASS_TEST,OTHER] on the enum `AssignmentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AssignmentStatus_new" AS ENUM ('PENDING', 'GRADED', 'DUE', 'COMPLETE', 'MISSED');
ALTER TABLE "public"."Assignment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Assignment" ALTER COLUMN "status" TYPE "public"."AssignmentStatus_new" USING ("status"::text::"public"."AssignmentStatus_new");
ALTER TYPE "public"."AssignmentStatus" RENAME TO "AssignmentStatus_old";
ALTER TYPE "public"."AssignmentStatus_new" RENAME TO "AssignmentStatus";
DROP TYPE "public"."AssignmentStatus_old";
ALTER TABLE "public"."Assignment" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."AssignmentType_new" AS ENUM ('QUIZ', 'SEMESTER_TEST', 'ASSIGNMENT', 'HOMEWORK', 'PRACTICAL', 'EXAM', 'TUTORIAL');
ALTER TABLE "public"."Assignment" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "public"."Assignment" ALTER COLUMN "type" TYPE "public"."AssignmentType_new" USING ("type"::text::"public"."AssignmentType_new");
ALTER TYPE "public"."AssignmentType" RENAME TO "AssignmentType_old";
ALTER TYPE "public"."AssignmentType_new" RENAME TO "AssignmentType";
DROP TYPE "public"."AssignmentType_old";
ALTER TABLE "public"."Assignment" ALTER COLUMN "type" SET DEFAULT 'ASSIGNMENT';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Assignment" ALTER COLUMN "type" SET DEFAULT 'ASSIGNMENT';

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "degreeId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudyLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMin" INTEGER NOT NULL,

    CONSTRAINT "StudyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "StudyLog_date_idx" ON "public"."StudyLog"("date");

-- AddForeignKey
ALTER TABLE "public"."StudyLog" ADD CONSTRAINT "StudyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudyLog" ADD CONSTRAINT "StudyLog_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;
