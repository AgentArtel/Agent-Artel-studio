

# Create a Working Image Generation Workflow

## What We Need

The execution engine and edge functions are already wired up. What's missing is a way to (1) start with a proper image-gen workflow on the canvas, and (2) see the results after execution. Here's the focused plan:

## Changes

### 1. Set Default Workflow to Image Generation

**File: `src/pages/WorkflowEditorPage.tsx`**

Replace the hardcoded `initialNodes` and `initialConnections` with a simple two-node image generation workflow:

- **Trigger Node** at position (150, 200): "Manual Trigger" -- acts as the start point
- **Image Gen Node** at position (500, 200): "Image Generator" -- pre-configured with a sample prompt like "A futuristic robot in a neon-lit city" and style "vivid", marked as `isConfigured: true`
- **One connection** from trigger output to image-gen input

This gives you a runnable workflow out of the box.

### 2. Add an Execution Results Panel

**File: `src/components/ExecutionResultsPanel.tsx`** (Create)

A slide-up panel that appears after execution completes, showing per-node results:

- For `image-gen` nodes: renders the returned base64 image in an `<img>` tag
- For `gemini-chat` / `gemini-vision` nodes: renders the returned text
- For `gemini-embed` nodes: shows embedding dimensions
- Shows execution duration, status, and any error messages
- Has a close/dismiss button

### 3. Wire Results Panel into WorkflowEditorPage

**File: `src/pages/WorkflowEditorPage.tsx`**

- Import and use `nodeResults` from the `useExecution` hook (already returned but not used)
- Show the `ExecutionResultsPanel` when execution completes
- Pass `nodeResults`, `nodes`, and `executionState` to the panel

### 4. Improve Node Title Generation

**File: `src/pages/WorkflowEditorPage.tsx`**

Update `handleAddNode` to generate better default titles and subtitles per node type (e.g., "Image Generator" with subtitle "Gemini Imagen" instead of generic "Image-gen" / "New node").

## How It Will Work

1. Open the workflow editor -- you see a Trigger connected to an Image Generator node
2. Click the Image Generator node to open ConfigPanel -- edit the prompt if desired
3. Click "Test" in the bottom toolbar
4. The trigger passes through instantly, then the image-gen node calls the `generate-image` edge function
5. When complete, the results panel slides up showing the generated image

## Technical Notes

- The `useExecution` hook already returns `nodeResults` -- it just needs to be destructured and passed to the UI
- The `handleNodeUpdate` callback already persists config changes via `pushState`, so editing the prompt in ConfigPanel works
- No database changes needed -- this is purely frontend wiring

## Files Summary

| File | Action |
|------|--------|
| `src/pages/WorkflowEditorPage.tsx` | Modify -- new initial nodes, wire results panel, better node titles |
| `src/components/ExecutionResultsPanel.tsx` | Create -- displays execution output (images, text) |

