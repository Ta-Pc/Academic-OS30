import { test, expect } from '@playwright/test';

test.describe('Academic Progression API Tests', () => {
  test('progression API returns valid data structure', async ({ request }) => {
    // Test the API endpoint directly
    const response = await request.get('http://localhost:3000/api/user/progression');
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

  test('remediation API returns suggested actions with correct structure', async ({ request }) => {
    // Test the remediation API endpoint
    const response = await request.get('http://localhost:3000/api/user/remediation');
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
      expect(typeof action.estimatedHours).toBe('number');
    }
  });

  test('progression percentages are mathematically correct', async ({ request }) => {
    // Get progression data from API
    const response = await request.get('http://localhost:3000/api/user/progression');
    const data = await response.json();

    if (data.requiredCreditsForYear > 0) {
      const expectedPercent = Math.round((data.creditsPassedThisYear / data.requiredCreditsForYear) * 100);
      const actualPercent = data.percentPassed;

      // The test now aligns with the API's rounding logic.
      expect(actualPercent).toEqual(expectedPercent);
    }

    // Check elective groups calculations
    data.electiveGroups.forEach((group: { completedCredits: number; requiredCredits: number }) => {
      expect(group.completedCredits).toBeLessThanOrEqual(group.requiredCredits);
      expect(group.completedCredits).toBeGreaterThanOrEqual(0);
      expect(group.requiredCredits).toBeGreaterThan(0);
    });
  });

  test('warning generation logic is consistent with remediation actions', async ({ request }) => {
    // Get progression data
    const progressionResponse = await request.get('http://localhost:3000/api/user/progression');
    const progressionData = await progressionResponse.json();

    // Get remediation actions
    const remediationResponse = await request.get('http://localhost:3000/api/user/remediation');
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

  test('remediation actions are properly prioritized', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/user/remediation');
    const data = await response.json();

    if (data.actions.length > 1) {
      const priorities = data.actions.map((action: { priority: string }) => action.priority);
      const priorityOrder = { high: 3, medium: 2, low: 1 };

      // Check that actions are sorted by priority (high first)
      for (let i = 0; i < priorities.length - 1; i++) {
        const currentPriority = priorityOrder[priorities[i] as keyof typeof priorityOrder];
        const nextPriority = priorityOrder[priorities[i + 1] as keyof typeof priorityOrder];
        expect(currentPriority).toBeGreaterThanOrEqual(nextPriority);
      }
    }
  });

  test('API handles edge cases gracefully', async ({ request }) => {
    // Test with non-existent endpoints to ensure proper error handling
    const invalidResponse = await request.get('http://localhost:3000/api/user/invalid-endpoint');
    expect(invalidResponse.status()).toBe(404);
  });
});
