
# Wire ExecutionHistory to Supabase + Verify Navigation

## Overview

Replace the hardcoded `mockExecutions` in `src/pages/ExecutionHistory.tsx` with live Supabase queries, then manually verify the Workflows page and navigation work correctly.

## Changes

**File: `src/pages/ExecutionHistory.tsx`**

1. **Add imports**: `useQuery` and `useQueryClient` from `@tanstack/react-query`, `supabase` from integrations, `formatRelativeTime` from lib, `Skeleton` from UI
2. **Remove** the `mockExecutions` constant (lines 9-17)
3. **Add two queries**:
   - Executions: `supabase.schema('studio').from('executions').select('*').order('started_at', { ascending: false })` with key `['studio-executions']`
   - Workflows (for name lookup): `supabase.schema('studio').from('workflows').select('id, name')` with key `['studio-workflow-names']`
4. **Build a workflow name map** from the workflows query: `Record<string, string>` mapping `id -> name`
5. **Map DB rows** to the shape `ExecutionRow` expects:
   - `id` = execution id
   - `workflowName` = lookup from workflow name map using `workflow_id` (fallback: `'Unknown Workflow'`)
   - `status` = execution status (already matches: `success | error | running | pending`)
   - `startedAt` = `formatRelativeTime(e.started_at)`
   - `duration` = `e.duration_ms` (already in ms, matches `ExecutionRow` prop)
6. **Update status counts** to derive from the mapped executions (not mock data)
7. **Update Refresh button** to invalidate the executions query via `queryClient.invalidateQueries({ queryKey: ['studio-executions'] })`
8. **Add loading state**: Show skeleton placeholders while loading
9. **Filtering** remains client-side on the mapped data (search by workflowName, filter by status)

## Technical Details

The executions table has `workflow_id` (FK) but not the workflow name directly. Rather than a complex join through the `studio` schema (which PostgREST may not support well with `accept-profile`), we fetch workflows separately and join client-side. The workflows query is lightweight (just `id, name`) and may already be cached from Dashboard or WorkflowList navigation.

```text
// Executions query
const { data: dbExecutions = [], isLoading } = useQuery({
  queryKey: ['studio-executions'],
  queryFn: async () => {
    const { data, error } = await (supabase as any)
      .schema('studio')
      .from('executions')
      .select('*')
      .order('started_at', { ascending: false });
    if (error) throw error;
    return data as any[];
  },
});

// Workflows for name lookup
const { data: dbWorkflowNames = [] } = useQuery({
  queryKey: ['studio-workflow-names'],
  queryFn: async () => {
    const { data, error } = await (supabase as any)
      .schema('studio')
      .from('workflows')
      .select('id, name');
    if (error) throw error;
    return data as any[];
  },
});

// Build name map and map executions
const nameMap = Object.fromEntries(dbWorkflowNames.map(w => [w.id, w.name]));
const executions = dbExecutions.map(e => ({
  id: e.id,
  workflowName: nameMap[e.workflow_id] ?? 'Unknown Workflow',
  status: e.status as 'success' | 'error' | 'running' | 'pending',
  startedAt: formatRelativeTime(e.started_at),
  duration: e.duration_ms,
}));
```

## Post-Implementation Verification

After the code change, navigate through the app to verify:

1. **Dashboard** -- workflows, activity feed, chart, and stats load from DB
2. **Workflows page** -- cards load from DB, search/filter/sort work
3. **Execution History** -- rows load from DB with correct workflow names, status filters work, Refresh button invalidates cache
4. **Navigation** -- all sidebar links work correctly between pages
