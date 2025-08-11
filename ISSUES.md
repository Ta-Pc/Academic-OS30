# E2E Testing Issues Report

## Testing Summary
**Date:** August 11, 2025  
**Branch:** finalize/wire-and-cleanup  
**Server:** http://localhost:3000  
**Total Tests Run:** 23  
**Failed Tests:** 9  
**Passed Tests:** 14  

## Critical Issues Found

### 1. Module Detail Pages - 500 Internal Server Error
**Severity:** CRITICAL  
**Error Type:** Server Error  
**Affected URLs:** 
- `/modules/cme6e8crg0006ucmc7pnsl4ho` (COS132)
- `/modules/cme6e8crm0008ucmc9pgyxyk7` (COS151)
- All individual module detail pages

**Issues:**
- **500 Internal Server Error** - All module detail pages return server errors
- **Consistent failure** - Multiple module IDs tested, all return 500 errors
- **Terminal errors** - Server-side crashes when accessing module detail routes

**Working URLs (Control Test):**
- `/` (200 OK)
- `/modules` (200 OK) - Module listing page works
- `/dashboard` (200 OK)
- `/week-view` (200 OK)

**Impact:** Users cannot view individual module details despite module listing working correctly.

### 2. Missing Expected UI Components in Week View (/week-view)
**Severity:** HIGH  
**Tests Affected:** 
- `week-first.spec.ts` (multiple test cases)
- `progression.spec.ts`

**Issues:**
- **"Top Priorities" section not found** - Tests expect a section with "Top Priorities" text but page shows task categories (Read, Study, Practice, Review, Admin)
- **"Modules" section not found** - No modules section exists in week view, only task categories and performance gauge
- **ElectiveTracker component missing** - Expected component with role "region" and name matching /elective progress/i not found
- **ProgressionWarningBadge missing** - Cards with "Warning" or "On Track" text not found

**Actual Content Found:**
- Week view shows "Weekly Mission Brief" with 5 task categories: Read, Study, Practice, Review, Admin (all showing "0 items" and "No tasks")
- Performance gauge showing "Study this week: 0 hrs"
- Only "Back to Dashboard" button for navigation

### 2. Missing Expected UI Components in Week View (/week-view)
**Severity:** HIGH  
**Tests Affected:** 
- `week-first.spec.ts` (multiple test cases)
- `progression.spec.ts`

**Issues:**
- **"Top Priorities" section not found** - Tests expect a section with "Top Priorities" text but page shows task categories (Read, Study, Practice, Review, Admin)
- **"Modules" section not found** - No modules section exists in week view, only task categories and performance gauge
- **ElectiveTracker component missing** - Expected component with role "region" and name matching /elective progress/i not found
- **ProgressionWarningBadge missing** - Cards with "Warning" or "On Track" text not found

**Actual Content Found:**
- Week view shows "Weekly Mission Brief" with 5 task categories: Read, Study, Practice, Review, Admin (all showing "0 items" and "No tasks")
- Performance gauge showing "Study this week: 0 hrs"
- Only "Back to Dashboard" button for navigation

**Impact:** Test expectations don't match actual UI design - either tests need updating or UI components are missing.

### 3. What-If Dialog Component Issues
**Severity:** HIGH  
**Tests Affected:**
- `what-if-dialog.spec.ts`
- `week-first.spec.ts` (what-if simulation flow)

**Issues:**
- **Missing "open-whatif" button** - Button with `data-testid="open-whatif"` not found
- **Strict mode violation** - Multiple close buttons found in what-if dialog causing ambiguity:
  ```
  1) <button class="btn btn-secondary btn-sm" aria-label="Close what-if dialog">×</button>
  2) <button disabled class="btn btn-ghost btn-sm">Close</button>
  ```

### 3. What-If Dialog Component Issues
**Severity:** HIGH  
**Tests Affected:**
- `what-if-dialog.spec.ts`
- `week-first.spec.ts` (what-if simulation flow)

**Issues:**
- **Missing "open-whatif" button** - Button with `data-testid="open-whatif"` not found
- **Strict mode violation** - Multiple close buttons found in what-if dialog causing ambiguity:
  ```
  1) <button class="btn btn-secondary btn-sm" aria-label="Close what-if dialog">×</button>
  2) <button disabled class="btn btn-ghost btn-sm">Close</button>
  ```

**Impact:** What-if simulation functionality is inaccessible to users.

### 4. Module Detail Navigation Issues
**Severity:** HIGH  
**Tests Affected:**
- `module-detail.spec.ts`

**Issues:**
- **STK110 module link not found** - Tests expect STK110 module but actual modules are COS132, COS151, COS212, COS226, etc.
- **Test data mismatch** - Tests assume specific modules (STK110, STK120) but seeded data contains different modules

**Actual Content Found:**
- Modules page (/modules) works correctly and shows: COS132 (Imperative Programming), COS151 (Intro to Computer Science), COS212 (Data Structures & Algorithms), COS226 (Computer Organisation), etc.
- All modules have "ACTIVE" status and proper navigation links

### 4. Module Detail Navigation Issues
**Severity:** HIGH  
**Tests Affected:**
- `module-detail.spec.ts`

**Issues:**
- **STK110 module link not found** - Tests expect STK110 module but actual modules are COS132, COS151, COS212, COS226, etc.
- **Test data mismatch** - Tests assume specific modules (STK110, STK120) but seeded data contains different modules

**Actual Content Found:**
- Modules page (/modules) works correctly and shows: COS132 (Imperative Programming), COS151 (Intro to Computer Science), COS212 (Data Structures & Algorithms), COS226 (Computer Organisation), etc.
- All modules have "ACTIVE" status and proper navigation links

**Impact:** Tests are failing due to outdated test data expectations, not broken functionality.

### 5. Empty Task Data Display
**Severity:** MEDIUM  
**Tests Affected:**
- `week-first.spec.ts` (tactical task completion flow)

**Issues:**
- **All task categories empty** - Read, Study, Practice, Review, Admin sections all show "0 items" and "No tasks"
- **No tactical tasks available** - Cannot test task completion workflow due to empty data
- **Study hours showing 0** - Performance gauge shows "0 hrs" with 0% progress

### 5. Empty Task Data Display
**Severity:** MEDIUM  
**Tests Affected:**
- `week-first.spec.ts` (tactical task completion flow)

**Issues:**
- **All task categories empty** - Read, Study, Practice, Review, Admin sections all show "0 items" and "No tasks"
- **No tactical tasks available** - Cannot test task completion workflow due to empty data
- **Study hours showing 0** - Performance gauge shows "0 hrs" with 0% progress

**Impact:** Week view is functional but contains no data for users to interact with.

### 6. Data Seeding/Display Issues
**Severity:** MEDIUM  
**Tests Affected:**
- `week-first.spec.ts` (stable data references test)

**Issues:**
- **Expected seed data not displaying** - STK120 module should be visible but is not found
- **Modules section missing** - Core module display functionality broken

**Impact:** Seeded test data is not being properly displayed to users.

## Working Functionality

### ✅ Direct API Tests
- **Direct API Import Test** - Successfully processes CSV data with correct mapping
- **Database seeding** - Works correctly with 2 modules imported (NODate1, NODate2)
- **Basic server startup** - Server starts successfully on port 3000

### ✅ Import Functionality
- Multiple import-related tests are passing
- CSV processing and data ingestion working correctly

## Root Cause Analysis

The issues suggest:

1. **Test-UI Mismatch** - E2E tests expect UI components and data that don't match the current implementation
2. **Data Seeding Issues** - Week view shows empty task lists, indicating either:
   - Data is not being properly seeded for week view
   - Data exists but is not being fetched/displayed correctly
3. **Test Data Assumptions** - Tests expect specific modules (STK110, STK120) but actual data contains different modules (COS series)
4. **Component Structure Differences** - Tests expect "Top Priorities" and "Modules" sections but actual UI has different structure

## Recommended Actions

### CRITICAL (P0)
1. **Fix Module Detail 500 Errors** - Investigate and resolve server-side crashes in module detail routes
2. **Check Server Logs** - Examine Next.js server logs for specific error details when accessing `/modules/[id]` routes

### Immediate (P1)
1. **Update Test Expectations** - Modify e2e tests to match actual UI structure (task categories vs "Top Priorities")
2. **Fix Test Data** - Update tests to use actual seeded modules (COS series) instead of expected STK modules
3. **Investigate Data Population** - Determine why week view shows empty task lists

### High Priority (P1)
1. **Fix What-If Dialog** - Resolve button conflicts and ensure proper rendering
2. **Week View Data** - Populate week view with actual task data or verify data fetching logic
3. **Test Data Consistency** - Ensure test data matches what's actually seeded

### Medium Priority (P2)
1. **Component Implementation** - Add missing ElectiveTracker and ProgressionWarningBadge if they're required features
2. **Test Suite Maintenance** - Review and update all e2e tests to match current UI implementation

## Testing Notes
- Database setup and seeding completed successfully
- Server runs without startup errors  
- Modules page (/modules) works correctly with proper module listings
- Week view (/week-view) renders correctly but shows empty task data
- **CRITICAL FINDING**: Module detail pages return 500 Internal Server Error consistently
- **Main Issue**: Test expectations don't match current UI implementation - this suggests either:
  - Tests were written for an older UI version
  - UI was changed but tests weren't updated
  - Some components are missing from current implementation
- **Secondary Issue**: Data population - week view shows no tasks despite successful database seeding
- **Terminal Error Confirmed**: Clicking module links causes server-side crashes (500 errors)
