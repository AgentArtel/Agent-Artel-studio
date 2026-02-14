# n8n Workflow Import — Revised Plan

All review feedback has been incorporated. This plan addresses every issue raised.

## Files Overview

All paths are in the main app (NOT `reference-app/`):


| File                                | Action     | Purpose                                                                                                        |
| ----------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| `src/lib/n8nImporter.ts`            | **Create** | Pure converter: n8n JSON to Artel format + missing config detection                                            |
| `src/components/ImportN8nModal.tsx` | **Create** | Two-step modal: source selection then missing-config form                                                      |
| `src/types/index.ts`                | **Modify** | Add n8n raw JSON type definitions                                                                              |
| `src/components/Header.tsx`         | **Modify** | Add `onImport` prop and Import button                                                                          |
| `src/pages/WorkflowEditorPage.tsx`  | **Modify** | Wire import flow: add `reset` to destructuring, add `workflowName` state, render modal, handle import complete |


---

Make sure to leave helpful comments and create detailed documentation so in the event of a handoff development can continue if we need to revisit this feature later to make adjustments or fix it. 

## Step 1: Add n8n Types (`src/types/index.ts`)

Append the following interfaces at the end of the file:

- `N8nNode` — `{ id, name, type, typeVersion, position: [number, number], parameters, credentials? }`
- `N8nConnectionTarget` — `{ node: string, type: string, index: number }`
- `N8nWorkflowJSON` — `{ name?, nodes: N8nNode[], connections: Record<string, Record<string, N8nConnectionTarget[][]>>, settings?, meta? }`
- `N8nImportResult` — `{ nodes: NodeData[], connections: Connection[], workflowName: string, missing: { credentialRefs: { nodeId, nodeTitle, credentialType, n8nCredName }[], envVars: string[] } }`

## Step 2: n8n Importer (`src/lib/n8nImporter.ts`)

A pure function `convertN8nWorkflow(json: N8nWorkflowJSON): N8nImportResult` with:

### Validation

- Check `json.nodes` is an array and `json.connections` is an object
- Throw descriptive errors for malformed data

### Node Conversion

- Build a `name -> id` map from n8n nodes (use n8n node `id` as Artel `id` to avoid duplicate-name collisions)
- For each n8n node, map to `NodeData`:
  - `position: [x,y]` becomes `{ x, y }`; nodes without position get `{ x: index * 250, y: 0 }`
  - `title` = n8n `name`
  - `type` = pattern-match via mapping table (see below); unmapped becomes `custom-tool`
  - `config` = n8n `parameters` spread into config; for unmapped nodes also store `_n8nType` and `_n8nTypeVersion`
  - Store `_n8nTypeVersion` for ALL nodes (not just unmapped) to preserve debugging info

### Node Type Mapping Table

Implemented as a `Record<string, NodeType>` with pattern matching (check if n8n type string contains key):

```text
chatTrigger       -> trigger
webhook           -> trigger  (also covers webhookTrigger)
manualTrigger     -> trigger
chainLlm          -> ai-agent
agent             -> ai-agent
lmChatOpenai      -> openai-chat
openAi            -> openai-chat
lmChatAnthropic   -> anthropic-chat
anthropic         -> anthropic-chat
httpRequest       -> http-tool
toolHttpRequest   -> http-tool
code              -> code-tool
codeTool          -> code-tool
memory            -> memory
vectorStore       -> memory
schedule          -> schedule
cron              -> schedule
if                -> if
switch            -> if
merge             -> merge
(everything else) -> custom-tool
```

### Connection Conversion

- For each key in `connections` object:
  1. Try resolving key as node name via `name -> id` map
  2. **Fallback**: if no match, try matching against node IDs directly (handles newer n8n exports that key by ID)
- Iterate ALL output-type keys on each source node (not just one — handles nodes with both `main` and `ai_*` outputs)
- Port mapping: `main` -> `fromPort: 'output', toPort: 'input'`; `ai_languageModel` -> `fromPort: 'tool', toPort: 'input'`; `ai_tool` -> `fromPort: 'tool', toPort: 'input'`; `ai_memory` -> `fromPort: 'memory', toPort: 'input'`; unknown output types -> `fromPort: 'output', toPort: 'input'`
- Generate connection ID as `conn-{sourceId}-{targetId}-{index}`

### Missing Config Detection

- Credential refs: iterate each node's `credentials` object, collect `{ nodeId, nodeTitle, credentialType, n8nCredName }`
- Env vars: recursively walk all `parameters` values (strings, nested objects/arrays), regex `\{\{\s*\$env\.(\w+)\s*\}\}`, collect unique var names

## Step 3: Import Modal (`src/components/ImportN8nModal.tsx`)

Uses existing `Modal` component and design system (dark theme, green accents, glassmorphic cards).

### Phase 1 — Import Source

- **File upload**: Button labeled "Choose File" with hidden `<input type="file" accept=".json">`. Also supports drag-and-drop onto a drop zone area within the modal.
- **URL input**: Text field + "Fetch" button. Includes a help note: "Works with raw JSON URLs (GitHub raw, Gist). If fetch fails, download the file and use file import instead."
- On submit: parse JSON, run `convertN8nWorkflow()`, handle errors inline
- **Error states**: "Invalid JSON format", "No nodes found in this workflow", "Could not fetch from this URL — try downloading the file and importing from file instead" (CORS-aware messaging)

### Phase 2 — Missing Configuration (conditional)

Only shown if `missing.credentialRefs.length > 0` or `missing.envVars.length > 0`.

**Credentials section:**

- Lists each credential ref: node title, credential type, n8n credential name
- Dropdown to select from available credentials (passed as prop from parent — currently the mock `initialCredentials` list from Credentials page; no Supabase query needed now)
- "Create New" option that shows a toast directing user to the Credentials page
- Note: credential storage via Supabase is a separate future task; this feature works with whatever credential list is available

**Env vars section:**

- Each var shown as: name (read-only label) + value (text input)
- User can fill values or leave empty

**Actions:**

- "Import with Configuration" — applies credential selections to node configs, stores env var values in a returned object, then triggers import
- "Import Anyway" — skips all config, loads workflow as-is; user can configure later via ConfigPanel

### Props

- `isOpen: boolean`
- `onClose: () => void`
- `onImportComplete: (result: N8nImportResult, envVars?: Record<string, string>) => void`
- `availableCredentials: { id: string, name: string, service: string }[]`

## Step 4: Header Changes (`src/components/Header.tsx`)

- Add `onImport?: () => void` to `HeaderProps`
- Add an Import button between Share and Save in the right actions area:
  - Uses `Upload` icon from lucide-react
  - `variant="ghost"` styling matching Share button
  - Label: "Import"
  - Hidden on small screens (`hidden sm:flex`) like Share

## Step 5: WorkflowEditorPage Wiring (`src/pages/WorkflowEditorPage.tsx`)

### Add `reset` to useUndoRedo destructuring (line 142-153)

Currently `reset` is not destructured even though the hook exposes it. Add it:

```text
const { nodes, connections, pushState, undo, redo, canUndo, canRedo, reset } = useUndoRedo(...)
```

### Add workflow name state

```text
const [workflowName, setWorkflowName] = useState('AI Agent Workflow');
```

Pass `workflowName` to `Header` instead of the current static default.

### Add import modal state

```text
const [isImportModalOpen, setIsImportModalOpen] = useState(false);
```

### Wire to Header

Pass `onImport={() => setIsImportModalOpen(true)}` to Header.

### Define available credentials

For now, define the same mock credentials list inline (or import from a shared constant). This will be replaced when Credentials page migrates to Supabase.

### Render ImportN8nModal

Pass `onImportComplete` handler that:

1. Calls `reset({ nodes: result.nodes, connections: result.connections })` — clears undo history and loads the imported workflow
2. Sets `workflowName` from `result.workflowName` (if present)
3. Shows success toast: "Workflow imported. X nodes, Y connections."
4. Closes modal

### Env var handling

Store env vars in component state for now (or log them). Exact runtime injection is out of scope — the import captures what's needed and the values are available for future use.

---

## Error Handling Summary


| Scenario                                   | Behavior                                                                                                      |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Invalid JSON file                          | Inline error in modal: "Invalid file format. Please select an n8n workflow JSON file."                        |
| No nodes after conversion                  | Inline error: "No importable nodes found in this workflow."                                                   |
| URL fetch failure (CORS/network)           | Inline error: "Could not fetch from this URL. Try downloading the JSON file and importing from file instead." |
| Duplicate node names                       | No issue — uses n8n `id` (UUID) as Artel `id`                                                                 |
| Missing position on node                   | Defaults to `{ x: index * 250, y: 0 }`                                                                        |
| Multiple output types per node             | Iterates all keys of the inner connections object                                                             |
| Connection key matches neither name nor ID | Skips that connection, logs warning to console                                                                |


## What This Plan Does NOT Include (Out of Scope)

- Supabase-backed credential storage (separate migration task)
- Auto-layout algorithm for imported nodes (uses n8n's positions)
- Runtime env var injection
- n8n `typeVersion`-aware parameter schema handling (version stored for future use)