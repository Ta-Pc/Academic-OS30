/*
  Warnings:

  - You are about to drop the column `ownerId` on the `AcademicYear` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Term` table. All the data in the column will be lost.
  - You are about to drop the `StudyLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AcademicYear" DROP CONSTRAINT "AcademicYear_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Module" DROP CONSTRAINT "Module_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudyLog" DROP CONSTRAINT "StudyLog_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudyLog" DROP CONSTRAINT "StudyLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Term" DROP CONSTRAINT "Term_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_degreeId_fkey";

-- AlterTable
ALTER TABLE "public"."AcademicYear" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "public"."Module" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "public"."Term" DROP COLUMN "ownerId";

-- DropTable
DROP TABLE "public"."StudyLog";

-- DropTable
DROP TABLE "public"."User";
