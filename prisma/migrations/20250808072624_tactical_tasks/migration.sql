/*
  Warnings:

  - You are about to drop the column `objectiveId` on the `StudyLog` table. All the data in the column will be lost.
  - You are about to drop the `LearningObjective` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AssignmentObjectives` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."TacticalTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."TacticalTaskType" AS ENUM ('READ', 'STUDY', 'PRACTICE', 'REVIEW', 'ADMIN');

-- DropForeignKey
ALTER TABLE "public"."LearningObjective" DROP CONSTRAINT "LearningObjective_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudyLog" DROP CONSTRAINT "StudyLog_objectiveId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AssignmentObjectives" DROP CONSTRAINT "_AssignmentObjectives_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AssignmentObjectives" DROP CONSTRAINT "_AssignmentObjectives_B_fkey";

-- AlterTable
ALTER TABLE "public"."StudyLog" DROP COLUMN "objectiveId";

-- DropTable
DROP TABLE "public"."LearningObjective";

-- DropTable
DROP TABLE "public"."_AssignmentObjectives";

-- CreateTable
CREATE TABLE "public"."TacticalTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "public"."TacticalTaskStatus" NOT NULL DEFAULT 'PENDING',
    "type" "public"."TacticalTaskType" NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "moduleId" TEXT NOT NULL,
    "source" TEXT,
    "links" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TacticalTask_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."TacticalTask" ADD CONSTRAINT "TacticalTask_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
