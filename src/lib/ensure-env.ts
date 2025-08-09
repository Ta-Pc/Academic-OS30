/**
 * Ensures required env vars exist at runtime in development, without relying on dot-env files.
 * This is a safe local-only fallback. In production, configure real environment variables.
 */
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/academic_os?schema=public';
  }
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
  }
}

export {};


