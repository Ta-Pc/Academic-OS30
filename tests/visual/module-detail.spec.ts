import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('ModuleDetail visual', () => {
  test.beforeAll(() => {
    try {
      execSync('docker compose up -d db', { stdio: 'inherit' });
      execSync('cross-env DATABASE_URL=postgresql://postgres:postgres@localhost:5432/academic_os?schema=public NEXT_PUBLIC_BASE_URL=http://localhost:3000 npx prisma migrate deploy', { stdio: 'inherit' });
      execSync('cross-env DATABASE_URL=postgresql://postgres:postgres@localhost:5432/academic_os?schema=public NEXT_PUBLIC_BASE_URL=http://localhost:3000 npm run seed:bit', { stdio: 'inherit' });
    } catch (e) {
      console.warn('Seeding skipped/failed (continuing):', (e as Error).message);
    }
  });

  test('renders baseline', async ({ page }) => {
    await page.goto('/dashboard?ui=1');
    await page.waitForLoadState('domcontentloaded');
    const first = page.locator('a[href^="/modules/"]').first();
    await first.waitFor({ state: 'visible', timeout: 20000 });
    const href = await first.getAttribute('href');
    if (!href) test.skip(true, 'No module link found');
    // Navigate via week view context first to set lastViewedWeek store (optional best-effort)
    await page.goto('/week-view?date=2025-08-04&ui=1');
    await page.waitForLoadState('domcontentloaded');
    // Now go to module
  await page.goto(href!.toString());
    await page.waitForLoadState('networkidle');
    const main = page.locator('main');
    await main.waitFor({ state: 'visible', timeout: 20000 });
    await expect(main).toHaveScreenshot('module-detail-baseline.png', { maxDiffPixels: 300 });
  });
});


