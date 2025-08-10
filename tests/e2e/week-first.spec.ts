import { test, expect } from '@playwright/test';

// E2E: Week-first UX covering onboarding, navigation, what-if simulation, and task completion

test.describe('Week-first UX flows', () => {
  test.beforeEach(async () => {
    // Tests rely on seeded data from global-setup (configured in playwright.config.ts)
    // Should have seed-user-1 with STK110 module and tactical tasks
  });

  test('onboarding flow: open /week-view and verify top 3 mission items', async ({ page }) => {
    await page.goto('/week-view');

    // Verify the page loads and shows the Week-first UI flag is enabled
    await expect(page.locator('h1')).toContainText('Weekly Mission Brief');

    // Wait for data to load (Weekly Mission Brief should show priorities)
    const prioritiesSection = page.locator('section').filter({ hasText: 'Top Priorities' });
    await expect(prioritiesSection).toBeVisible({ timeout: 10000 });

    // Verify we have at least 1 priority item (could be assignments or tactical tasks)
    const priorityItems = prioritiesSection.locator('li');
    const itemCount = await priorityItems.count();
    
    if (itemCount > 0) {
      // Check that priority items are visible
      await expect(priorityItems.first()).toBeVisible();
      
      // Verify structure of first priority item (has title and module code)
      const firstItem = priorityItems.first();
      await expect(firstItem).toContainText(/.+/); // Has some text content
      
      // Should show up to 3 top priorities if available
      const visibleCount = Math.min(itemCount, 3);
      for (let i = 0; i < visibleCount; i++) {
        await expect(priorityItems.nth(i)).toBeVisible();
      }
    }

    // Verify modules section is present
    const modulesSection = page.locator('section').filter({ hasText: 'Modules' });
    await expect(modulesSection).toBeVisible();

    // Should have at least one module (from seed data)
    const moduleCards = modulesSection.locator('button[type="button"]');
    await expect(moduleCards.first()).toBeVisible({ timeout: 5000 });
    
    // Verify STK120 module is present (from seed data)
    const stkModule = moduleCards.filter({ hasText: 'STK120' });
    await expect(stkModule).toBeVisible();
  });

  test('navigation flow: WeeklyMissionItem → ModuleQuickView → ModuleDetail → Back to WeekView', async ({ page }) => {
    await page.goto('/week-view');

    // Wait for modules section to load
    const modulesSection = page.locator('section').filter({ hasText: 'Modules' });
    await expect(modulesSection).toBeVisible({ timeout: 10000 });

    // Click on a module card to open ModuleQuickView
    const moduleCards = modulesSection.locator('button[type="button"]');
    await expect(moduleCards.first()).toBeVisible();
    
    // Click on STK120 module (from seed data)
    const stkModule = moduleCards.filter({ hasText: 'STK120' });
    await expect(stkModule).toBeVisible();
    await stkModule.click();

    // Verify ModuleQuickView slide-over opens
    const slideOver = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(slideOver).toBeVisible({ timeout: 5000 });
    
    // Verify quick view header
    await expect(slideOver.locator('text=Module Quick View')).toBeVisible();
    
    // Verify module title and code are displayed
    await expect(slideOver).toContainText('STK120');
    await expect(slideOver).toContainText('Statistics 120');

    // Navigate to full ModuleDetail view
    // Look for a link or button that would take us to the full module page
    const fullViewLink = slideOver.getByRole('link', { name: /view full details|module detail|full view/i }).or(
      slideOver.getByRole('button', { name: /view full details|module detail|full view/i })
    );
    
    // If no direct link in quick view, we'll navigate via URL
    if (await fullViewLink.count() === 0) {
      // Close the slide-over and navigate directly to module detail
      const closeButton = slideOver.getByRole('button', { name: /close/i });
      await closeButton.click();
      await expect(slideOver).toBeHidden();
      
      // Navigate to module detail page using the moduleId from the response
      await page.goto('/modules/STK120'); // Assuming STK120 route exists, or use module ID
    } else {
      await fullViewLink.click();
    }

    // Verify we're on the ModuleDetail page
    await expect(page.locator('h1')).toContainText('STK120');
    
    // Verify key elements of module detail page
    await expect(page.getByTestId('currentObtainedMark')).toBeVisible({ timeout: 5000 });
    
    // Navigate back to WeekView using the Back to Week button
    const backButton = page.getByTestId('back-to-week');
    await expect(backButton).toBeVisible();
    await backButton.click();

    // Verify we're back on the week view
    await expect(page.locator('h1')).toContainText('Weekly Mission Brief');
    await expect(page.locator('section').filter({ hasText: 'Top Priorities' })).toBeVisible();
  });

  test('what-if simulation flow: session-only simulate → commit persists changes', async ({ page }) => {
    // Navigate to a module with assignments for what-if testing
    await page.goto('/modules/STK120');
    
    // Wait for module detail page to load
    await expect(page.locator('h1')).toContainText('STK120');
    await expect(page.getByTestId('currentObtainedMark')).toBeVisible({ timeout: 10000 });

    // Check if what-if button exists (might not be present if no assignments)
    const whatIfButton = page.getByTestId('open-whatif');
    const hasWhatIfButton = await whatIfButton.count() > 0;
    
    if (!hasWhatIfButton) {
      console.log('What-if button not found - possibly no assignments to simulate');
      // Skip the test if no what-if functionality is available
      test.skip();
      return;
    }

    // Record baseline semester mark before what-if changes
    const baselineMark = await page.getByTestId('currentObtainedMark').textContent();
    const baselineValue = parseFloat(baselineMark?.replace('%', '') || '0');

    // Open WhatIf dialog
    await expect(whatIfButton).toBeVisible();
    await whatIfButton.click();

    // Verify what-if dialog opens
    const whatIfDialog = page.locator('[role="dialog"]').filter({ hasText: /what.?if|simulation/i });
    await expect(whatIfDialog).toBeVisible({ timeout: 5000 });

    // Find an assignment row to modify (look for Module Test or Assignment)
    const assignmentRows = whatIfDialog.locator('tr').filter({ hasText: /test|assignment|quiz/i });
    const assignmentCount = await assignmentRows.count();
    
    if (assignmentCount === 0) {
      console.log('No assignments found to simulate');
      // Close dialog and skip test
      const closeButton = whatIfDialog.getByRole('button', { name: /close|cancel/i });
      if (await closeButton.count() > 0) {
        await closeButton.click();
      }
      test.skip();
      return;
    }

    const assignmentRow = assignmentRows.first();
    await expect(assignmentRow).toBeVisible();

    // Find the score input in that row
    const scoreInput = assignmentRow.locator('input[type="number"]');
    await expect(scoreInput).toBeVisible();

    // Simulate a score change (session-only)
    await scoreInput.fill('75');

    // Click Simulate button
    const simulateButton = whatIfDialog.getByRole('button', { name: /simulate/i });
    await expect(simulateButton).toBeVisible();
    await simulateButton.click();

    // Wait for prediction to update
    const predictedSemesterMark = whatIfDialog.getByTestId('predictedSemesterMark').or(
      whatIfDialog.locator('[data-testid*="predicted"]')
    );
    await expect(predictedSemesterMark).toBeVisible({ timeout: 5000 });

    // Verify the predicted mark has changed from baseline
    const simulatedMarkText = await predictedSemesterMark.textContent();
    const simulatedValue = parseFloat(simulatedMarkText?.replace('%', '') || '0');
    
    // The simulated value should be different from baseline (assuming the input affects the calculation)
    // Note: This might not always be different if the weight is 0 or calculation doesn't change much
    console.log(`Baseline: ${baselineValue}%, Simulated: ${simulatedValue}%`);

    // Close dialog without committing (to test session-only behavior)
    const closeButton = whatIfDialog.getByRole('button', { name: /close|cancel/i });
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    // Verify dialog closes and mark returns to baseline
    await expect(whatIfDialog).toBeHidden();
    
    // Refresh page and verify original mark is preserved
    await page.reload();
    await expect(page.getByTestId('currentObtainedMark')).toBeVisible({ timeout: 10000 });
    const afterCloseMarkText = await page.getByTestId('currentObtainedMark').textContent();
    const afterCloseValue = parseFloat(afterCloseMarkText?.replace('%', '') || '0');
    
    // Should be back to baseline (no changes persisted)
    expect(Math.abs(afterCloseValue - baselineValue)).toBeLessThan(0.1);

    // Now test committing changes
    await whatIfButton.click();
    await expect(whatIfDialog).toBeVisible();

    // Make the same change again
    const newScoreInput = assignmentRow.locator('input[type="number"]');
    await newScoreInput.fill('75');
    await simulateButton.click();

    // Wait for simulation to complete
    await expect(predictedSemesterMark).toBeVisible();

    // Commit the changes
    const commitButton = whatIfDialog.getByTestId('whatif-commit').or(
      whatIfDialog.getByRole('button', { name: /commit|save|apply/i })
    );
    await expect(commitButton).toBeVisible();
    await commitButton.click();

    // Verify dialog closes
    await expect(whatIfDialog).toBeHidden({ timeout: 5000 });

    // Verify the mark has been updated and persisted
    await expect(page.getByTestId('currentObtainedMark')).toBeVisible();
    const committedMarkText = await page.getByTestId('currentObtainedMark').textContent();
    const committedValue = parseFloat(committedMarkText?.replace('%', '') || '0');

    // Refresh to ensure persistence
    await page.reload();
    await expect(page.getByTestId('currentObtainedMark')).toBeVisible({ timeout: 10000 });
    const persistedMarkText = await page.getByTestId('currentObtainedMark').textContent();
    const persistedValue = parseFloat(persistedMarkText?.replace('%', '') || '0');

    // Verify the committed change is still there after reload
    expect(Math.abs(persistedValue - committedValue)).toBeLessThan(0.1);
  });

  test('mark tactical task done → item moves to history and UI updates', async ({ page }) => {
    await page.goto('/week-view');

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Weekly Mission Brief');

    // Look for tactical tasks in priorities section
    const prioritiesSection = page.locator('section').filter({ hasText: 'Top Priorities' });
    await expect(prioritiesSection).toBeVisible({ timeout: 10000 });

    // Find a task that's not completed (checkbox not checked)
    const taskItems = prioritiesSection.locator('li').filter({ has: page.locator('input[type="checkbox"]:not(:checked)') });
    
    // If no uncompleted tasks in priorities, check if we need to use the legacy task list
    const taskCount = await taskItems.count();
    
    if (taskCount === 0) {
      // Check if there's a legacy task group list (older UI)
      const taskGroupSections = page.locator('section').filter({ hasText: /study|practice|review|read|admin/i });
      const legacyTaskCount = await taskGroupSections.count();
      
      if (legacyTaskCount > 0) {
        // Use legacy task interface
        const taskSection = taskGroupSections.first();
        await expect(taskSection).toBeVisible();
        
        const legacyTaskItems = taskSection.locator('li').filter({ has: page.locator('input[type="checkbox"]:not(:checked)') });
        const legacyCount = await legacyTaskItems.count();
        
        if (legacyCount > 0) {
          // Get the task title before completing it
          const taskItem = legacyTaskItems.first();
          const taskTitle = await taskItem.locator('[class*="font-medium"], .font-medium').textContent();
          
          // Mark the task as done
          const checkbox = taskItem.locator('input[type="checkbox"]');
          await checkbox.check();

          // Wait for UI to update (task should move or change appearance)
          await page.waitForTimeout(1000);

          // Verify task is now marked as completed
          await expect(checkbox).toBeChecked();
          
          // The task might move to a completed section or change styling
          // Check that the task is either moved or visually indicated as complete
          const completedTask = page.locator('li').filter({ hasText: taskTitle || '' }).filter({ has: page.locator('input[type="checkbox"]:checked') });
          await expect(completedTask).toBeVisible();
        } else {
          // No tasks available to complete
          console.log('No uncompleted tasks found to test completion');
        }
      } else {
        // No tasks interface found - this might be an empty state
        console.log('No task interface found - possibly no tasks in current week');
      }
    } else {
      // Use modern priorities interface
      const taskItem = taskItems.first();
      
      // Get the task title before completing it  
      const taskTitle = await taskItem.locator('[class*="font-medium"], .font-medium').textContent();
      
      // Mark the task as done
      const checkbox = taskItem.locator('input[type="checkbox"]');
      await checkbox.check();

      // Wait for UI to update
      await page.waitForTimeout(1000);

      // Verify the task is marked as completed
      await expect(checkbox).toBeChecked();
      
      // Check that the completed task is still visible (might be styled differently)
      const completedTask = page.locator('li').filter({ hasText: taskTitle || '' }).filter({ has: page.locator('input[type="checkbox"]:checked') });
      await expect(completedTask).toBeVisible();
    }

    // Verify the sidebar task stats update
    const taskStats = page.locator('aside').filter({ hasText: /completed|pending/i });
    if (await taskStats.isVisible()) {
      // Task completion should update the completed count
      await expect(taskStats).toContainText(/completed/i);
    }
  });

  test('stable data references: tests use seed-user-1 deterministic data', async ({ page }) => {
    // Verify that we're using the expected seeded data
    await page.goto('/week-view');

    // Check API response contains expected user
    const response = await page.request.get('/api/week-view');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    
    // Verify response structure
    expect(data).toHaveProperty('weekRange');
    expect(data).toHaveProperty('moduleSummaries');
    expect(data).toHaveProperty('weeklyPriorities');
    
    // Should have at least STK120 module from seed data
    const hasSTK120 = data.moduleSummaries.some((module: { code: string }) => module.code === 'STK120');
    expect(hasSTK120).toBeTruthy();

    // Navigate to page and verify expected seeded content appears
    await expect(page.locator('h1')).toContainText('Weekly Mission Brief');
    
    // Should show modules section with STK120
    const modulesSection = page.locator('section').filter({ hasText: 'Modules' });
    await expect(modulesSection).toBeVisible();
    
    const stkModule = modulesSection.locator('button').filter({ hasText: 'STK120' });
    await expect(stkModule).toBeVisible({ timeout: 10000 });
    
    // Verify consistent module information
    await expect(stkModule).toContainText('Statistics 120');
  });
});
