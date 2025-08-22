# ESLint Best Practices for Academic OS

**Last Updated:** August 2025  
**Status:** ✅ Active - Follow these guidelines for code quality

## 📋 Overview

This document outlines the ESLint best practices and configuration for the Academic OS project. Following these guidelines ensures consistent code quality and prevents common TypeScript and React errors.

## 🚨 Common ESLint Errors and How to Avoid Them

### 1. Unused Variables (`@typescript-eslint/no-unused-vars`)
**Error Example:** `'data' is assigned a value but never used`

**Best Practices:**
- Remove unused function parameters
- Use underscore prefix for intentionally unused parameters: `_unusedParam`
- For catch blocks, omit the error variable if not used:
  ```typescript
  // ❌ Bad
  catch (error) {
    // error not used
  }
  
  // ✅ Good  
  catch {
    // no error variable
  }
  ```

### 2. Avoid `any` Type (`@typescript-eslint/no-explicit-any`)
**Error Example:** `Unexpected any. Specify a different type`

**Best Practices:**
- Always use proper TypeScript types instead of `any`
- Use `unknown` for values of unknown type
- Create proper interfaces for API responses
- Use union types for multiple possible types

### 3. Unused Function Parameters
**Error Example:** `'req' is defined but never used`

**Best Practices:**
- Remove unused function parameters
- Use object destructuring to only extract needed properties
- For API routes, only extract needed properties from request

## 🛠️ Current ESLint Configuration

The project uses a minimal ESLint configuration focused on critical quality rules:

### Active Rules:
- `@typescript-eslint/no-explicit-any`: 'error' - Prevents use of `any` type
- `react/react-in-jsx-scope`: 'off' - Not needed with React 17+ JSX transform

### Configuration File (.eslintrc.cjs):
```javascript
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'react'],
  parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
  settings: { react: { version: 'detect' } },
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'error'
  },
};
```

## ⚡ Quick Fix Commands

### Automatic Fixing:
```bash
# Run ESLint with automatic fixes
npm run lint -- --fix

# Check specific file
npx eslint path/to/file.tsx --fix
```

### Manual Code Quality Checks:
```bash
# Run full lint check
npm run lint

# Check specific directory
npx eslint src/components/ --ext .ts,.tsx
```

## 🔧 Pre-commit Hooks

**Current Status:** ⏸️ Temporarily disabled for development velocity

The project has lint-staged configured to run ESLint on staged files before commits. The configuration will be re-enabled once the codebase is fully stabilized.

**Planned Restoration:**
```json
{
  "*.{ts,tsx,js,jsx}": "eslint --fix",
  "*.{json,md}": "prettier --write"
}
```

## 📝 General Code Quality Guidelines

### 1. Type Safety
```typescript
// ❌ Avoid
const handleSomething = (data: any) => { ... }

// ✅ Use proper types
interface DataType {
  id: string;
  name: string;
}
const handleSomething = (data: DataType) => { ... }
```

### 2. Error Handling
```typescript
// ❌ Avoid unused error variables
try {
  // code
} catch (error) {
  // error not used
}

// ✅ Omit unused error variable
try {
  // code  
} catch {
  // handle error without variable
}

// ✅ Or use the error properly
try {
  // code
} catch (error) {
  console.error('Operation failed:', error);
  setErrorState(error.message);
}
```

### 3. API Route Parameters
```typescript
// ❌ Unused req parameter
export async function POST(req: NextRequest) {
  // req not used
}

// ✅ Only extract needed properties
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
}

// ✅ Or remove parameter if not used
export async function POST() {
  // handle request without req parameter
}
```

## 🎯 Common Fix Patterns

1. **Unused Variables**: Simply remove them from the code
2. **`any` Types**: Replace with proper TypeScript interfaces or specific types
3. **Unused Parameters**: Remove or use proper destructuring to extract needed values
4. **Catch Blocks**: Remove unused error variables or use them properly

## 🔗 Related Documentation

- [Troubleshooting Guide](./docs/troubleshooting-guide.md) - ESLint issue resolution
- [Settings Testing](./TODO-settings-testing.md) - ESLint compliance verification
- [Package.json](../package.json) - ESLint dependencies and scripts

## 📊 Compliance Status

- ✅ ESLint dependencies installed and configured
- ✅ Core rules active (`no-explicit-any`)
- ✅ TypeScript support enabled
- ⏸️ Pre-commit hooks temporarily disabled
- ✅ Codebase generally compliant with current rules

**Note:** The ESLint configuration is currently minimal to unblock development. Additional rules may be added as the codebase stabilizes.

