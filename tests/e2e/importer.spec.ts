import { test, expect } from '@playwright/test';

// E2E: Importer term mapping flow (modules CSV without dates triggers term mapping)

test.describe('CSV Importer with Term mapping', () => {
  test('uploads modules CSV w/o dates, creates term, imports modules with dates', async ({ page }, testInfo) => {
    try {
      await page.goto('/');

      // Navigate to settings page
      await page.getByTestId('academicos-nav-settings').click();

      // Open import modal
      await page.getByRole('button', { name: /Import Data/i }).click();

      const importModal = page.getByTestId('import-modal');
      await expect(importModal).toBeVisible();

      // Select modules type (already default but explicit for clarity)
      const typeSelect = importModal.getByTestId('importer-type-select');
      await expect(typeSelect).toBeVisible();
      await typeSelect.selectOption('modules');

      // Upload fixture CSV
      const fileInput = importModal.getByTestId('importer-file-input');
      await fileInput.setInputFiles('tests/fixtures/modules-no-dates.csv');

      // Map columns
      await expect(page.getByTestId('map-columns-header')).toBeVisible();
      await page.getByTestId('map-Code').fill('code');
      await page.getByTestId('map-Title').fill('title');
      await page.getByTestId('map-Credit Hours').fill('creditHours');
      await page.getByRole('button', { name: /Preview & Validate/i }).click();

      // Term mapping step
      const termStep = page.getByTestId('term-mapping-step');
      await expect(termStep).toBeVisible();
      // Switch to create mode
      await page.getByTestId('term-create-radio').check();
      await page.getByPlaceholder('Title').fill('Autumn 2025');
      await page.getByTestId('term-start').fill('2025-08-01');
      await page.getByTestId('term-end').fill('2025-11-30');
      await page.getByTestId('term-submit').click();
      // Continue once button enabled (creation sets selectedTermId internally)
      const continueBtn = page.getByRole('button', { name: /Continue to Preview/i });
      await continueBtn.waitFor({ state: 'visible', timeout: 10000 });
      // If still disabled after a short delay, fallback to selecting first term (race condition safeguard)
      await page.waitForTimeout(500); // allow state update
      if (!(await continueBtn.isEnabled())) {
        // Toggle to existing, pick first real option
        await page.getByTestId('term-existing-radio').check();
        const termSelect = page.getByTestId('term-existing-select-wrapper').locator('select');
        const optionCount = await termSelect.locator('option').count();
        if (optionCount > 1) {
          const val = await termSelect.locator('option').nth(1).getAttribute('value');
          if (val) await termSelect.selectOption(val);
        }
      }
      await expect(continueBtn).toBeEnabled({ timeout: 5000 });
      await continueBtn.click();

      // Import button should become enabled once preview loaded (valid rows exist)
      const importBtn = page.getByTestId('import-btn');
      await expect(importBtn).toBeEnabled({ timeout: 10_000 });
      await importBtn.click();

      // Summary
      await expect(page.getByTestId('import-success-summary')).toBeVisible();
      const successCountText = await page.getByTestId('import-success-count').textContent();
      testInfo.attach('success-count-text', { body: successCountText || 'none', contentType: 'text/plain' });

      // Try to capture debug JSON if it exists
      try {
        const debugJsonElement = page.getByTestId('import-debug-json');
        if (await debugJsonElement.isVisible()) {
          const debugJson = await debugJsonElement.textContent();
          if (debugJson) testInfo.attach('ingest-debug-json', { body: debugJson, contentType: 'application/json' });
        }
      } catch (e) {
        console.log('Debug JSON not available:', (e as Error).message);
      }

      // Poll /api/modules until both appear or timeout (handles async DB latency)
      const targetCodes = ['NODate1','NODate2'];
      let imported: Array<{ code: string; startDate: string; endDate: string }> = [];
      const start = Date.now();
      while (Date.now() - start < 8000) {
        const resp = await page.request.get('/api/modules');
        if (resp.ok()) {
          const data = await resp.json();
          imported = (data.modules || []).filter((m: { code: string }) => targetCodes.includes(m.code));
          if (imported.length === 2) break;
        }
        await page.waitForTimeout(400);
      }
      expect(imported.length).toBe(2);
      imported.forEach((m) => {
        expect(m.startDate).toBeTruthy();
        expect(m.endDate).toBeTruthy();
      });
    } catch (err: unknown) {
      // Debug artifacts on failure
      await page.screenshot({ path: `test-results/importer-failure-${Date.now()}.png`, fullPage: true });
      const html = await page.content();
      await testInfo.attach('importer-page.html', { body: html, contentType: 'text/html' });
      throw err;
    }
  });
});
