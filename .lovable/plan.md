
# Add Interactive Chat Panel to Workflow Editor

## Overview

Add a chat panel that lets you interact with the AI agent you've built on the canvas. The chat sends messages through the same `geminiChat()` function using the selected agent node's config (system prompt, model, temperature). It supports two modes: a floating popup over the full-screen canvas, or a side-by-side split view (half chat, half canvas) using a resizable panel layout.

## Changes

### 1. Create ChatPanel Component

**File: `src/components/ChatPanel.tsx`** (New)

Adapted from the reference-app's ChatPanel with these additions:

- **Layout modes**: `popup` (floating overlay, bottom-right) and `docked` (fills a resizable side panel)
- **Toggle button** in the header to switch between popup and docked mode
- Sends messages via `geminiChat()` using the first `ai-agent` node's config on the canvas (system prompt, model, temperature)
- Maintains conversation history in local state (array of `{role, content}` messages)
- Shows a loading indicator while the agent responds
- Renders AI responses with markdown formatting
- Displays the agent name and model in the header (pulled from the agent node's config)

### 2. Update WorkflowEditorPage Layout

**File: `src/pages/WorkflowEditorPage.tsx`** (Modify)

- Import `ChatPanel` and `ResizablePanelGroup/Panel/Handle` from `@/components/ui/resizable`
- Add state: `chatMode` (`'closed' | 'popup' | 'docked'`), `chatMessages` array
- Add `handleSendChatMessage` function that:
  1. Finds the first `ai-agent` node on the canvas
  2. Reads its config (systemPrompt, model, temperature, maxTokens)
  3. Sends the full conversation history + new message to `geminiChat()`
  4. Appends the response to `chatMessages`
- When `chatMode === 'docked'`: wrap the canvas area in a `ResizablePanelGroup` with two panels -- canvas (left) and chat (right, default 35% width)
- When `chatMode === 'popup'`: render ChatPanel as a floating overlay
- When `chatMode === 'closed'`: no chat visible

### 3. Update BottomToolbar Chat Button

**File: `src/components/BottomToolbar.tsx`** (Modify)

- Change the "Hide chat" button to cycle through chat modes: closed -> popup -> docked -> closed
- Update the icon and label to reflect current state:
  - Closed: "Chat" with MessageSquare icon
  - Popup: "Dock Chat" with PanelRight icon
  - Docked: "Close Chat" with X icon
- Pass `chatMode` as a prop instead of just `onHideChat`

## User Experience

1. Click "Chat" in the bottom toolbar -- popup appears bottom-right over the canvas
2. Type a message -- it goes to Gemini using the agent node's system prompt and model config
3. Click the dock icon in the chat header (or click toolbar again) -- canvas shrinks to the left, chat panel docks on the right with a resizable divider
4. Drag the divider to adjust the split ratio
5. Click "Close Chat" -- back to full-screen canvas

## Files Summary

| File | Action |
|------|--------|
| `src/components/ChatPanel.tsx` | Create -- chat UI with popup/docked modes, sends to geminiChat() |
| `src/pages/WorkflowEditorPage.tsx` | Modify -- add resizable split layout, chat state, message handler |
| `src/components/BottomToolbar.tsx` | Modify -- cycle chat mode button instead of simple toggle |
