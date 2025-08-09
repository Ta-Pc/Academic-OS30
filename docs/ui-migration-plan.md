### UI Migration Plan

Goals: separate presentational UI, introduce tokens, Storybook, and codemods for safe incremental rollout. Desktop-only scope.

#### Priority components
- WeekView: WeekHeader, TaskGroupList items (WeeklyMissionItem), PerformanceGauge
- ModuleDetail: AssignmentsTable (view-only subset), ModuleQuickView
- Importer: forms and summary cards

#### PR sequence
1. chore(ui): add component-manifest generator + UI tokens + initial views + Storybook
2. feat(ui): extract WeekHeader.view + story + container split for WeekView
3. feat(ui): extract ModuleCard.view + dashboard usage behind flag
4. feat(ui): extract WeeklyMissionItem.view + integrate in WeekView container
5. feat(ui): extract SemesterSnapshot.view + stories
6. chore(ui): codemods replace-imports + replace-tokens (dry-run first)
7. test(ui): visual snapshot baseline for WeekView and ModuleDetail

All PRs < 300 LOC net where possible. Attach screenshots and story links.

#### Feature flag
- NEXT_PUBLIC_FEATURE_UI_LIBRARY (boolean). When true, pages import from `packages/ui`.

#### Rollout checklist per page
- [ ] Container/view split created
- [ ] Old component kept; new view wired via flag
- [ ] Stories added and reviewed
- [ ] Visual snapshot updated
- [ ] Codemod pattern added


