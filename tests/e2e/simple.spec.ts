import { test, expect } from '@playwright/test';

test('should display the main page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h2')).toContainText('Weekly Mission Brief');

  // Wait for data to load (Weekly Mission Brief should show priorities)
  const prioritiesSection = page.locator('section').filter({ hasText: 'Top Priorities' });
  await expect(prioritiesSection).toBeVisible({ timeout: 10000 });

  // Verify modules section is present
  const modulesSection = page.locator('section').filter({ hasText: 'Modules' });
  await expect(modulesSection).toBeVisible();

  const debugData = await page.getByTestId('debug-week-data').textContent();
  console.log('--- DEBUG: Received weekData from page ---', debugData);
});

test('should display the settings page', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('academicos-nav-settings').click();
  await expect(page.locator('h2')).toContainText('System Settings');
});
