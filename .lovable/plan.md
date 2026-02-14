
# Phase 1: Navigation Wiring

Wire up all cross-page navigation by passing an `onNavigate` callback from `App.tsx` into every page, then connecting it to all buttons that should trigger page changes.

## Changes

### 1. `src/App.tsx` -- Pass `onNavigate` to all pages

Define `const onNavigate = (page: string) => setCurrentPage(page as Page)` and pass it as a prop to Dashboard, WorkflowList, ExecutionHistory, Credentials, AgentLibrary, and Settings in the `renderPage()` switch statement.

### 2. `src/pages/Dashboard.tsx` -- Accept `onNavigate` prop, wire 4 triggers

- Add `onNavigate` to component props
- "Browse Templates" button: `onClick={() => onNavigate('templates')}`
- "Create Workflow" button: `onClick={() => onNavigate('editor')}`
- "View All" button: `onClick={() => onNavigate('workflows')}`
- WorkflowPreview `onEdit`: `() => onNavigate('editor')`
- WorkflowPreview `onRun`: show toast "Workflow started" (import `toast` from sonner)

### 3. `src/pages/WorkflowList.tsx` -- Accept `onNavigate` prop, wire 3 triggers

- "Create Workflow" button: `onClick={() => onNavigate('editor')}`
- WorkflowCard `onEdit`: `() => onNavigate('editor')`
- EmptyState `onAction`: `() => onNavigate('editor')`

### 4. `src/pages/ExecutionHistory.tsx` -- Wire row view action

- Accept `onNavigate` prop (unused for now, but consistent interface)
- ExecutionRow `onView`: show toast "Execution detail view coming soon"
- Import `toast` from sonner

### 5. `src/pages/AgentLibrary.tsx` -- Wire template actions

- Accept `onNavigate` prop
- TemplateCard `onUse`: `() => onNavigate('editor')`
- TemplateCard `onPreview`: show toast "Template preview coming soon"
- Import `toast` from sonner

### 6. `src/pages/Settings.tsx` -- Wire security section buttons

- Accept `onNavigate` prop
- "Change Password": show toast "Coming soon"
- "Two-Factor Auth": show toast "Coming soon"
- "API Keys": `onClick={() => onNavigate('credentials')}`
- "Delete Account": show toast "Account deletion is not available in demo mode"
- Import `toast` from sonner

## Files Modified (7 total)

| File | Change |
|------|--------|
| `src/App.tsx` | Add `onNavigate` callback, pass to 6 pages |
| `src/pages/Dashboard.tsx` | Add prop, wire 4 buttons + run toast |
| `src/pages/WorkflowList.tsx` | Add prop, wire 3 buttons |
| `src/pages/ExecutionHistory.tsx` | Add prop, wire view toast |
| `src/pages/AgentLibrary.tsx` | Add prop, wire use/preview |
| `src/pages/Settings.tsx` | Add prop, wire 4 security buttons |
| `src/pages/Credentials.tsx` | Add prop (unused now, consistent interface) |
