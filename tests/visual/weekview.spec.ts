import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

declare global {
  interface Window { __TEST_FLAG_UI_LIB__?: boolean; }
}

test.describe('WeekView visual', () => {
  test.beforeAll(() => {
    // Seed database (best-effort); ignore failures so test can still run in offline mode
    try {
      execSync('docker compose up -d db', { stdio: 'inherit' });
      execSync('cross-env DATABASE_URL=postgresql://postgres:postgres@localhost:5432/academic_os?schema=public NEXT_PUBLIC_BASE_URL=http://localhost:3000 npx prisma migrate deploy', { stdio: 'inherit' });
      execSync('cross-env DATABASE_URL=postgresql://postgres:postgres@localhost:5432/academic_os?schema=public NEXT_PUBLIC_BASE_URL=http://localhost:3000 npm run seed:bit', { stdio: 'inherit' });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Seeding skipped/failed (continuing):', (e as Error).message);
    }
  });
  test.beforeEach(async ({ page }) => {
    // Ensure feature flag is enabled via query param fallback if env isn't injected
    await page.addInitScript(() => {
      window.__TEST_FLAG_UI_LIB__ = true;
    });
  });

  test('renders baseline', async ({ page }) => {
    // Navigate to week-view; environment should set NEXT_PUBLIC_FEATURE_UI_LIBRARY=true when launching dev server
  await page.goto('/week-view?ui=1');
    await page.waitForLoadState('networkidle');
    // Wait for priorities section
    await page.locator('text=Top Priorities').first().waitFor({ state: 'visible' });
    const main = page.locator('main');
    await expect(main).toHaveScreenshot('weekview-baseline.png', { maxDiffPixels: 300 });
  });
});


