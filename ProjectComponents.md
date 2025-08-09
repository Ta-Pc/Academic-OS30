## Project Components Inventory

High-level inventory of the codebase: pages, API routes, UI components, state, utilities, database models, scripts, testing, config, and infrastructure.

### Overview
- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **UI**: Tailwind CSS with custom tokens and utility classes
- **State**: Zustand (`useUserStore`)
- **DB**: PostgreSQL via Prisma ORM
- **Testing/QA**: Playwright E2E, Jest (configured), Storybook (minimal), custom Node audit scripts

### Application Structure
- Root app layout: `src/app/layout.tsx` (global CSS, font, user hydration)
- Pages are server or client components under `src/app/`
  - Global user hydration helper: `src/app/user-boot.tsx`

### Pages (Routes)
- `/` → `src/app/page.tsx`
  - Dev: links to Weekly View and Dashboard; Prod: suggests login
- `/login` → `src/app/login/page.tsx`
  - Simple email input (placeholder)
- `/dashboard` → `src/app/dashboard/page.tsx`
  - Strategic overview; fetches `/api/dashboard`; displays `ModuleCard` grid and urgent widgets
- `/import` → `src/app/import/page.tsx`
  - Client wizard for CSV import (modules/assignments), uses `/api/import/*` and `AddModuleForm`
- `/modules/[moduleId]` → `src/app/modules/[moduleId]/page.tsx`
  - Module analytics page; SSR fetch `/api/modules/[id]/analytics`, then hydrates `ui-client-analytics.tsx`
  - Client analytics UI: `src/app/modules/[moduleId]/ui-client-analytics.tsx` (live refetch, assignment table)
- `/week-view` → `src/app/week-view/page.tsx`
  - Weekly Mission Brief: groups tactical tasks by type; shows `PerformanceGauge`
  - Task group list (client): `src/app/week-view/task-group-list.tsx` (optimistic toggle via `/api/tactical-tasks/[id]`)

### API Routes (App Router)
- `GET /api/health` → `src/app/api/health/route.ts`
  - Health check
- `GET /api/dashboard` → `src/app/api/dashboard/route.ts`
  - Summaries per module; urgent widgets (late, upcoming, at-risk); metrics (weighted average, tasks)
- `GET|POST /api/modules` → `src/app/api/modules/route.ts`
  - GET: modules with assignments/tasks + derived contributions
  - POST: create module
- `GET /api/modules/[moduleId]/analytics` → `src/app/api/modules/[moduleId]/analytics/route.ts`
  - Computes: totalWeightAssessed, currentObtainedMark, currentAverageMark, remainingWeight, requiredAveOnRemaining, predicted; returns enriched assignments
- `PATCH /api/assignments/[assignmentId]` → `src/app/api/assignments/[assignmentId]/route.ts`
  - Update score (0–100%); toggles status GRADED/PENDING
- Import pipeline:
  - `POST /api/import/parse` → `src/app/api/import/parse/route.ts`
  - `POST /api/import/preview` → `src/app/api/import/preview/route.ts` (validations; detect missing modules)
  - `POST /api/import/ingest` → `src/app/api/import/ingest/route.ts` (create modules/assignments)
  - `POST /api/import/create-missing-modules` → `src/app/api/import/create-missing-modules/route.ts`
- Session:
  - `GET /api/session/user` → `src/app/api/session/user/route.ts` (dev-only fallback: ensures a default user)
- Tactical tasks:
  - `PATCH /api/tactical-tasks/[taskId]` → `src/app/api/tactical-tasks/[taskId]/route.ts`
- Weekly view:
  - `GET /api/week-view` → `src/app/api/week-view/route.ts` (tasks for week, study logs, totals)

### UI Components (`src/components`)
- `ModuleCard.tsx`
  - Module summary card with average and contribution bar; links to module detail
- `AssignmentsTable.tsx`
  - Tabular assignment list with inline edit modal (scores); hooks `useUserStore`
- `AssignmentRow.tsx`
  - Simpler standalone row + modal (older flow)
- `AddModuleForm.tsx`
  - Create a module via `/api/modules`
- `PerformanceGauge.tsx`
  - Weekly study time gauge
- `WeeklyTimelineItem.tsx`
  - Compact assignment timeline card

### Client State & Bootstrapping
- `src/lib/user-store.ts` (Zustand)
  - Shape: `{ currentUser, setCurrentUser, hydrate }`
  - `hydrate()` fetches `/api/session/user` and stores in state
- `src/app/user-boot.tsx`
  - Client-side effect to run `hydrate()` on layout mount

### Utilities (`src/lib`)
- `base-url.ts` → `getBaseUrl()` chooses `NEXT_PUBLIC_BASE_URL` or localhost port
- `csv.ts`
  - CSV parsing via PapaParse; mapping suggesters; coercion helpers (`toNumber`, `toDate`); normalizers for status/type
- `api-helpers.ts` → `parseUserIdFromUrl()`
- `ensure-env.ts` (dev safety defaults for `DATABASE_URL`, `NEXT_PUBLIC_BASE_URL`)
- `prisma.ts` (Prisma client singleton)

### Server Helpers
- `src/server/auth.ts` (placeholder for future auth integration)

### Database (Prisma)
- Schema: `prisma/schema.prisma`
  - **User** 1—N **Module**, 1—N **StudyLog**, optional 1—N via **Degree**
  - **Degree** 1—N **Term**; **Term** 1—N **Module**
  - **Module** fields: code, title, creditHours, targetMark?, status, department?, faculty?, prerequisites?, ownerId, termId?
  - **AssessmentComponent** 1—N **Assignment** (optional grouping)
  - **Assignment** fields: title, description?, dueDate?, maxScore?, score?, weight, status, type, moduleId, componentId?
  - **TacticalTask** fields: title, status, type, dueDate, moduleId, source?, links?
  - **StudyLog** fields: userId, moduleId?, durationMin, loggedAt
- Migrations: `prisma/migrations/*`
- Seed: `prisma/seed.ts`
  - Creates example Degree/Term/User
  - Seeds modules: STK110, INF171, EKN120
  - Seeds assessment components and assignments with representative weights/scores
  - Seeds tactical tasks and study logs

### Styles & Design System
- Global styles: `src/styles/globals.css`
  - Base tokens: color palettes, radii
  - Component primitives: `.card`, `.badge`, `.btn`, `.input`, `.select`, `.table`
- Tailwind config: `tailwind.config.js` (colors, container, fonts), `postcss.config.js`

### Scripts & Tooling (`scripts/`)
- `verify-api.mjs`
  - Quick health checks for `/api/dashboard`, `/api/week-view`, and module analytics
- `test-import.mjs`
  - End-to-end import of sample modules and assignments from `sample-data/*.csv`
- `test-import-my.mjs`
  - Imports from `my_assesment_data.csv` using expected header mapping
- `full-audit.mjs`
  - Resets/Seeds DB; validates dashboard, analytics math, update flows, reset again; multi-base URL fallback
- `audit-full.mjs`
  - Comprehensive “Certificate of Correctness”: DB reset/seed, health wait, analytics math assertions, task toggle check, import preview/ingest, final cleanup

### Testing
- E2E: Playwright config `playwright.config.ts`
  - Project launches dev server; test: `tests/e2e/module-detail.spec.ts`
    - Navigates Dashboard → STK110; edits “Module Test 2” score to verify analytics update
- Unit: Jest configured (`jest.config.js`), but no unit tests present
- Storybook: minimal story `src/stories/ModuleCard.stories.tsx`

### Configuration & Entry
- `package.json` scripts
  - Dev/Build/Start, Lint/Format, Playwright e2e (`pretest:e2e` prepares DB via Docker + Prisma), audit scripts
- Next.js: `next.config.js` (strict mode)
- TypeScript: `tsconfig.json` (strict, path alias `@/*` → `src/*`)

### Infrastructure
- `docker-compose.yml`
  - Service `db`: Postgres 15 with `pgdata` volume, exposed on `5432`

### Environment Variables
- `DATABASE_URL` (Prisma datasource), dev default set in `ensure-env.ts`
- `NEXT_PUBLIC_BASE_URL` (client/server fetch base), dev default set in `ensure-env.ts`
- `PORT` (Next server port)

### Data Flows (High-Level)
- **Dashboard**
  - `page.tsx` calls `/api/dashboard?userId=...`
  - API aggregates modules + derived metrics; UI renders `ModuleCard` grid and urgency widgets
- **Module Analytics**
  - SSR fetch `/api/modules/[id]/analytics` computes contribution math; `ui-client-analytics.tsx` refetches on mount and after edits; `AssignmentsTable` allows editing scores → `PATCH /api/assignments/[id]`
- **CSV Importer**
  - Upload → `/api/import/parse` → Map → `/api/import/preview` (detect missing modules) → optional `/api/import/create-missing-modules` → `/api/import/ingest`
- **Weekly View & Tasks**
  - Server computes week range and returns tasks + study logs; client groups tasks by type and toggles via `/api/tactical-tasks/[id]`

### Sample & Seed Data
- `sample-data/modules.csv`, `sample-data/assignments.csv`
- `my_assesment_data.csv` (user-provided import file)

---

This inventory focuses on the major assemblies (“engine, brakes, steering”) rather than every small bolt. Use it to navigate and extend the system with confidence.


