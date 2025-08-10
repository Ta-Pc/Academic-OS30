-- Revised migration (idempotent) to add curriculum metadata fields.
-- Safe to run on fresh or existing dev databases.
-- If the enum already exists, swallow duplicate errors.

DO $$ BEGIN
  CREATE TYPE "public"."ModuleSpan" AS ENUM ('SEMESTER', 'YEAR', 'QUARTER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "public"."Module"
  ADD COLUMN IF NOT EXISTS "electiveGroup" TEXT,
  ADD COLUMN IF NOT EXISTS "isCore" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "span" "public"."ModuleSpan" NOT NULL DEFAULT 'SEMESTER';

