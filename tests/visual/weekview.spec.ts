import { test, expect } from '@playwright/test';

test.describe('WeekView visual', () => {
  test('renders baseline', async ({ page }) => {
    await page.goto('/week-view');
    await page.waitForLoadState('networkidle');
    const main = page.locator('main');
    await expect(main).toHaveScreenshot('weekview-baseline.png', { maxDiffPixels: 200 });
  });
});


