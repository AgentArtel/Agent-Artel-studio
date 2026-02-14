

# Create Studio Tables in Public Schema + Wire Real Execution Engine

## Problem

All dashboard/workflow/execution queries return 406 errors because the app uses `.schema('studio')` but PostgREST only exposes `public` and `game`. The execution engine currently uses mock timers with random success/failure instead of calling real Gemini edge functions.

## Solution

### Part 1: Fix 406 Errors -- Create Tables in Public Schema

The `studio` schema has the tables but isn't exposed via PostgREST. We'll create equivalent tables in the `public` schema and update frontend code to query from `public` directly (removing all `.schema('studio')` calls).

**Database Migration** -- Create 3 tables in `public`:

```text
studio_workflows
  - id (uuid, PK, default gen_random_uuid())
  - user_id (uuid, NOT NULL)
  - name (text, NOT NULL)
  - description (text, nullable)
  - status (text, default 'draft')
  - node_count (int, default 0)
  - execution_count (int, default 0)
  - last_run_at (timestamptz, nullable)
  - nodes_data (jsonb, default '[]')
  - connections_data (jsonb, default '[]')
  - created_at, updated_at (timestamptz)

studio_executions
  - id (uuid, PK)
  - workflow_id (uuid, FK -> studio_workflows)
  - user_id (uuid, NOT NULL)
  - status (text, default 'pending')
  - started_at (timestamptz)
  - completed_at (timestamptz, nullable)
  - duration_ms (int, nullable)
  - node_results (jsonb, default '{}')
  - error_message (text, nullable)
  - created_at (timestamptz)

studio_activity_log
  - id (uuid, PK)
  - user_id (uuid, NOT NULL)
  - type (text, NOT NULL)
  - message (text, NOT NULL)
  - workflow_name (text, nullable)
  - workflow_id (uuid, nullable)
  - created_at (timestamptz)
```

Tables are prefixed with `studio_` to avoid collision with existing `public` tables. RLS will be disabled for development (matching current approach).

**Frontend Changes** -- Update 3 files:

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Replace `.schema('studio').from('workflows')` with `.from('studio_workflows')`, same for `executions` and `activity_log` |
| `src/pages/WorkflowList.tsx` | Replace `.schema('studio').from('workflows')` with `.from('studio_workflows')` |
| `src/pages/ExecutionHistory.tsx` | Replace `.schema('studio').from('executions')` with `.from('studio_executions')` and `.from('workflows')` with `.from('studio_workflows')` |

### Part 2: Real Execution Engine with Gemini Edge Functions

Replace the mock `setTimeout` + `Math.random()` logic in `useExecution.ts` with actual edge function calls based on node type.

**File: `src/hooks/useExecution.ts`** -- Major rewrite of `executeNextNode`:

Currently the execution does this for every node:
```
setTimeout(() => {
  const hasError = Math.random() < 0.1;  // fake 10% error rate
  setNodeStatus(nodeId, hasError ? 'error' : 'success');
}, 500 + Math.random() * 1000);  // fake delay
```

This will be replaced with a `executeNode` function that dispatches based on `node.type`:

- **`image-gen`**: Calls `generateImage({ prompt, style, agentId })` from `src/lib/generateImage.ts`
- **`gemini-chat`**: Calls `geminiChat({ messages, model, temperature, maxTokens, systemPrompt })` from `src/lib/geminiServices.ts`
- **`gemini-embed`**: Calls `geminiEmbed({ text, model })` from `src/lib/geminiServices.ts`
- **`gemini-vision`**: Calls `geminiVision({ prompt, imageUrl, model })` from `src/lib/geminiServices.ts`
- **`trigger`, `webhook`, `schedule`**: Pass through immediately (success) -- these are entry points
- **Other node types** (`ai-agent`, `openai-chat`, `http-tool`, `code-tool`, etc.): Fall back to a simulated delay (since there's no backend for them yet), but log clearly that they're simulated

Each real node execution:
1. Sets status to `running`
2. Calls the appropriate edge function
3. Stores the result in `nodeResults` (a new ref tracking per-node output data)
4. Sets status to `success` or `error` based on response
5. Passes output data downstream (available to next nodes via `nodeResults`)

The node's `config` object provides the parameters (prompt, model, etc.). The execution engine reads `node.config` to build the edge function request.

**New capability**: Node results will be stored so downstream nodes can reference upstream output. For example, a `gemini-chat` node's text output could feed into an `image-gen` node's prompt via a simple template system.

### Part 3: Seed Data

Insert a few sample rows into the new tables so the dashboard shows content immediately:
- 2 sample workflows
- 3 sample executions
- 5 sample activity log entries

## Files Summary

| File | Action |
|------|--------|
| Migration SQL | Create `studio_workflows`, `studio_executions`, `studio_activity_log` tables |
| `src/pages/Dashboard.tsx` | Modify -- remove `.schema('studio')`, use `studio_*` table names |
| `src/pages/WorkflowList.tsx` | Modify -- same |
| `src/pages/ExecutionHistory.tsx` | Modify -- same |
| `src/hooks/useExecution.ts` | Major rewrite -- replace mock execution with real Gemini edge function calls |

## Technical Details

### Execution Engine Node Dispatch Logic

```text
switch (node.type):
  'image-gen'     -> generateImage(config)
  'gemini-chat'   -> geminiChat(config)
  'gemini-embed'  -> geminiEmbed(config)
  'gemini-vision' -> geminiVision(config)
  'trigger' | 'webhook' | 'schedule' -> immediate pass-through
  default         -> simulated 500-1500ms delay (placeholder)
```

### Error Handling

- Edge function failures set the node to `error` status but do NOT stop the entire workflow
- The error message is logged and stored in `nodeResults[nodeId].error`
- If a critical upstream node fails, downstream nodes dependent on its output are marked `skipped`

