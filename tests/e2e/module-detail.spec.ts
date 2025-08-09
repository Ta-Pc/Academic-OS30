import { test, expect } from '@playwright/test';

test.describe('Module Detail Page workflow (STK110)', () => {
  test('editing Module Test 2 updates analytics', async ({ page }) => {
    // 1. Navigate to dashboard
    await page.goto('/dashboard');

    // 2. Click STK110 module link
    const moduleLink = page.getByRole('link').filter({ hasText: /STK110/i });
    await expect(moduleLink).toBeVisible({ timeout: 30000 });
    await moduleLink.click();

    // 3. Read initial currentObtainedMark
    const stat = page.getByTestId('currentObtainedMark');
    await expect(stat).toBeVisible();
    const beforeText = (await stat.textContent())?.trim() || '';

    // 4. Find "Module Test 2" row
    const row = page.locator('tr', { hasText: 'Module Test 2' });
    await expect(row).toBeVisible();

    // 5. Click its Edit button
    const editBtn = row.getByRole('button', { name: 'Edit' });
    await editBtn.click();

    // 6. Type "50" into modal input
    const input = page.getByTestId('score-input');
    await expect(input).toBeVisible();
    await input.fill('50');

    // 7. Click Save
    const save = page.getByTestId('save-score');
    await save.click();

    // 8. Wait for UI to update: the modal closes and stat changes
    await expect(input).toBeHidden();

    // Wait for stat text to change from beforeText
    await expect(stat).not.toHaveText(beforeText);

    // 9. Assert mathematically correct value
    // With STK110 seed: weights 50 (82%), 25 (40/50=80%), 12.5 (90%), 12.5 (80%), and Module Test 2 now 25 (50%)
    const expected = (82/100)*50 + (80/100)*25 + (90/100)*12.5 + (80/100)*12.5 + (50/100)*25;
    const expectedDisplay = `${(Math.round(expected * 10) / 10).toFixed(1)}%`;
    await expect(stat).toHaveText(expectedDisplay);
  });
});


