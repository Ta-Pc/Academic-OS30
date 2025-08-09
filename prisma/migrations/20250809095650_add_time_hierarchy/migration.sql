-- CreateEnum
CREATE TYPE "public"."TermType" AS ENUM ('SEMESTER', 'TRIMESTER', 'QUARTER');

-- AlterEnum
ALTER TYPE "public"."ModuleStatus" ADD VALUE 'INACTIVE';

-- AlterTable
ALTER TABLE "public"."Module" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Term" ADD COLUMN     "academicYearId" TEXT,
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "type" "public"."TermType" NOT NULL DEFAULT 'SEMESTER';

-- CreateTable
CREATE TABLE "public"."AcademicYear" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Assignment_dueDate_idx" ON "public"."Assignment"("dueDate");

-- CreateIndex
CREATE INDEX "Module_startDate_endDate_idx" ON "public"."Module"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "TacticalTask_dueDate_idx" ON "public"."TacticalTask"("dueDate");

-- AddForeignKey
ALTER TABLE "public"."Term" ADD CONSTRAINT "Term_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Term" ADD CONSTRAINT "Term_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AcademicYear" ADD CONSTRAINT "AcademicYear_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
