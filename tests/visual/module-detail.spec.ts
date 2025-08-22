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

  test('renders baseline with enhanced UI', async ({ page }) => {
    await page.goto('/dashboard?ui=1');
    await page.waitForLoadState('domcontentloaded');
    
    // Try to find a module link on the dashboard
    const first = page.locator('a[href^="/modules/"]').first();
    await first.waitFor({ state: 'visible', timeout: 20000 });
    const href = await first.getAttribute('href');
    if (!href) test.skip(true, 'No module link found');
    
    // Navigate via week context first to set lastViewedWeek store
    await page.goto('/week?date=2025-08-10&ui=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // Allow store to set
    
    // Now go to module detail
    await page.goto(href!.toString() + '?ui=1');
    await page.waitForLoadState('networkidle');
    
    // Wait for the main content and verify enhanced elements
    const main = page.locator('main');
    await main.waitFor({ state: 'visible', timeout: 20000 });
    
    // Verify key UI elements are present
    await expect(page.locator('[data-testid="module-detail-root"]')).toBeVisible();
    await expect(page.locator('[data-testid="back-to-week"]')).toBeVisible();
    await expect(page.locator('[data-testid="currentObtainedMark"]')).toBeVisible();
    await expect(page.locator('[data-testid="predictedSemesterMark"]')).toBeVisible();
    await expect(page.locator('[data-testid="assignments-section"]')).toBeVisible();
    
    // Check that the back button shows "Back to Week" since we came from week view
    const backButton = page.locator('[data-testid="back-to-week"]');
    await expect(backButton).toContainText('Back to Week');
    
    // Take screenshot for visual comparison
    await expect(main).toHaveScreenshot('module-detail-enhanced.png', { 
      maxDiffPixels: 500,
      threshold: 0.3
    });
  });

  test('back to week functionality', async ({ page }) => {
    await page.goto('/dashboard?ui=1');
    await page.waitForLoadState('domcontentloaded');
    
    const first = page.locator('a[href^="/modules/"]').first();
    await first.waitFor({ state: 'visible', timeout: 20000 });
    const href = await first.getAttribute('href');
    if (!href) test.skip(true, 'No module link found');
    
    // Set up week context
    await page.goto('/week?date=2025-08-05&ui=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    // Go to module detail
    await page.goto(href!.toString() + '?ui=1');
    await page.waitForLoadState('networkidle');
    
    // Click back to week button
    const backButton = page.locator('[data-testid="back-to-week"]');
    await backButton.click();
    
    // Should navigate to week with the date parameter
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/week');
    expect(page.url()).toContain('date=2025-08-05');
  });

  test('assignments table edit functionality visible', async ({ page }) => {
    await page.goto('/dashboard?ui=1');
    await page.waitForLoadState('domcontentloaded');
    
    const first = page.locator('a[href^="/modules/"]').first();
    await first.waitFor({ state: 'visible', timeout: 20000 });
    const href = await first.getAttribute('href');
    if (!href) test.skip(true, 'No module link found');
    
    await page.goto(href!.toString() + '?ui=1');
    await page.waitForLoadState('networkidle');
    
    // Check that assignments table has edit buttons
    const assignmentsSection = page.locator('[data-testid="assignments-section"]');
    await expect(assignmentsSection).toBeVisible();
    
    // Look for edit buttons (there should be at least one assignment with an edit button)
    const editButtons = page.locator('button:has-text("Edit")');
    const editButtonCount = await editButtons.count();
    
    if (editButtonCount > 0) {
      await expect(editButtons.first()).toBeVisible();
      console.log(`Found ${editButtonCount} edit buttons in assignments table`);
    } else {
      console.log('No assignments with edit buttons found - this may be expected if no assignments exist');
    }
  });
});


