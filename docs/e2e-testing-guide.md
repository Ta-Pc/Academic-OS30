# Week-First E2E Testing Guide

This document describes the Week-first UX end-to-end tests implemented for the Academic OS application.

## Overview

The Week-first E2E tests cover the core user flows of the Week-first UX, ensuring that students can effectively navigate between the weekly mission view, module details, and complete key actions like task management and what-if simulations.

## Test Coverage

### 1. Onboarding Flow (`onboarding flow: open /week-view and verify top 3 mission items`)
- **Purpose**: Verifies that the week-view page loads correctly with the UI library feature flag enabled
- **Checks**:
  - Page displays "Weekly Mission Brief" header
  - Top Priorities section is visible and populated
  - Modules section shows available modules
  - STK120 module is present from seed data

### 2. Navigation Flow (`navigation flow: WeeklyMissionItem → ModuleQuickView → ModuleDetail → Back to WeekView`)
- **Purpose**: Tests the complete navigation workflow from week view to module detail and back
- **Flow**:
  1. Open week-view page
  2. Click on a module card (STK120) to open ModuleQuickView slide-over
  3. Navigate to full ModuleDetail page
  4. Use "Back to Week" button to return to week view
- **Validation**: Each step displays the expected UI elements and content

### 3. What-If Simulation Flow (`what-if simulation flow: session-only simulate → commit persists changes`)
- **Purpose**: Tests the what-if simulation functionality for grade projections
- **Features**:
  - Session-only simulation (changes not persisted until committed)
  - Commit functionality that persists changes
  - Graceful handling when no assignments are available
- **Note**: Test is skipped if no what-if button or assignments are found

### 4. Task Completion (`mark tactical task done → item moves to history and UI updates`)
- **Purpose**: Verifies that users can mark tactical tasks as complete
- **Checks**:
  - Task completion toggles checkbox state
  - UI updates to reflect completed status
  - Task stats in sidebar update accordingly
- **Note**: Gracefully handles cases where no tasks are available in the current week

### 5. Data Consistency (`stable data references: tests use seed-user-1 deterministic data`)
- **Purpose**: Ensures tests use consistent, deterministic data
- **Validation**:
  - API responses have expected structure
  - STK120 module is consistently available
  - Module information displays correctly

## Running the Tests

### Prerequisites
1. Database must be running (Docker Compose)
2. Database must be seeded with test data
3. `NEXT_PUBLIC_FEATURE_UI_LIBRARY=true` environment variable must be set

### Local Development
```bash
# Run all week-first E2E tests
npm run test:e2e:week-first

# Run with specific options
NEXT_PUBLIC_FEATURE_UI_LIBRARY=true npx playwright test tests/e2e/week-first.spec.ts

# Run in headed mode for debugging
NEXT_PUBLIC_FEATURE_UI_LIBRARY=true npx playwright test tests/e2e/week-first.spec.ts --headed

# Run with reporter
NEXT_PUBLIC_FEATURE_UI_LIBRARY=true npx playwright test tests/e2e/week-first.spec.ts --reporter=list
```

### Continuous Integration
The tests are integrated into GitHub Actions and run automatically on:
- Push to main branch
- Pull requests
- Manual workflow dispatch

## Test Data Dependencies

The tests rely on seeded data from the BIT (DSM) curriculum:
- **Primary User**: "Basic Student" (automatically used by session API)
- **Key Module**: STK120 (Statistics 120) - consistently available across test runs
- **Alternative Modules**: STK220, INF171, COS212, etc.

## Configuration

### Playwright Configuration
- **Global Setup**: `tests/fixtures/global-setup.ts` ensures database is seeded
- **Base URL**: `http://localhost:3000`
- **Timeouts**: 60 seconds per test, 120 seconds for web server startup
- **Feature Flag**: `NEXT_PUBLIC_FEATURE_UI_LIBRARY=true` required for new UI

### CI Configuration
- **Database**: PostgreSQL 15 service
- **Environment Variables**: Set in GitHub Actions workflow
- **Dependencies**: Automatic Playwright browser installation
- **Artifacts**: Test reports uploaded on failure

## Troubleshooting

### Common Issues

1. **Tests fail with "STK120 not found"**
   - Ensure database is properly seeded with `npm run seed:bit`
   - Check that the correct user session is active

2. **What-if test is skipped**
   - Expected behavior when no assignments exist in the module
   - Test gracefully handles this scenario

3. **Task completion test shows "No task interface found"**
   - Expected when no tactical tasks exist for the current week
   - Test logs this condition and continues

4. **Feature flag not working**
   - Ensure `NEXT_PUBLIC_FEATURE_UI_LIBRARY=true` is set
   - Restart development server after setting environment variable

### Debugging

1. **Use headed mode**: Add `--headed` flag to see browser interactions
2. **Check console logs**: Tests include `console.log` statements for debugging
3. **Verify API responses**: Tests validate API endpoints before UI interactions
4. **Database state**: Ensure seed data matches test expectations

## Maintenance

### Updating Tests
When making changes to the Week-first UX:

1. **UI Changes**: Update selectors if component structure changes
2. **Data Changes**: Modify test expectations if seed data structure changes
3. **Flow Changes**: Adjust test steps if navigation workflows change
4. **New Features**: Add corresponding test cases for new functionality

### Adding New Tests
Follow the existing pattern:
1. Use descriptive test names that explain the user flow
2. Include proper assertions for each step
3. Handle graceful failures for optional features
4. Validate both UI state and API responses
5. Use deterministic test data

## Integration with CI/CD

The E2E tests are integrated into the main CI pipeline:
- **Trigger**: Runs after successful build and unit tests
- **Environment**: Fresh PostgreSQL database per run
- **Isolation**: Each test run starts with clean, seeded data
- **Reporting**: Test results and artifacts available in GitHub Actions
- **Failure Handling**: Screenshots and traces captured on failure

This ensures that the Week-first UX functionality is validated with every code change, maintaining a high level of confidence in the user experience.
