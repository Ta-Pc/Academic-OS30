/*
  Warnings:

  - You are about to drop the column `weightPercent` on the `AssessmentComponent` table. All the data in the column will be lost.
  - You are about to drop the column `isCompleted` on the `Assignment` table. All the data in the column will be lost.
  - Added the required column `weight` to the `Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AssignmentStatus" AS ENUM ('PENDING', 'GRADED', 'DUE', 'LATE');

-- CreateEnum
CREATE TYPE "public"."AssignmentType" AS ENUM ('QUIZ', 'TEST', 'PRACTICAL', 'GROUP', 'CLASS_TEST', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ModuleStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DROPPED');

-- AlterTable
-- Backfill Assignment.weight from component before dropping the column
ALTER TABLE "public"."Assignment" ADD COLUMN IF NOT EXISTS "weight" DOUBLE PRECISION;
UPDATE "public"."Assignment" a
SET "weight" = COALESCE(a."weight", c."weightPercent")
FROM "public"."AssessmentComponent" c
WHERE a."componentId" = c."id";

ALTER TABLE "public"."AssessmentComponent" DROP COLUMN "weightPercent";

-- AlterTable
ALTER TABLE "public"."Assignment" DROP COLUMN "isCompleted",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "type" "public"."AssignmentType" NOT NULL DEFAULT 'OTHER',
-- weight added earlier for backfill
ALTER COLUMN "dueDate" DROP NOT NULL,
ALTER COLUMN "maxScore" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Module" ADD COLUMN     "department" TEXT,
ADD COLUMN     "faculty" TEXT,
ADD COLUMN     "personnel" JSONB,
ADD COLUMN     "prerequisites" TEXT,
ADD COLUMN     "status" "public"."ModuleStatus" NOT NULL DEFAULT 'ACTIVE';

-- Backfill weights using previous component weights when possible
-- Default any remaining null weights to 0
UPDATE "public"."Assignment" SET "weight" = 0 WHERE "weight" IS NULL;

-- Make weight NOT NULL
ALTER TABLE "public"."Assignment" ALTER COLUMN "weight" SET NOT NULL;
