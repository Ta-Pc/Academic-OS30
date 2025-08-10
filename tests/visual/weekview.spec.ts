import { test, expect } from '@playwright/test';

declare global {
  interface Window { __TEST_FLAG_UI_LIB__?: boolean; }
}

test.describe('WeekView visual', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure feature flag is enabled via query param fallback if env isn't injected
    await page.addInitScript(() => {
      window.__TEST_FLAG_UI_LIB__ = true;
    });
  });

  test('renders baseline', async ({ page }) => {
    // Navigate to week-view; environment should set NEXT_PUBLIC_FEATURE_UI_LIBRARY=true when launching dev server
    await page.goto('/week-view');
    await page.waitForLoadState('networkidle');
    // Wait for priorities section
    await page.locator('text=Top Priorities').first().waitFor({ state: 'visible' });
    const main = page.locator('main');
    await expect(main).toHaveScreenshot('weekview-baseline.png', { maxDiffPixels: 300 });
  });
});


