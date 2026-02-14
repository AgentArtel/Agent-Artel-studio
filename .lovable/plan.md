

# Supabase Schema Migration: Isolated `studio` Schema

## Why a Separate Schema

The existing `public` schema contains Open-RPG game tables (`agent_configs`, `agent_memory`, `api_integrations`, `player_state`). To keep Agent Artel Studio completely isolated, all new tables will live in a dedicated **`studio`** schema. This prevents naming collisions, keeps RLS policies independent, and makes it easy to manage or drop Studio data without touching the game.

## New Schema: `studio`

### Tables to Create

#### 1. `studio.workflows`
Replaces mock data in Dashboard and WorkflowList (10 combined mock rows).

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid PK | gen_random_uuid() | |
| user_id | uuid NOT NULL | auth.uid() | Owner |
| name | text NOT NULL | | |
| description | text | '' | |
| status | text NOT NULL | 'draft' | active, inactive, draft, error |
| node_count | integer | 0 | |
| execution_count | integer | 0 | |
| last_run_at | timestamptz | null | |
| nodes_data | jsonb | '[]' | Canvas NodeData[] |
| connections_data | jsonb | '[]' | Canvas Connection[] |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | |

#### 2. `studio.executions`
Replaces ExecutionHistory mock data (7 rows). Also powers the Dashboard chart via aggregation.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid PK | gen_random_uuid() | |
| workflow_id | uuid FK | | References studio.workflows |
| user_id | uuid NOT NULL | auth.uid() | |
| status | text NOT NULL | 'pending' | pending, running, success, error |
| started_at | timestamptz | now() | |
| completed_at | timestamptz | null | |
| duration_ms | integer | null | |
| node_results | jsonb | '{}' | |
| error_message | text | null | |
| created_at | timestamptz | now() | |

#### 3. `studio.activity_log`
Replaces Dashboard `mockActivities` (5 rows).

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid PK | gen_random_uuid() | |
| user_id | uuid NOT NULL | auth.uid() | |
| type | text NOT NULL | | execution, success, error, created, updated |
| message | text NOT NULL | | |
| workflow_name | text | null | Denormalized for fast reads |
| workflow_id | uuid FK | null | References studio.workflows |
| created_at | timestamptz | now() | |

#### 4. `studio.credentials`
Replaces Credentials mock data (4 rows).

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid PK | gen_random_uuid() | |
| user_id | uuid NOT NULL | auth.uid() | |
| name | text NOT NULL | | |
| service | text NOT NULL | | |
| encrypted_value | text NOT NULL | | Stored masked on client |
| last_used_at | timestamptz | null | |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | |

#### 5. `studio.templates`
Replaces AgentLibrary mock data (6 rows). Global/public -- no user_id.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid PK | gen_random_uuid() | |
| name | text NOT NULL | | |
| description | text | '' | |
| category | text | 'General' | |
| difficulty | text | 'beginner' | beginner, intermediate, advanced |
| node_count | integer | 0 | |
| nodes_data | jsonb | '[]' | |
| connections_data | jsonb | '[]' | |
| created_at | timestamptz | now() | |

#### 6. `studio.profiles`
Replaces Settings inline profile values.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid PK | | Same as auth.users id |
| first_name | text | '' | |
| last_name | text | '' | |
| email | text | '' | |
| avatar_url | text | null | |
| notification_prefs | jsonb | (see below) | |
| ui_prefs | jsonb | (see below) | |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | |

Default for `notification_prefs`: `{"email":true,"push":false,"executions":true,"errors":true}`
Default for `ui_prefs`: `{"darkMode":true,"compactView":false,"autoSave":true}`

## RLS Policies

**User-owned tables** (workflows, executions, activity_log, credentials, profiles):
- SELECT / INSERT / UPDATE / DELETE: `auth.uid() = user_id` (profiles uses `auth.uid() = id`)

**Templates** (global, read-only):
- SELECT: open to all authenticated users
- INSERT / UPDATE / DELETE: none (admin via dashboard only)

## Triggers

1. **`updated_at` auto-update** on `studio.workflows`, `studio.credentials`, `studio.profiles` -- reuses existing `update_timestamp()` function from public schema.
2. **Profile auto-creation** -- a `SECURITY DEFINER` function creates a `studio.profiles` row when a new `auth.users` row is inserted.

## Seed Data

After table creation, we insert the existing mock data as seed rows so the UI is unchanged on first load:
- 6 workflows (from WorkflowList)
- 7 executions (from ExecutionHistory)
- 5 activity log entries (from Dashboard)
- 4 credentials (from Credentials)
- 6 templates (from AgentLibrary)

Since auth is not yet implemented, seed data will use a placeholder `user_id`. Once auth is added, RLS will scope data to the logged-in user.

## Supabase Client Update

The generated types file (`src/integrations/supabase/types.ts`) only covers the `public` schema. After migration, the Supabase client will need to query the `studio` schema explicitly:

```text
supabase.schema('studio').from('workflows').select('*')
```

Alternatively, we can expose `studio` tables through the PostgREST API by granting the necessary permissions, which happens automatically when we enable RLS on the schema.

## Implementation Order

1. **SQL Migration** -- Create the `studio` schema, all 6 tables, RLS policies, and triggers in a single migration
2. **Seed Data** -- Insert mock data rows into all tables using the insert tool
3. **Code Changes** (separate follow-up) -- Replace `const mockXxx` arrays with `useQuery` hooks per page

## Important: Auth Prerequisite

All user-owned tables require `auth.uid()`. Until authentication is implemented, data will only be visible via the Supabase dashboard or with RLS temporarily relaxed. The plan accounts for this by seeding data and noting auth as a required next step.

