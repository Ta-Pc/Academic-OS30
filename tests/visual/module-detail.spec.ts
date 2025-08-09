import { test, expect } from '@playwright/test';

test.describe('ModuleDetail visual', () => {
  test('renders baseline', async ({ page }) => {
    // Navigate to a sample module; assumes seeded DB provides at least one module id via dashboard link
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const first = page.locator('a[href^="/modules/"]').first();
    const href = await first.getAttribute('href');
    if (!href) test.skip(true, 'No module link found');
    await page.goto(href.toString());
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toHaveScreenshot('module-detail-baseline.png', { maxDiffPixels: 200 });
  });
});


