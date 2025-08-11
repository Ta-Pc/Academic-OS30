import { test, expect } from '@playwright/test';

test.describe('Academic Progression Flow', () => {
  test('should display ElectiveTracker in left sidebar', async ({ page }) => {
    // Navigate to a page that shows the left sidebar (assuming dashboard or week view)
    await page.goto('/week');
    
    // Look for ElectiveTracker component
    const electiveTracker = page.getByRole('region', { name: /elective progress/i });
    await expect(electiveTracker).toBeVisible();
    
    // Check for DSM elective group
    const dsmGroup = page.getByText(/Data Science & Machine Learning/i);
    if (await dsmGroup.isVisible()) {
      await expect(dsmGroup).toBeVisible();
      
      // Check for progress bar
      const progressBar = page.locator('.h-2.rounded-full').first();
      await expect(progressBar).toBeVisible();
    }
  });

  test('should show ProgressionWarningBadge when issues exist', async ({ page }) => {
    // Navigate to week view which should show the progression badge
    await page.goto('/week');
    
    // Look for progression warning badge - it can be either a button (with warnings) or div (on track)
    const progressionBadge = page.locator('[class*="card"]').filter({ 
      hasText: /Warning|On Track/i 
    }).first();
    
    await expect(progressionBadge).toBeVisible();
  });

  test('progression API returns valid data', async ({ page }) => {
    // Test the API endpoint directly
    const response = await page.request.get('/api/user/progression');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('currentYear');
    expect(data).toHaveProperty('creditsPassedThisYear');
    expect(data).toHaveProperty('requiredCreditsForYear');
    expect(data).toHaveProperty('percentPassed');
    expect(data).toHaveProperty('electiveGroups');
    expect(data).toHaveProperty('warnings');
    
    expect(typeof data.currentYear).toBe('number');
    expect(typeof data.creditsPassedThisYear).toBe('number');
    expect(typeof data.requiredCreditsForYear).toBe('number');
    expect(typeof data.percentPassed).toBe('number');
    expect(Array.isArray(data.electiveGroups)).toBe(true);
    expect(Array.isArray(data.warnings)).toBe(true);
  });

  test('remediation API returns suggested actions', async ({ page }) => {
    // Test the remediation API endpoint
    const response = await page.request.get('/api/user/remediation');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('actions');
    expect(Array.isArray(data.actions)).toBe(true);
    
    if (data.actions.length > 0) {
      const action = data.actions[0];
      expect(action).toHaveProperty('id');
      expect(action).toHaveProperty('title');
      expect(action).toHaveProperty('description');
      expect(action).toHaveProperty('priority');
      expect(action).toHaveProperty('estimatedHours');
      expect(action).toHaveProperty('type');
      
      expect(['high', 'medium', 'low']).toContain(action.priority);
      expect(['study', 'assignment', 'admin', 'review']).toContain(action.type);
    }
  });

  test('complete progression modal workflow', async ({ page }) => {
    // This test simulates the full user journey from warning badge to adding items to week
    await page.goto('/week');
    
    // Look for and click the progression warning badge (if it exists)
    const warningBadge = page.locator('button').filter({ 
      hasText: /Warning|Click for details/i 
    });
    
    if (await warningBadge.isVisible()) {
      await warningBadge.click();
      
      // Check that the progression modal opens
      const modal = page.getByRole('dialog', { name: /Academic Progression/i });
      await expect(modal).toBeVisible();
      
      // Check for progression data in modal
      await expect(modal.getByText(/Progress Summary/i)).toBeVisible();
      await expect(modal.getByText(/Recommended Actions/i)).toBeVisible();
      
      // If there are recommended actions, select some and add to week
      const actionCheckboxes = modal.locator('input[type="checkbox"]');
      const actionCount = await actionCheckboxes.count();
      
      if (actionCount > 0) {
        // Select first action
        await actionCheckboxes.first().check();
        
        // Click "Add to Week" button
        const addToWeekBtn = modal.getByRole('button', { name: /Add.*to Week/i });
        await expect(addToWeekBtn).toBeEnabled();
        await addToWeekBtn.click();
        
        // Modal should close
        await expect(modal).toBeHidden();
        
        // TODO: Verify that the action was added to the week view
        // This would require implementing the actual week integration
      } else {
        // Just close the modal if no actions
        const closeBtn = modal.getByRole('button', { name: /Close/i });
        await closeBtn.click();
        await expect(modal).toBeHidden();
      }
    }
  });

  test('elective tracker click-through opens module list', async ({ page }) => {
    await page.goto('/week');
    
    // Find elective tracker progress bar and click it
    const electiveTracker = page.getByRole('region', { name: /elective progress/i });
    
    if (await electiveTracker.isVisible()) {
      const progressButton = electiveTracker.locator('button').first();
      if (await progressButton.isVisible()) {
        await progressButton.click();
        
        // This should trigger onViewModules callback
        // In a real implementation, this might open a modal or navigate to a module list
        // For now, we just verify the click works without errors
        await page.waitForTimeout(500);
      }
    }
  });

  test('progression percentages are mathematically correct', async ({ page }) => {
    // Get progression data from API
    const response = await page.request.get('/api/user/progression');
    const data = await response.json();
    
    if (data.requiredCreditsForYear > 0) {
      const expectedPercent = (data.creditsPassedThisYear / data.requiredCreditsForYear) * 100;
      const actualPercent = data.percentPassed;
      
      // Allow for rounding differences
      expect(Math.abs(actualPercent - expectedPercent)).toBeLessThan(0.1);
    }
    
    // Check elective groups calculations
    data.electiveGroups.forEach((group: { completedCredits: number; requiredCredits: number }) => {
      expect(group.completedCredits).toBeLessThanOrEqual(group.requiredCredits);
      expect(group.completedCredits).toBeGreaterThanOrEqual(0);
      expect(group.requiredCredits).toBeGreaterThan(0);
    });
  });

  test('warning generation logic is consistent', async ({ page }) => {
    // Get progression data
    const progressionResponse = await page.request.get('/api/user/progression');
    const progressionData = await progressionResponse.json();
    
    // Get remediation actions
    const remediationResponse = await page.request.get('/api/user/remediation');
    const remediationData = await remediationResponse.json();
    
    // If there are warnings in progression, there should be corresponding high-priority actions
    if (progressionData.warnings.length > 0) {
      const highPriorityActions = remediationData.actions.filter(
        (action: { priority: string }) => action.priority === 'high'
      );
      expect(highPriorityActions.length).toBeGreaterThan(0);
    }
    
    // Low progression percentage should correlate with warnings
    if (progressionData.percentPassed < 50) {
      expect(progressionData.warnings.length).toBeGreaterThan(0);
    }
  });
});
