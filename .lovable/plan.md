

# Fix Plan: Make It Actually Look Like an N8N Clone

## What's Wrong

The migration copied all the files correctly, but the rendering is generic and flat because of 4 specific wiring/styling issues:

1. **All nodes look the same** -- WorkflowEditorPage renders every node as a generic CanvasNode. The OpenAI Chat node should use the green gradient card, but the specialized node components in `src/components/nodes/` are never referenced.

2. **No borders visible on nodes** -- CanvasNode applies border-color classes (`border-green`, `border-white/10`) without ever adding `border` (the width class). Result: no visible borders or glow effects.

3. **Node appear animation broken** -- Inline style says `animation: 'node-appear ...'` but the CSS keyframe is `nodeAppear`. The animation never fires, so nodes just pop in with no entrance effect.

4. **Connection lines look dead** -- All connections render as flat gray `#3A3A3A` lines. No glow, no gradient. The selected state works but there's no visual indication that connections are clickable.

## Fixes

### Fix 1: Add `border` width class to CanvasNode
**File:** `src/components/canvas/CanvasNode.tsx`
- Add `border` to the className string so border-color classes actually render
- Change: `'absolute w-[200px] rounded-xl bg-dark-100/95...'` becomes `'absolute w-[200px] rounded-xl border bg-dark-100/95...'`

### Fix 2: Fix node-appear animation name
**File:** `src/components/canvas/CanvasNode.tsx`
- Change inline style from `animation: 'node-appear 0.4s...'` to `animation: 'nodeAppear 0.4s...'`
- OR use the Tailwind class `animate-node-appear` instead of inline style

### Fix 3: Apply green gradient to OpenAI/Anthropic nodes
**File:** `src/components/canvas/CanvasNode.tsx`
- Add conditional styling: when `data.type === 'openai-chat'` or `data.type === 'anthropic-chat'`, apply the green gradient background and white text instead of the default dark card
- Use the existing CSS utility classes: `bg-gradient-green` for the background, `border-[rgba(121,241,129,0.4)]` for the border
- Add the glass overlay via a pseudo-element or inner div
- This keeps everything in one component (no need to swap in `OpenAIChatNode` which is a config-panel component, not a canvas node)

### Fix 4: Give connection lines more life
**File:** `src/components/canvas/ConnectionLine.tsx`
- Default state: change stroke from flat `#3A3A3A` to a slightly lighter `#4A4A4A` with subtle opacity
- Add a thin glow to ALL connections (not just selected ones) using a low-opacity version of the filter
- Make the hover/click target wider (increase background path stroke width) for better interactivity

### Fix 5: Improve node card padding and sizing
**File:** `src/components/canvas/CanvasNode.tsx`
- Add bottom padding so the node content doesn't crowd the bottom port
- Increase from `w-[200px]` to `w-[220px]` to match n8n's slightly wider cards
- Add `pb-4` to the main container for breathing room below content

## Result
After these 5 targeted fixes:
- OpenAI/Anthropic nodes will have the signature green gradient card look
- All nodes will have visible borders with glow effects on hover/select
- Node entrance animation will actually play
- Connection lines will have subtle glow making them feel alive
- Cards will have proper spacing and sizing

No new files, no rewrites -- just surgical fixes to 2 existing files.
