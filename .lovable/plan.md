

# Wire WorkflowList to Supabase

## Overview

Replace the hardcoded `initialWorkflows` array in `src/pages/WorkflowList.tsx` with a live Supabase query, following the same pattern used in the Dashboard.

## Changes

**File: `src/pages/WorkflowList.tsx`**

1. **Add imports**: `useQuery` from `@tanstack/react-query`, `supabase` from integrations, `formatRelativeTime` from lib, `Skeleton` from UI
2. **Remove** the `initialWorkflows` constant (lines 13-20)
3. **Remove** the `workflows` / `setWorkflows` state (line 27) -- data now comes from the query
4. **Add a `useQuery` hook** fetching all workflows:
   - Query key: `['studio-all-workflows']` (reuses the same key as Dashboard for cache sharing)
   - Query: `supabase.schema('studio').from('workflows').select('*').order('updated_at', { ascending: false })`
5. **Map DB rows** to the shape the UI expects:
   - `last_run_at` -> `lastRun` via `formatRelativeTime()`
   - `execution_count` -> `executionCount`
   - `node_count` -> `nodes`
   - `status` cast to `'active' | 'inactive' | 'error'`
6. **Update `handleBulkDelete`**: Instead of filtering local state, perform a Supabase delete then invalidate the query (or for now, just filter the mapped list client-side and show a toast -- real delete is a future task since we don't want to accidentally nuke seed data during development)
7. **Add loading state**: Show skeleton placeholders while the query is loading (grid of 6 skeleton cards)
8. **Filtering and sorting** remain client-side on the mapped data (same as current behavior, just operating on query results instead of local state)

## Technical Details

The query pattern mirrors the Dashboard exactly:

```text
const { data: dbWorkflows = [], isLoading } = useQuery({
  queryKey: ['studio-all-workflows'],
  queryFn: async () => {
    const { data, error } = await (supabase as any)
      .schema('studio')
      .from('workflows')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data as any[];
  },
});
```

Then map to the existing UI shape:

```text
const workflows = dbWorkflows.map(w => ({
  id: w.id,
  name: w.name,
  description: w.description,
  status: w.status,
  lastRun: formatRelativeTime(w.last_run_at),
  executionCount: w.execution_count ?? 0,
  nodes: w.node_count ?? 0,
}));
```

No other files need to change. The `WorkflowCard`, `SearchBar`, `WorkflowFilters`, and `EmptyState` components all remain the same since the mapped data matches their existing prop shapes.
