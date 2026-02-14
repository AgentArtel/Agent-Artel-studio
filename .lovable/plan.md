

# Seed Studio Tables and Wire Dashboard to Supabase

## Phase 1: Seed All Studio Tables

Insert mock data into each of the 6 `studio` tables using the Supabase insert tool. Since auth is not implemented and RLS is disabled, we will use a placeholder `user_id` (`00000000-0000-0000-0000-000000000000`) for all user-owned rows.

### Data to Seed

**studio.workflows** (6 rows -- superset from WorkflowList, which covers Dashboard's 4):

| name | description | status | node_count | execution_count | last_run_at |
|------|-------------|--------|------------|-----------------|-------------|
| AI Content Generator | Generates blog posts from keywords using OpenAI | active | 5 | 142 | now() - 2min |
| Customer Support Bot | Auto-replies to common questions with AI | active | 8 | 89 | now() - 15min |
| Email Automation | Sends weekly newsletters to subscribers | inactive | 4 | 56 | null |
| Data Sync | Syncs data between platforms every hour | error | 12 | 234 | now() - 2h |
| Slack Notifications | Sends alerts for important events | active | 3 | 567 | now() - 1h |
| Lead Scoring | Scores leads based on behavior | active | 7 | 123 | now() - 30min |

**studio.executions** (7 rows -- references workflow IDs from above):

Each row links to a workflow via `workflow_id` FK. Status values: success, running, error. Duration in ms.

**studio.activity_log** (5 rows):

Types: success, execution, created, error, updated with corresponding messages and workflow names.

**studio.credentials** (4 rows):

OpenAI Production, Slack Bot Token, GitHub PAT, Stripe Test Key with masked values.

**studio.templates** (6 rows):

AI Content Generator, Customer Support Bot, Lead Scoring Automation, Social Media Scheduler, Data Pipeline, Email Drip Campaign across Marketing/Sales/Support/DevOps categories.

**studio.profiles** (1 row):

John Doe profile with default notification and UI preferences.

## Phase 2: Wire Dashboard to Supabase

Replace all three mock arrays in `Dashboard.tsx` with live Supabase queries.

### Changes to `src/pages/Dashboard.tsx`:

1. **Remove** `mockActivities`, `mockWorkflows`, `chartData`, `chartLabels` constants
2. **Add imports**: `supabase` client, `useQuery` from TanStack
3. **Add 3 queries**:
   - `useQuery` for workflows: `supabase.schema('studio').from('workflows').select('*').order('updated_at', { ascending: false }).limit(4)` -- feeds the WorkflowPreview cards
   - `useQuery` for activity_log: `supabase.schema('studio').from('activity_log').select('*').order('created_at', { ascending: false }).limit(10)` -- feeds ActivityFeed
   - `useQuery` for executions (chart): `supabase.schema('studio').from('executions').select('started_at').order('started_at', { ascending: true })` -- aggregate monthly counts for ExecutionChart
4. **Add stat queries**: Compute dashboard stats (active workflow count, today's executions, success rate, avg duration) from the same query results
5. **Map DB rows** to component prop shapes:
   - Workflows: map `last_run_at` to relative time string (`lastRun`), pass `execution_count` as `executionCount`
   - Activities: map `created_at` to relative time string (`timestamp`), rename `workflow_name` to `workflowName`
   - Chart: group executions by month, produce `data: number[]` and `labels: string[]`
6. **Add loading states**: Show skeleton/loading indicator while queries are in-flight
7. **Add error handling**: Fallback to empty arrays on error

### Helper: Relative Time Formatter

Create a small utility `src/lib/formatRelativeTime.ts` that converts a timestamp to "2m ago", "1h ago", etc. This will be reused across all pages as we migrate them.

## Technical Details

### Supabase Schema Querying

Since the tables are in the `studio` schema (not `public`), every query must use:

```text
supabase.schema('studio').from('table_name')...
```

### Dashboard Stat Computation

Stats will be derived from query results rather than separate queries:
- **Active Workflows**: `workflows.filter(w => w.status === 'active').length`
- **Executions Today**: `executions.filter(e => isToday(e.started_at)).length`
- **Success Rate**: `successCount / totalCount * 100` from executions
- **Avg Duration**: `sum(duration_ms) / count` from completed executions

### Files Created/Modified

| File | Action |
|------|--------|
| `src/lib/formatRelativeTime.ts` | Create -- relative time utility |
| `src/pages/Dashboard.tsx` | Modify -- replace mock data with Supabase queries |

### Seed Data Insertion

All seed data will be inserted via the Supabase insert tool (not migrations). Workflows are inserted first since executions and activity_log reference workflow IDs via foreign keys.

