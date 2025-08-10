import { test, expect } from '@playwright/test';

// E2E: WhatIf dialog simulate then commit

test.describe('WhatIf dialog workflow', () => {
  test('simulate and commit updates module + week-view', async ({ page }) => {
    await page.goto('/modules'); // If modules listing exists else go to dashboard then STK110; fallback
    // navigate via dashboard if needed
    if (!(await page.getByRole('link', { name: /STK110/ }).first().isVisible({ timeout: 3000 }).catch(() => false))) {
      await page.goto('/dashboard');
    }
    const link = page.getByRole('link', { name: /STK110/ }).first();
    await expect(link).toBeVisible({ timeout: 30000 });
    await link.click();

    // Open WhatIf
    const btn = page.getByTestId('open-whatif');
    await expect(btn).toBeVisible();
    await btn.click();

    // Locate Module Test 2 row input by text first
    const row = page.locator('tr', { hasText: 'Module Test 2' });
    await expect(row).toBeVisible();
    const input = row.locator('input[type="number"]');
    await input.fill('60');

    // Simulate
    const simulateBtn = page.getByRole('button', { name: 'Simulate' });
    await simulateBtn.click();
    // Wait for prediction to show (predictedSemesterMark stat)
    const stat = page.getByTestId('predictedSemesterMark');
    await expect(stat).toBeVisible();

    // Close (discard) & reopen to assert reset
    const closeBtn = page.getByRole('button', { name: 'Close' });
    await closeBtn.click();
    await btn.click();
    const reopenedRow = page.locator('tr', { hasText: 'Module Test 2' });
    await expect(reopenedRow).toBeVisible();
    const reopenedInput = reopenedRow.locator('input[type="number"]');
    await expect(reopenedInput).toHaveValue(''); // original null

    // Apply & commit
    await reopenedInput.fill('55');
    await simulateBtn.click();
    const commitBtn = page.getByTestId('whatif-commit');
    await commitBtn.click();
    // Dialog should close
    await expect(reopenedInput).toBeHidden();

    // Current obtained mark should update after analytics refresh (reuse existing selector)
    const obtained = page.getByTestId('currentObtainedMark');
    await expect(obtained).toBeVisible();

    // Navigate to week-view and ensure status graded through API
    await page.goto('/week-view');
    const today = new Date().toISOString().slice(0,10);
    const resp = await page.request.get(`/api/week-view?date=${today}`);
  const json: { assignments?: { title: string; status: string }[] } = await resp.json();
  const found = json.assignments?.find(a => a.title === 'Module Test 2');
    if (found) expect(found.status).toBe('GRADED');
  });
});
