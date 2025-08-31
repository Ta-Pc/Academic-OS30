# Academic-OS30 Component Architecture Analysis

## Overview
The Academic-OS30 project follows a well-structured component architecture that separates **Connected Components** (data-driven) from **Non-Connected Components** (presentational). This follows the Container/Presentational pattern popularized by React best practices.

## 🏗️ Architecture Patterns

### 1. Container/Presentational Pattern
- **Containers**: Handle data fetching, state management, side effects
- **Views**: Pure presentational components that receive props
- **Clear separation**: Business logic vs. UI rendering

### 2. UI Library Pattern  
- **Centralized UI components** in `packages/ui/`
- **Reusable across contexts**: Storybook, main app, future projects
- **Framework agnostic**: No Next.js dependencies in UI library

---

## 📊 Connected Components (Data-Driven)

### Page-Level Containers

#### `src/app/week-view/page.tsx`
**Type**: Server Component  
**Responsibilities**:
- Server-side data fetching via `fetchWeekView()`
- Database connection handling (offline detection)
- Feature flag routing logic
- Chooses between legacy TaskGroupList or new UI library

```tsx
// Fetches data server-side, handles offline gracefully
const data = await fetchWeekView(userId, searchParams?.date);
// Conditionally renders UI library vs legacy components
{featureUIFlag ? <ClientWeekView /> : <TaskGroupList />}
```

#### `src/app/week-view/WeekView.container.tsx`
**Type**: Client Component  
**Responsibilities**:
- API data fetching (`/api/week-view`)
- Loading/error state management
- Module slide-over state with history integration
- Data transformation and calculated metrics

```tsx
// Manages client-side data and UI state
const [data, setData] = useState<ApiResponse | null>(null);
const [openModuleId, setOpenModuleId] = useState<string | null>(null);

// History integration for slide-over
const openModuleViaHistory = useCallback((moduleId: string) => {
  window.history.pushState({ moduleId }, '', url.toString());
});
```

#### `src/app/modules/[moduleId]/ModuleDetail.container.tsx`
**Type**: Client Component  
**Responsibilities**:
- Module analytics data management
- Assignment table integration
- Back-to-week navigation with state persistence
- Real-time data refresh after assignment updates

```tsx
// Manages module-specific data and interactions
const refresh = useCallback(async () => {
  const res = await fetch(`/api/modules/${moduleId}/analytics`);
});

function goBackToWeek() {
  const url = new URL('/week-view', window.location.origin);
  if (lastViewedWeek) url.searchParams.set('date', lastViewedWeek);
}
```

### Legacy Connected Components

#### `src/components/AssignmentsTable.tsx`
**Type**: Client Component  
**Responsibilities**:
- Assignment CRUD operations
- Inline editing with modal integration
- Real-time score updates
- User store integration

#### `src/components/ModuleCard.tsx`
**Type**: Legacy component (being replaced by UI library)
**Responsibilities**:
- Module summary display
- Navigation to module detail
- Performance metrics calculation

---

## 🎨 Non-Connected Components (Presentational)

### UI Library Components (`packages/ui/`)

#### Week-Related Views
```tsx
// packages/ui/week/WeekHeader.view.tsx
export function WeekHeaderView({ start, end, onPrev, onNext, onToday }: WeekHeaderViewProps)
// Pure presentation: displays date range with navigation callbacks

// packages/ui/week/WeeklyMissionList.view.tsx  
export function WeeklyMissionListView({ items, emptyLabel }: WeeklyMissionListViewProps)
// Pure presentation: renders list of mission items

// packages/ui/week/WeeklyMissionItem.view.tsx
export function WeeklyMissionItemView({ id, title, moduleCode, dueDate }: WeeklyMissionItemViewProps)
// Pure presentation: individual mission item display
```

#### Module-Related Views
```tsx
// packages/ui/modules/ModuleQuickView.view.tsx
export function ModuleQuickView({ title, code, stats }: ModuleQuickViewProps)
// Pure presentation: module summary for slide-over

// packages/ui/modules/ModuleDetail.view.tsx  
export function ModuleDetailView({ header, stats, assignmentsSection, onBackToWeek }: ModuleDetailViewProps)
// Pure presentation: full module analytics display with embedded assignment section

// packages/ui/modules/ModuleCard.view.tsx
export function ModuleCardView({ code, title, creditHours, priorityScore }: ModuleCardViewProps)
// Pure presentation: module card display
```

#### Semester Overview
```tsx
// packages/ui/semester/SemesterSnapshot.view.tsx
export function SemesterSnapshotView({ overallWeightedAverage, tasks }: SemesterSnapshotViewProps) 
// Pure presentation: semester-level metrics display
```

### Composite Page Views
```tsx
// packages/ui/week/WeekViewPage.view.tsx
export function WeekViewPageView(props: WeekViewPageProps)
// Composition: Combines WeekHeader + WeeklyMissionList + SemesterSnapshot + ModuleQuickView slide-over
// Framework-agnostic for Storybook usage
```

---

## 🔌 State Management & Data Flow

### State Stores (Zustand)

#### User Store (`src/lib/user-store.ts`)
```tsx
type UserStore = {
  currentUser: CurrentUser;
  setCurrentUser: (user: CurrentUser) => void;
  hydrate: () => Promise<void>; // Fetches from /api/session/user
};
```

#### Week Store (`src/lib/week-store.ts`)  
```tsx
type WeekNavState = {
  lastViewedWeek: string | null;
  setLastViewedWeek: (date: string | null) => void;
};
// Used for back-navigation: ModuleDetail → WeekView with preserved date
```

### API Integration

#### Data Fetching Endpoints
- **`/api/week-view`**: Weekly priorities, module summaries, task stats
- **`/api/modules/[id]/analytics`**: Module-specific performance data
- **`/api/session/user`**: User authentication state
- **`/api/assignments/[id]`**: Assignment CRUD operations
- **`/api/what-if`**: Grade simulation scenarios

#### Data Flow Pattern
```
1. Container fetches from API
2. Container transforms/calculates derived data  
3. Container passes props to presentational view
4. View renders UI and calls back to container for interactions
5. Container handles side effects (navigation, API calls, state updates)
```

---

## 🧩 Component Relationships

### Main Flow: WeekView
```
WeekViewPage (Server Component)
  ↓ (if feature flag enabled)
WeekViewContainer (Client Component) 
  ↓ (API data + state management)
WeekView (Presentational View)
  ↓ (composed of)
├── WeekHeaderView
├── WeeklyMissionListView  
│   └── WeeklyMissionItemView (repeated)
├── SemesterSnapshotView
└── ModuleQuickView (slide-over)
```

### Detail Flow: ModuleDetail  
```
ModuleDetailPage (Server Component)
  ↓ (pre-fetches analytics data)
ModuleDetailContainer (Client Component)
  ↓ (data + refresh logic)
ModuleDetailView (Presentational View)
  ↓ (embeds)
└── AssignmentsTable (Connected Component - legacy)
```

### Navigation Flow
```
WeekView 
  → (click module card) 
  → openModuleViaHistory() 
  → ModuleQuickView slide-over
  → (click "View Details")  
  → navigate to /modules/[id]
  → ModuleDetailView
  → (back button)
  → goBackToWeek() with preserved date
```

---

## 🎯 Key Design Decisions

### 1. **Hybrid Architecture**
- **Server Components** for initial data fetching (SEO, performance)
- **Client Components** for interactivity (slide-overs, state management)
- **UI Library** for reusable presentational logic

### 2. **Progressive Enhancement**
- **Feature flag** (`NEXT_PUBLIC_FEATURE_UI_LIBRARY`) enables new UI library
- **Graceful fallback** to legacy components when flag disabled
- **Offline detection** with meaningful placeholder content

### 3. **History Integration**
- **Slide-over state** persisted in URL query params (`?module=ID`)
- **Browser back button** closes slide-over naturally
- **Week context** preserved across navigation (ModuleDetail → WeekView)

### 4. **Data Transformation at Container Level**
- **Raw API data** transformed into view-friendly props
- **Calculated metrics** (overallWeightedAverage, taskStats) computed in containers
- **View components** receive ready-to-render data

### 5. **Testability & Storybook**
- **UI library components** framework-agnostic for easy testing
- **Containers** handle all side effects, making views pure
- **Storybook integration** for component development and documentation

---

## 📈 Evolution Path

### Current State
- ✅ UI library established with core components
- ✅ Container/View pattern implemented for main flows  
- ✅ Feature flag system for progressive rollout

### Future Enhancements
- **Replace legacy components** (AssignmentsTable, ModuleCard) with UI library versions
- **Extract more containers** for assignment management, user profile
- **Add more sophisticated state management** for complex scenarios
- **Implement optimistic updates** for better UX during API calls

This architecture provides a solid foundation for scaling the application while maintaining clear separation of concerns and testability.

---

## 🔍 **COMPREHENSIVE COMPONENT INVENTORY**

### **📦 UI Library Components (`packages/ui/`)**

#### **Core Week Views**
```tsx
// packages/ui/week/WeekHeader.view.tsx
export function WeekHeaderView({ start, end, onPrev, onNext, onToday }: WeekHeaderViewProps)
// Pure presentational: Date range display with navigation callbacks
// Props: start/end dates, navigation handlers
// Features: Week range formatting, responsive layout

// packages/ui/week/WeeklyMissionList.view.tsx
export function WeeklyMissionListView({ items, emptyLabel }: WeeklyMissionListViewProps)
// Pure presentational: Mission/priority items list
// Props: mission items array, empty state label
// Features: Empty state handling, responsive grid

// packages/ui/week/WeeklyMissionItem.view.tsx
export function WeeklyMissionItemView({ id, title, moduleCode, dueDate }: WeeklyMissionItemViewProps)
// Pure presentational: Individual mission/priority item
// Props: item data (id, title, module, due date)
// Features: Due date formatting, module code badges

// packages/ui/week/WeekViewPage.view.tsx
export function WeekViewPageView(props: WeekViewPageProps)
// Composite presentational: Full week view for Storybook
// Props: Complete week data, module summaries, task stats
// Features: Framework-agnostic composition, slide-over management
```

#### **Module-Related Views**
```tsx
// packages/ui/modules/ModuleQuickView.view.tsx
export function ModuleQuickView({ title, code, stats }: ModuleQuickViewProps)
// Pure presentational: Module summary for slide-over
// Props: module info, optional statistics
// Features: Compact display, stats formatting

// packages/ui/modules/ModuleDetail.view.tsx
export function ModuleDetailView({ header, stats, assignmentsSection, onBackToWeek, hasLastViewedWeek }: ModuleDetailViewProps)
// Pure presentational: Full module analytics view
// Props: module header, prediction stats, embedded assignment section
// Features: Sparkline charts, prediction insights, back navigation

// packages/ui/modules/ModuleCard.view.tsx
export function ModuleCardView({ code, title, creditHours, priorityScore }: ModuleCardViewProps)
// Pure presentational: Module card for grid display
// Props: module basic info, priority score
// Features: Priority score badges, hover states
```

#### **Advanced Modal Components**
```tsx
// packages/ui/modals/WhatIfDialog.view.tsx
export function WhatIfDialogView(props: WhatIfDialogViewProps)
// Complex modal: Grade simulation interface
// Props: assignments, working changes, predictions, callbacks
// Features: 
//   - Accessible modal with focus management
//   - Real-time score editing with optimistic updates
//   - Session-only vs commit modes
//   - Escape key handling, focus restoration
//   - Loading/error states
//   - Required average calculations

// packages/ui/modals/EditAssignmentModal.view.tsx
export function EditAssignmentModalView({ open, title, initialValue, onChange, onSave, onCancel, saving, error }: EditAssignmentModalViewProps)
// Simple modal: Assignment score editing
// Props: modal state, form data, callbacks
// Features:
//   - Accessible modal with focus trap
//   - Form validation and error display
//   - Save/cancel with loading states
//   - Keyboard navigation (Escape to close)
```

#### **Academic Progress Components**
```tsx
// packages/ui/left/ProgressionDetail.view.tsx
export function ProgressionDetailView({ isOpen, onClose, warnings, progressData, remediationActions, onAddToWeek }: ProgressionDetailProps)
// Complex modal: Academic progression analysis
// Props: progression warnings, credit data, remediation actions
// Features:
//   - Multi-action selection with checkboxes
//   - Priority-based remediation suggestions
//   - Add-to-week functionality for tactical planning
//   - Progress percentage calculations
//   - Warning categorization and display

// packages/ui/left/ElectiveTracker.view.tsx  
export function ElectiveTrackerView({ electiveGroups, onViewModules }: ElectiveTrackerProps)
// Progress display: DSM elective group tracking
// Props: elective groups with credit requirements/completion
// Features:
//   - Visual progress bars with percentage completion
//   - Color-coded status (complete/on-track/behind)
//   - Clickable progress bars for module drill-down
//   - Empty state handling

// packages/ui/left/ProgressionWarningBadge.view.tsx
export function ProgressionWarningBadgeView({ warnings, onClick }: ProgressionWarningBadgeProps)
// Status indicator: Academic risk warnings
// Props: warning messages, click handler
// Features:
//   - Color-coded severity levels
//   - Warning count badges
//   - Hover states and click interactions
```

#### **Import/Data Management**
```tsx
// packages/ui/import/ImporterShell.view.tsx
export function ImporterShell(props: ImporterShellProps)
// Complex workflow: CSV import wizard
// Props: step state, mapping data, validation results, term handling
// Features:
//   - 5-step wizard workflow (Upload → Map → Terms → Preview → Summary)
//   - Dynamic column mapping with dropdowns
//   - Term assignment for modules missing dates
//   - Validation with error/success reporting
//   - Missing module detection and creation flow
//   - Preview tables with success/error breakdown
```

#### **Semester Overview**
```tsx
// packages/ui/semester/SemesterSnapshot.view.tsx
export function SemesterSnapshotView({ overallWeightedAverage, tasks }: SemesterSnapshotViewProps)
// Dashboard widget: High-level semester metrics
// Props: weighted average, task completion stats
// Features:
//   - Overall performance metrics
//   - Task completion ratios
//   - Visual progress indicators
```

---

### **🔗 Connected Components (Data-Driven)**

#### **Primary Containers**

##### **Week View System**
```tsx
// src/app/week-view/page.tsx
export default async function WeekViewPage({ searchParams }: { searchParams?: { date?: string; ui?: string } })
// Server Component: Week view page controller
// Responsibilities:
//   - Server-side data fetching via fetchWeekView() with offline detection
//   - Feature flag evaluation (NEXT_PUBLIC_FEATURE_UI_LIBRARY)
//   - Database connection error handling with meaningful fallbacks
//   - Legacy component vs UI library routing decision
//   - User ID resolution and authentication stub integration

// src/app/week-view/WeekView.container.tsx
export function WeekViewContainer({ userId, date }: { userId?: string; date?: string })
// Client Component: Interactive week view controller
// Responsibilities:
//   - Real-time API data fetching from /api/week-view
//   - Loading/error state management with retry logic
//   - Module slide-over state with history integration (pushState/popstate)
//   - Data transformation: API response → view props
//   - Calculated metrics: overallWeightedAverage, taskStats
//   - Week persistence for cross-navigation (rememberWeek)
//   - URL query parameter management (?module=ID)

// src/app/week-view/WeekView.view.tsx
export function WeekView(props: WeekViewProps)
// Connected View: Bridge between container and UI library
// Responsibilities:
//   - Props transformation: container data → UI library format
//   - Slide-over rendering with ModuleQuickView
//   - Event delegation: UI callbacks → container actions
//   - Layout composition: header + missions + modules + sidebar
```

##### **Module Detail System**
```tsx
// src/app/modules/[moduleId]/page.tsx
export default async function ModuleDetailPage({ params }: { params: { moduleId: string } })
// Server Component: Module detail page controller
// Responsibilities:
//   - Initial analytics data fetching (SSR performance)
//   - Error boundary with meaningful fallbacks
//   - Module existence validation
//   - Analytics data pre-loading for container

// src/app/modules/[moduleId]/ModuleDetail.container.tsx
export function ModuleDetailContainer({ moduleId, initial }: { moduleId: string; initial: AnalyticsData })
// Client Component: Module analytics controller
// Responsibilities:
//   - Analytics data management with refresh capability
//   - Assignment table integration (real-time updates)
//   - Week navigation state integration (useWeekStore)
//   - Back-to-week routing with preserved date context
//   - Data transformation: analytics API → view props
//   - Real-time refresh after assignment score changes

// src/app/modules/[moduleId]/ui-client-analytics.tsx
export function UIClientAnalytics({ moduleId }: { moduleId: string })
// Client wrapper: Feature flag routing for module analytics
// Responsibilities:
//   - Feature flag evaluation for UI library vs legacy
//   - Client-side analytics fetching
//   - Loading state during transition
```

##### **Import/Data Management**
```tsx
// src/app/import/page.tsx
export default function ImportPage()
// Server Component: Import page controller
// Responsibilities:
//   - Import wizard initialization
//   - User authentication check
//   - Component hydration setup

// src/app/import/Importer.container.tsx
export function ImporterContainer()
// Client Component: CSV import workflow controller
// Responsibilities:
//   - 5-step wizard state management
//   - File upload and parsing via /api/import/parse
//   - Column mapping state and validation
//   - Term assignment for date-less modules
//   - Preview generation and validation
//   - Import execution with progress tracking
//   - Missing module detection and creation flow
//   - User store integration for permissions
```

#### **Legacy Connected Components**

##### **Assignment Management**
```tsx
// src/components/AssignmentsTable.tsx
export function AssignmentsTable({ assignments, onAfterUpdate }: AssignmentsTableProps)
// Complex table: Assignment CRUD with inline editing
// Responsibilities:
//   - Assignment list rendering with editable scores
//   - Modal history integration (pushModal/closeModal)
//   - Real-time score updates via /api/assignments/[id]
//   - Optimistic UI updates with error rollback
//   - User store integration for authentication
//   - Post-update callbacks for data refresh

// src/components/AssignmentRow.tsx (internal to AssignmentsTable)
function AssignmentRow({ a, onAfterSave }: AssignmentRowProps)
// Table row: Individual assignment with edit modal
// Responsibilities:
//   - Score editing with EditAssignmentModalView
//   - API integration for score updates
//   - Loading states and error handling
//   - Modal state management
```

##### **Legacy Dashboard Components**
```tsx
// src/components/ModuleCard.tsx
export default function ModuleCard({ module, onNavigate }: ModuleCardProps)
// Legacy card: Module display (being replaced by UI library)
// Responsibilities:
//   - Module summary with average calculations
//   - Contribution percentage visualization
//   - Navigation to module detail page
//   - Performance bar charts

// src/components/PerformanceGauge.tsx
export default function PerformanceGauge({ minutes }: PerformanceGaugeProps)
// Metrics widget: Study time visualization
// Responsibilities:
//   - Time conversion (minutes → hours)
//   - Progress bar visualization (target: 2hrs/day)
//   - Visual progress indication

// src/components/WeeklyTimelineItem.tsx
export default function WeeklyTimelineItem({ assignment }: WeeklyTimelineItemProps)
// Timeline card: Assignment due date display
// Responsibilities:
//   - Compact assignment information
//   - Due date formatting and urgency indicators
//   - Status-based styling

// src/components/AddModuleForm.tsx
export default function AddModuleForm({ onSuccess }: AddModuleFormProps)
// Form component: Module creation
// Responsibilities:
//   - Module creation form with validation
//   - API integration with /api/modules
//   - Form state management and error handling
//   - Success callbacks for list refresh
```

#### **Advanced Workflow Components**

##### **What-If Analysis System**
```tsx
// src/hooks/useWhatIf.ts
export function useWhatIf(moduleId: string | null | undefined)
// Hook: Grade simulation state management
// Responsibilities:
//   - What-if simulation API integration (/api/what-if)
//   - Working changes tracking vs baseline scores
//   - Session-only vs commit mode handling
//   - Prediction calculation coordination
//   - Loading states for simulate/commit operations
//   - Reset functionality to baseline state

// Connected via ModuleDetailView with WhatIfDialogView
// Integration pattern: Hook provides state, modal provides UI
```

##### **Task Management (Legacy)**
```tsx
// src/app/week-view/task-group-list.tsx
export function TaskGroupList({ tasks }: TaskGroupListProps)
// Legacy component: Task display when UI library disabled
// Responsibilities:
//   - Task grouping by status (PENDING/IN_PROGRESS/COMPLETED)
//   - Fallback UI for feature flag disabled state
//   - Basic task list rendering without advanced features
```

---

### **🔌 State Management Deep Dive**

#### **Zustand Stores**

##### **User Authentication Store**
```tsx
// src/lib/user-store.ts
export const useUserStore = create<UserStore>((set) => ({
  currentUser: CurrentUser | null,
  setCurrentUser: (user) => set({ currentUser: user }),
  hydrate: async () => {
    // Fetches from /api/session/user and updates store
    // Used by src/app/user-boot.tsx for app-wide hydration
  }
}))
// Integration: Used by AssignmentsTable, ImporterContainer, layout
// Pattern: Hydrate on app load, access throughout component tree
```

##### **Week Navigation Store**
```tsx
// src/lib/week-store.ts
export const useWeekStore = create<WeekNavState>((set) => ({
  lastViewedWeek: string | null,
  setLastViewedWeek: (date) => set({ lastViewedWeek: date }),
}))
// Integration: WeekViewContainer → ModuleDetailContainer
// Pattern: Remember week context for cross-page navigation
// Usage: ModuleDetail "Back to Week" with preserved date
```

#### **Custom Hooks**

##### **Week View Data Hook**
```tsx
// src/hooks/useWeekView.ts
export function useWeekView(userId: string | undefined, date?: string)
// Legacy hook: Week data fetching (replaced by container pattern)
// Responsibilities:
//   - API integration with /api/week-view
//   - Loading/error state management
//   - Data transformation for legacy components
```

##### **What-If Simulation Hook**
```tsx
// src/hooks/useWhatIf.ts
export function useWhatIf(moduleId: string | null | undefined)
// Advanced hook: Grade simulation workflow
// State management:
//   - assignments: Current assignment list with scores
//   - prediction: Calculated grade predictions
//   - working: Local changes not yet simulated/committed
//   - baselineRef: Original scores for reset functionality
// Operations:
//   - simulate(): Send working changes to API for prediction
//   - commit(): Persist working changes to database
//   - reset(): Revert working changes to baseline
//   - updateLocal(): Update working state optimistically
```

---

### **🛠 Utility Libraries & Helpers**

#### **Academic Calculations**

##### **Priority Scoring Engine**
```tsx
// src/utils/priorityScore.ts
export function getPriorityScore(input: PriorityScoreInput): PriorityScoreResult
// Complex algorithm: Assignment/task priority calculation
// Inputs: weight, credits, due date, target marks, prerequisites
// Components:
//   - impact: (weightPercent/100) * (moduleCredits/20)
//   - proximity: logistic time-to-due transformation  
//   - deficit: gap between target and current predicted marks
//   - progression: prerequisite criticality + failure history
//   - creditMultiplier: larger modules get higher priority
//   - electiveBonus: DSM elective credit deficit consideration
// Formula: weighted blend → creditMultiplier → final 0-100 score
// Bands: HIGH >70, MEDIUM 40-70, LOW <40
// Usage: /api/week-view for priority ranking
```

##### **Grade Prediction Engine**
```tsx
// src/utils/prediction.ts
export function computeModulePrediction(assignments: PredictionAssignmentLike[], opts?: { targetMark?: number }): ModulePredictionResult
// Academic calculation: Module grade prediction
// Inputs: assignments with weights/scores, optional target mark
// Calculations:
//   - Weight normalization (handles non-100% totals)
//   - currentObtained: weighted average of graded assignments
//   - remainingWeight: percentage of module still unassessed
//   - predictedSemesterMark: current + remaining * average
//   - requiredAverageOnRemaining: score needed on remaining to hit target
// Usage: ModuleDetail analytics, What-If predictions
```

#### **Navigation & History Management**

##### **Modal History Utilities**
```tsx
// src/lib/modal-history.ts
export function pushModal(modal: string, id?: string)
export function closeModal()
export function listenModal(cb: (state: ModalState | null) => void)
// Browser history integration for modal state
// Pattern: URL params + history state for proper back-button behavior
// Usage: AssignmentsTable for edit modals
// Features: Escape key handling, focus restoration
```

#### **API Helpers**

##### **Database & API Utilities**
```tsx
// src/lib/prisma.ts
export const prisma = new PrismaClient()
// Database client: Singleton Prisma instance
// Usage: All API routes and server components

// src/lib/api-helpers.ts
// Common API utilities for response formatting and error handling

// src/lib/base-url.ts
export function getBaseUrl(): string
// Environment-aware URL construction for SSR API calls

// src/lib/ensure-env.ts
// Environment variable validation and type safety
```

---

### **🗄 Database & API Architecture**

#### **API Route Structure**

##### **Core Data Endpoints**
```tsx
// src/app/api/week-view/route.ts
export async function GET(req: NextRequest)
// Complex endpoint: Weekly mission briefing data
// Data aggregation:
//   - assignments: due in week range with module info
//   - tacticalTasks: due in week range
//   - modules: active during week (date intersection)
//   - studyLogs: total minutes for performance gauge
//   - weeklyPriorities: top 15 items by priority score
//   - moduleSummaries: credit hours, next due dates, priority scores
// Authentication: Uses seed-user-1 fallback for development
// Performance: Single query with joins and transforms

// src/app/api/modules/[moduleId]/analytics/route.ts
export async function GET(req: NextRequest, { params }: { params: { moduleId: string } })
// Analytics endpoint: Module performance data
// Calculations:
//   - currentObtainedMark: weighted average of graded assignments
//   - remainingWeight: ungraded assignment weight percentage
//   - currentPredictedSemesterMark: projection based on current performance
//   - assignmentContributions: individual assignment impact on final grade
// Integration: Used by ModuleDetailContainer for real-time analytics

// src/app/api/dashboard/route.ts
export async function GET(req: NextRequest)
// Dashboard data: High-level overview
// Aggregations:
//   - module summaries with current grades
//   - late assignments (overdue items)
//   - upcoming assignments (next 3 days)
//   - task completion statistics
// Performance: Parallel queries with Promise.all
```

##### **Academic Management Endpoints**
```tsx
// src/app/api/what-if/route.ts
export async function POST(req: NextRequest)
// Grade simulation: Session-only and persistent what-if analysis
// Modes:
//   - sessionOnly: true → temporary simulation for preview
//   - sessionOnly: false → commit changes to database
// Processing:
//   - Apply score changes to assignment copies
//   - Recalculate module predictions with new scores
//   - Return updated predictions without affecting real data (session mode)
// Usage: What-if modal for grade planning

// src/app/api/user/progression/route.ts
export async function GET()
// Academic progression: Year progress and elective tracking
// Calculations:
//   - currentYear: derived from highest module year codes
//   - creditsPassedThisYear: completed modules for current year
//   - electiveGroups: DSM elective progress tracking
//   - warnings: academic risk assessment
// Usage: ProgressionDetailView for academic planning

// src/app/api/assignments/[assignmentId]/route.ts
export async function PATCH(req: NextRequest, { params }: { params: { assignmentId: string } })
// Assignment updates: Score editing with validation
// Processing:
//   - Score validation (0-100 range, number format)
//   - Database update with optimistic locking
//   - Return updated assignment data
// Usage: AssignmentsTable inline editing
```

##### **Import/Data Management Endpoints**
```tsx
// src/app/api/import/parse/route.ts
export async function POST(req: NextRequest)
// CSV parsing: Extract headers and validate format
// Processing:
//   - Parse CSV text into structured data
//   - Extract column headers for mapping
//   - Basic format validation
// Usage: ImporterContainer step 1 (file upload)

// src/app/api/import/preview/route.ts
export async function POST(req: NextRequest)
// Import preview: Validate mapped data before import
// Processing:
//   - Apply column mappings to parsed data
//   - Validate against schema requirements
//   - Check for missing modules/dependencies
//   - Generate success/error preview
// Usage: ImporterContainer step 4 (preview validation)

// src/app/api/import/ingest/route.ts
export async function POST(req: NextRequest)
// Data import: Execute validated import with transactions
// Processing:
//   - Create missing modules if requested
//   - Insert assignments/data with validation
//   - Track success/failure counts
//   - Return detailed results
// Usage: ImporterContainer step 5 (final import)
```

#### **Database Seeding System**

##### **Curriculum Seeding**
```tsx
// prisma/seed-bit-dsm.ts
// BIT (Data Science) curriculum seeding
// Features:
//   - 26 modules across 3 years (core + electives)
//   - Prerequisite relationships
//   - Term/semester scheduling
//   - Elective group assignments (DSM)
//   - Idempotent operations (safe to re-run)
//   - Academic year date calculations
//   - Special handling (JCP202 kickoff week)
// Usage: npm run seed:bit for test data
```

---

### **🧪 Testing Architecture**

#### **E2E Test Structure**

##### **User Flow Tests**
```tsx
// tests/e2e/week-first.spec.ts
// Complete user journey testing
// Scenarios:
//   - Onboarding: root → week-view with seeded data
//   - Navigation: mission item → module detail → back with history
//   - What-if simulation: score changes → prediction updates
//   - Task completion: mark done → UI updates
//   - Data stability: deterministic test data usage
// Environment: Feature flag enabled, seeded database

// tests/e2e/module-detail.spec.ts
// Module analytics and assignment management
// Scenarios:
//   - Module detail page loading with analytics
//   - Assignment score editing with real-time updates
//   - Back-to-week navigation with context preservation
//   - What-if dialog integration
```

##### **Visual Regression Tests**
```tsx
// tests/visual/weekview.spec.ts
// Screenshot-based regression testing
// Coverage:
//   - Week view layout with various data states
//   - Module cards and priority lists
//   - Responsive breakpoints
//   - Dark/light mode variations (if implemented)

// tests/visual/module-detail.spec.ts
// Module detail visual regression
// Coverage:
//   - Analytics dashboard layout
//   - Assignment table rendering
//   - Chart and graph appearances
```

#### **Unit Test Coverage**

##### **Business Logic Tests**
```tsx
// tests/unit/priorityScore.test.ts
// Priority calculation algorithm testing
// Coverage:
//   - Edge cases (missing data, extreme values)
//   - Component weight validation
//   - Band threshold accuracy
//   - Mathematical correctness

// tests/unit/prediction.test.ts
// Grade prediction accuracy testing
// Coverage:
//   - Weight normalization scenarios
//   - Target mark calculations
//   - Remaining average requirements
//   - Edge cases (no assignments, 100% complete)
```

##### **API Integration Tests**
```tsx
// tests/integration/api.week-view.int.test.ts
// Week view API comprehensive testing
// Coverage:
//   - Data aggregation accuracy
//   - Date range calculations
//   - Priority score integration
//   - Offline/error scenarios

// tests/integration/what-if.int.test.ts
// What-if simulation testing
// Coverage:
//   - Session-only vs commit modes
//   - Score change calculations
//   - Prediction accuracy
//   - Data isolation
```

---

### **📱 Responsive & Accessibility Features**

#### **UI Library Accessibility**

##### **Modal Components**
- **Focus Management**: Automatic focus trap and restoration
- **Keyboard Navigation**: Escape key handling, tab order
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Contrast**: WCAG AA compliant color schemes

##### **Interactive Elements**
- **Button States**: Hover, focus, disabled, loading states
- **Form Validation**: Clear error messaging and field association
- **Progress Indicators**: Accessible progress bars and status updates

#### **Responsive Design**

##### **Layout Patterns**
- **Grid Systems**: CSS Grid for module cards, assignment tables
- **Flexbox Layouts**: Navigation, modal dialogs, form elements
- **Container Queries**: Component-level responsive behavior

---

This comprehensive architecture analysis demonstrates a sophisticated, well-structured React application that successfully balances modern development practices with practical academic domain requirements. The separation of concerns, progressive enhancement strategy, and comprehensive testing approach provide a robust foundation for continued development and maintenance.
