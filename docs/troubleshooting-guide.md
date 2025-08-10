# Troubleshooting Guide

## Prisma ORM Issues

### Issue: "Unknown argument `termId`" Error in Module Creation

**Problem**: When trying to create/update modules with `termId` field directly in Prisma operations:

```typescript
// ❌ This fails:
await prisma.module.create({
  data: {
    // ... other fields
    termId: termId  // Prisma rejects this with "Unknown argument"
  }
});
```

**Root Cause**: Prisma schema defines `termId` as a foreign key field with a relation. Direct assignment of foreign key values is not allowed in create/update operations when there's a corresponding relation field.

**Solution**: Use Prisma's relation syntax instead:

```typescript
// ✅ This works:
await prisma.module.create({
  data: {
    // ... other fields
    term: { connect: { id: termId } }  // Use relation field
  }
});
```

**Schema Context**:
```prisma
model Module {
  termId  String?  // Foreign key field
  term    Term?    @relation(fields: [termId], references: [id])  // Relation field
}
```

**Prevention**: Always use relation syntax (`connect`, `create`, `connectOrCreate`) when working with foreign key relationships in Prisma.

---

## TypeScript/ESLint Issues

### Issue: `@typescript-eslint/no-explicit-any` Violations

**Problem**: ESLint pre-commit hooks failing due to `any` types in TypeScript code.

**Common Violations**:
1. Function parameters: `(f: any, i: number)`
2. Type assertions: `e.target.value as any`
3. Object types: `const data: any = {}`

**Solutions**:

1. **For API response types**:
```typescript
// ❌ Avoid:
result: any

// ✅ Use specific types:
result: {
  preview?: { valid?: unknown[]; errors?: unknown[] };
  successCount?: number;
  total?: number;
  failures?: Array<{ reason: string }>;
} | null
```

2. **For event handlers**:
```typescript
// ❌ Avoid:
onChange={(e) => onChangeImportType(e.target.value as any)}

// ✅ Use union types:
onChange={(e) => onChangeImportType(e.target.value as 'modules' | 'assignments')}
```

3. **For Prisma data types**:
```typescript
// ❌ Avoid:
const moduleData: any = { ... }

// ✅ Use Prisma generated types:
import { type Prisma } from '@prisma/client';
const moduleData: Prisma.ModuleCreateInput = { ... }
```

**Prevention**: 
- Use specific types instead of `any`
- Import and use generated Prisma types
- Define union types for known string literals
- Use `unknown` instead of `any` when type is truly unknown

---

## E2E Testing Issues

### Issue: Race Conditions in Database Operations

**Problem**: E2E tests failing intermittently due to timing issues between UI actions and database persistence.

**Common Scenarios**:
1. Import operations completing before database writes finish
2. Module creation not immediately visible in API responses
3. State updates not propagating to UI components

**Solutions**:

1. **Polling Pattern for Database Verification**:
```typescript
// ✅ Poll until data appears:
const targetCodes = ['MOD1', 'MOD2'];
let imported = [];
const start = Date.now();
while (Date.now() - start < 8000) {
  const resp = await page.request.get('/api/modules');
  if (resp.ok()) {
    const data = await resp.json();
    imported = data.modules.filter(m => targetCodes.includes(m.code));
    if (imported.length === 2) break;
  }
  await page.waitForTimeout(400);
}
```

2. **Wait for UI State Changes**:
```typescript
// ✅ Wait for elements with timeout:
await expect(continueBtn).toBeEnabled({ timeout: 5000 });
await expect(page.getByTestId('import-success-summary')).toBeVisible();
```

3. **Conditional Logic for UI Variations**:
```typescript
// ✅ Handle race conditions gracefully:
if (!(await continueBtn.isEnabled())) {
  // Fallback logic for race conditions
  await page.getByTestId('term-existing-radio').check();
  // ... select existing term
}
```

**Prevention**:
- Always use timeouts on UI state expectations
- Implement polling for database verification
- Add fallback logic for UI race conditions
- Use `page.waitForTimeout()` sparingly and prefer state-based waits

---

## CSV Import Flow Issues

### Issue: Complex Multi-Step Import Process

**Problem**: CSV import involves multiple steps (parse → map → preview → term mapping → ingest) with complex state management.

**Key Learnings**:

1. **Step Detection Logic**:
```typescript
// ✅ Detect missing dates to trigger term mapping:
if (importType === 'modules') {
  const hasStart = Object.values(mapping).includes('startDate');
  const hasEnd = Object.values(mapping).includes('endDate');
  if (!hasStart || !hasEnd) {
    setNeedsTermMapping(true);
    setStep(3); // Term mapping step
    return;
  }
}
```

2. **State Synchronization**:
```typescript
// ✅ Ensure term selection enables progression:
useEffect(() => {
  if (needsTermMapping) loadTerms();
}, [needsTermMapping]);
```

3. **API Integration**:
```typescript
// ✅ Pass termId to ingest API:
const res = await fetch('/api/import/ingest', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    importType, raw, mapping: fieldMap, 
    userId: currentUser?.id, 
    termId: selectedTermId  // Critical for term association
  })
});
```

**Prevention**:
- Design clear state flow diagrams before implementation
- Use TypeScript to enforce required props at each step
- Test each step independently before integration
- Implement comprehensive error handling at each stage

---

## Development Workflow Issues

### Issue: Pre-commit Hook Failures

**Problem**: Commits failing due to ESLint/TypeScript errors, requiring multiple fix iterations.

**Best Practices**:

1. **Run linting before committing**:
```bash
# Check for issues before commit:
npm run lint
npm run type-check  # if available
```

2. **Incremental fixing**:
```bash
# Fix and test incrementally:
git add specific-file.ts
git commit -m "fix: specific issue"
```

3. **Skip non-essential files**:
```bash
# Remove problematic non-essential files:
git reset HEAD scripts/generate-component-manifest.ts
```

**Prevention**:
- Set up IDE with ESLint integration
- Run linting checks during development
- Use TypeScript strict mode consistently
- Commit smaller, focused changes

---

## Architecture Decisions

### Key Patterns That Work Well

1. **Presentational/Container Separation**:
   - `ImporterShell.view.tsx` (presentational)
   - `Importer.container.tsx` (logic/state)

2. **API Route Organization**:
   - `/api/import/parse` - CSV parsing
   - `/api/import/preview` - Validation
   - `/api/import/ingest` - Final persistence
   - `/api/terms` - Term management

3. **Type Safety**:
   - Generated Prisma types for database operations
   - Explicit prop types for React components
   - Union types for string literals

### Lessons Learned

1. **Always use Prisma relation syntax** for foreign key operations
2. **Implement comprehensive E2E testing** with proper wait conditions
3. **Design state flow carefully** for multi-step processes
4. **Use TypeScript strictly** to catch issues early
5. **Test API endpoints independently** before UI integration

---

*Last updated: August 10, 2025*
*Context: Academic-OS30 CSV Importer with Term Mapping feature*
