# Academic OS Phase 0: Component Inventory & Reconnaissance

**Date**: August 10, 2025  
**Mission**: Map existing components to Academic OS flow requirements and identify composition gaps

---

## 🎯 **TARGET ACADEMIC OS FLOWS**

### Core Views Required
1. **Weekly View** (Landing) → Module Detail → Strategic → What-If → Settings
2. **Module Detail** → Strategic Analytics → What-If Planner
3. **Strategic Analytics** → Module Detail → What-If 
4. **What-If Planner** (from Weekly or Strategic)
5. **Settings** (from header navigation)

### Overlays Required
- Add Task Modal
- Onboarding/Setup Modal (first-run or settings trigger)

---

## 📋 **EXISTING COMPONENT MAPPING**

### ✅ **AVAILABLE COMPONENTS** (Ready for Reuse)

#### **Week View System**
| Need | Existing Component | Location | Status |
|------|-------------------|----------|---------|
| Weekly Landing Container | `WeekViewContainer` | `src/app/week-view/WeekView.container.tsx` | ✅ Production |
| Weekly View UI | `WeekView` | `src/app/week-view/WeekView.view.tsx` | ✅ Production |
| Weekly UI Library | `WeekViewPageView` | `packages/ui/week/WeekViewPage.view.tsx` | ✅ Production |
| Week Header/Navigation | `WeekHeaderView` | `packages/ui/week/WeekHeader.view.tsx` | ✅ Production |
| Mission/Assignment List | `WeeklyMissionListView` | `packages/ui/week/WeeklyMissionList.view.tsx` | ✅ Production |
| Task Item Display | `WeeklyMissionItemView` | `packages/ui/week/WeeklyMissionItem.view.tsx` | ✅ Production |
| Task Group List | `TaskGroupList` | `src/app/week-view/task-group-list.tsx` | ✅ Production |

#### **Module System**
| Need | Existing Component | Location | Status |
|------|-------------------|----------|---------|
| Module Cards | `ModuleCard` | `src/components/ModuleCard.tsx` | ✅ Production |
| Module Cards (UI Lib) | `ModuleCardView` | `packages/ui/modules/ModuleCard.view.tsx` | ✅ Production |
| Module Detail Container | `ModuleDetailContainer` | `src/app/modules/[moduleId]/ModuleDetail.container.tsx` | ✅ Production |
| Module Detail View | `ModuleDetailView` | `packages/ui/modules/ModuleDetail.view.tsx` | ✅ Production |
| Module Quick View | `ModuleQuickView` | `packages/ui/modules/ModuleQuickView.view.tsx` | ✅ Production |
| Assignment Table | `AssignmentsTable` | `src/components/AssignmentsTable.tsx` | ✅ Production |

#### **Strategic/KPI System**
| Need | Existing Component | Location | Status |
|------|-------------------|----------|---------|
| Dashboard Page | `DashboardPage` | `src/app/dashboard/page.tsx` | ✅ Production |
| KPI Tiles | `StatTile` (in dashboard) | `src/app/dashboard/page.tsx` | ✅ Production |
| Semester Snapshot | `SemesterSnapshotView` | `packages/ui/semester/SemesterSnapshot.view.tsx` | ✅ Production |
| Urgent Lists | `UrgentList` (in dashboard) | `src/app/dashboard/page.tsx` | ✅ Production |

#### **What-If System**
| Need | Existing Component | Location | Status |
|------|-------------------|----------|---------|
| What-If Modal | `WhatIfDialogView` | `packages/ui/modals/WhatIfDialog.view.tsx` | ✅ Production |
| What-If Hook | `useWhatIf` | `src/hooks/useWhatIf.ts` | ✅ Production |
| What-If API | `/api/what-if` | `src/app/api/what-if/route.ts` | ✅ Production |

#### **Modal & Settings System**
| Need | Existing Component | Location | Status |
|------|-------------------|----------|---------|
| Edit Assignment Modal | `EditAssignmentModalView` | `packages/ui/modals/EditAssignmentModal.view.tsx` | ✅ Production |
| Import Shell | `ImporterShell` | `packages/ui/import/ImporterShell.view.tsx` | ✅ Production |
| Modal History System | `modal-history` | `src/lib/modal-history.ts` | ✅ Production |

#### **State Management**
| Need | Existing Component | Location | Status |
|------|-------------------|----------|---------|
| User Store | `useUserStore` | `src/lib/user-store.ts` | ✅ Production |
| Week Store | `useWeekStore` | `src/lib/week-store.ts` | ✅ Production |
| User Boot | `UserBoot` | `src/app/user-boot.tsx` | ✅ Production |

#### **Styling & Design System**
| Need | Existing Component | Location | Status |
|------|-------------------|----------|---------|
| Design Tokens | `tokens` | `packages/ui/tokens.ts` | ✅ Production |
| Card Components | `.card`, `.card-body` etc | Global CSS | ✅ Production |
| Button Components | `.btn`, `.btn-primary` etc | Global CSS | ✅ Production |

---

## 🚧 **MISSING COMPONENTS** (Need to Create)

### Navigation Shell
- **AcademicOS Header** with tab navigation (Weekly | Strategic | What-If | Settings)
- **Back Button** component for detail views

### Task Management
- **Add Task Modal** (new task creation overlay)
- **Task Creation Form** component

### Settings/Onboarding
- **Settings View Container** (compose existing import + academic year tools)
- **Onboarding Modal** (first-run setup)

### State Orchestration
- **AcademicOSContext** or facade adapter to coordinate:
  - Current view state
  - Selected module ID
  - Current week start
  - Modal state
  - Navigation actions

---

## 🔧 **REQUIRED ADAPTORS** (Prop Shape Mismatches)

### Data Selectors
All pure functions needed to transform API data to component props:

| Selector Function | Input | Output | Location Planned |
|------------------|-------|--------|------------------|
| `deriveWeekRange` | weekStart date | { start, end } | `src/academic-os/selectors/week.ts` |
| `getAssignmentsForWeek` | assignments[], weekStart | filtered assignments | `src/academic-os/selectors/week.ts` |
| `getTasksForWeek` | tasks[], weekStart | filtered tasks | `src/academic-os/selectors/week.ts` |
| `computeWeightedGPA` | modules[] | number | `src/academic-os/selectors/analytics.ts` |
| `detectAtRiskModules` | modules[], threshold | at-risk modules[] | `src/academic-os/selectors/analytics.ts` |
| `getUpcomingDeadlines` | modules[], now | deadline items[] | `src/academic-os/selectors/analytics.ts` |

---

## 🗺️ **EXISTING ROUTING STRUCTURE**

### Pages (Next.js App Router)
- `/` → `src/app/page.tsx` (redirects to `/week-view` if UI flag set)
- `/week-view` → `src/app/week-view/page.tsx` ✅
- `/dashboard` → `src/app/dashboard/page.tsx` ✅
- `/modules/[moduleId]` → `src/app/modules/[moduleId]/page.tsx` ✅
- `/import` → `src/app/import/page.tsx` ✅
- `/login` → `src/app/login/page.tsx` ✅

### API Routes
- `/api/week-view` ✅
- `/api/dashboard` ✅
- `/api/modules/[id]/analytics` ✅
- `/api/what-if` ✅
- `/api/session/user` ✅

---

## 📊 **STATE PATTERNS IDENTIFIED**

### Zustand Stores (Existing)
1. **User Store**: Authentication & user session
2. **Week Store**: Week navigation context preservation

### Navigation Patterns (Existing)
- **Module slide-over**: URL params `?module=ID` with history integration
- **Modal history**: URL params `?modal=type&id=ref` with `pushModal/closeModal`
- **Week context**: Persist `lastViewedWeek` for back navigation

---

## 📅 **WEEKSTART CONVENTION**

**Decision**: Monday week start (already implemented in existing `/api/week-view`)
- `startOfWeek(baseDate, { weekStartsOn: 1 })` (Monday = 1)
- Consistent with existing week-view container

---

## 🧩 **COMPOSITION STRATEGY**

### Reuse Existing Containers
1. **WeekViewContainer** → becomes Weekly view
2. **DashboardPage** → extract components for Strategic view  
3. **ModuleDetailContainer** → Module view
4. **ImporterShell** → Settings view component

### Create Thin Orchestration Layer
1. **AcademicOSShell** - top-level view router
2. **AcademicOSHeader** - navigation tabs
3. **View containers** - thin wrappers that compose existing components

### Preserve Existing Patterns
- Keep Zustand stores as-is
- Maintain existing modal/navigation history patterns
- Reuse existing styling classes and design tokens

---

## 🚨 **RISK ASSESSMENT**

### Low Risk
- ✅ Most components already production-ready
- ✅ State management patterns established
- ✅ Modal system working
- ✅ Styling system complete

### Medium Risk
- ⚠️ Need new navigation shell (but can reuse existing header styles)
- ⚠️ Task creation modal (but can copy pattern from existing modals)

### Mitigations
- Use existing modal patterns for new modals
- Copy navigation styles from existing WeekHeader
- Gradual composition approach (one view at a time)

---

## 📋 **NEXT PHASE CHECKLIST**

### Phase 1: Data Adapters & Selectors ✅ Ready
- [x] Component inventory complete
- [ ] Create selector functions
- [ ] Add unit tests for selectors
- [ ] Validate data flow contracts

### Phase 2: State Orchestration ✅ Ready  
- [x] Existing stores identified
- [ ] Create AcademicOSContext facade
- [ ] Wire up view routing state
- [ ] Add modal coordination

---

## 📖 **COMPONENT IMPORT MAP**

```typescript
// Week System
import { WeekViewContainer } from '@/app/week-view/WeekView.container';
import { WeekHeaderView, WeeklyMissionListView, WeekViewPageView } from '@ui';

// Module System  
import { ModuleDetailContainer } from '@/app/modules/[moduleId]/ModuleDetail.container';
import { ModuleCardView, ModuleDetailView, ModuleQuickView } from '@ui';
import { AssignmentsTable } from '@/components/AssignmentsTable';

// Strategic/Analytics
import { SemesterSnapshotView } from '@ui';
// Extract from: src/app/dashboard/page.tsx (StatTile, UrgentList)

// What-If System
import { WhatIfDialogView } from '@ui';
import { useWhatIf } from '@/hooks/useWhatIf';

// Modals & Import
import { EditAssignmentModalView, ImporterShell } from '@ui';
import { pushModal, closeModal, listenModal } from '@/lib/modal-history';

// State
import { useUserStore } from '@/lib/user-store';
import { useWeekStore } from '@/lib/week-store';
```

---

**Status**: ✅ **RECONNAISSANCE COMPLETE**  
**Next**: Proceed to Phase 1 (Data Adapters & Selectors)
