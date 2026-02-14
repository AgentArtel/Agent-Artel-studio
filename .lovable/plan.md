
# Make the AI Agent Node Real -- n8n-Style Agent with Sub-Node Architecture

## Overview

Transform the AI Agent node from a visual placeholder into a fully functional agent that works like n8n's Tools Agent. The agent node will orchestrate a chat model (Gemini), optional memory, and connected tool nodes to process a prompt through an LLM-powered agent loop.

## How n8n's Agent Works (and How We'll Replicate It)

In n8n, the AI Agent is a **hub node** with specialized side ports:
- **Chat Model** (required): Connected LLM that powers reasoning (e.g., OpenAI, Gemini)
- **Memory** (optional): Conversation context persistence
- **Tools** (optional): HTTP requests, code execution, etc. that the agent can call

The agent receives input, sends it to the LLM with tool descriptions, and loops until the LLM produces a final answer (or hits max iterations). We'll implement this using our existing Gemini edge function as the LLM backbone.

## Changes

### 1. Revamp AI Agent Config Schema

**File: `src/lib/nodeConfig.ts`** -- Replace the current `aiAgentConfigSchema`

Current config has OpenAI/Anthropic model dropdowns and credential fields that don't connect to anything. Replace with:

- **Agent Type** selector: "Tools Agent" (default), "Conversational Agent"
- **Chat Model** selector: Gemini 2.5 Flash, Gemini 2.5 Pro (these are the models we actually have edge functions for)
- **System Prompt**: textarea for agent personality/instructions -- this is where users define their agent's character
- **User Prompt**: textarea for the input message (or `{{nodeId.text}}` template from upstream)
- **Max Iterations**: number (1-10, default 5) -- how many tool-calling loops before forcing a final answer
- **Temperature**: number slider (0-2)
- **Max Tokens**: number (1-65536)
- **Return Intermediate Steps**: boolean -- whether to include tool call logs in output

Remove the fake credential field and fake model options (GPT-4o, Claude, etc.) that have no backend.

### 2. Implement Agent Execution Logic

**File: `src/hooks/useExecution.ts`** -- Add `ai-agent` case to `executeNodeByType`

The agent execution will:

1. Read the agent's config (system prompt, user prompt, model, temperature, etc.)
2. Gather connected sub-node info from the graph:
   - Look at connections where `toPort === 'tool'` to find tool nodes
   - Look at connections where `toPort === 'memory'` to find memory node
3. Build a system prompt that includes tool descriptions (from connected tool nodes' configs)
4. Call `geminiChat()` with the assembled prompt
5. Parse the response -- if the LLM requests a tool call (via a structured format in the prompt), execute that tool node and feed results back
6. Loop until the LLM produces a final answer or max iterations reached
7. Return the final text response as `nodeResults[agentNodeId].text`

For the initial implementation, the agent will use a single-shot call (no tool-calling loop yet) but with full config support. The tool-calling loop can be added incrementally.

### 3. Add `ai-agent` Port for Chat Model

**File: `src/lib/portRegistry.ts`** -- Add a `model` port type

Currently the agent has `tool` (right) and `memory` (left) ports. Add a `model` port at the bottom-left for connecting a dedicated chat model sub-node. However, for the initial implementation, the model is configured directly in the agent config (like n8n's inline model selection), so this is optional.

### 4. Update Canvas Node Rendering for Agent

**File: `src/components/canvas/CanvasNode.tsx`** -- Show agent config summary

When an AI Agent node is configured, show a small summary below the title:
- Model name (e.g., "Gemini 2.5 Flash")
- Number of connected tools
- Whether memory is connected

### 5. Wire Agent into Default Workflow

**File: `src/pages/WorkflowEditorPage.tsx`** -- Add an agent workflow template

Add a new default workflow option or update the initial nodes to demonstrate the agent:
- **Trigger** -> **AI Agent** (configured with a system prompt like "You are a helpful assistant")
- This creates a minimal but fully runnable agent workflow

### 6. Update Results Panel for Agent Output

**File: `src/components/ExecutionResultsPanel.tsx`** -- Handle `ai-agent` results

Display the agent's text response, show which model was used, token usage, and iteration count.

## Execution Flow

```text
User clicks "Test"
  |
  v
Trigger node -> pass-through (success)
  |
  v
AI Agent node:
  1. Read config: systemPrompt, userPrompt, model, temperature
  2. Resolve templates in prompts (e.g., {{trigger-1.text}})
  3. Call geminiChat({ messages, model, temperature, systemPrompt })
  4. Store result: { text: "...", usage: {...}, model: "..." }
  |
  v
Results panel shows agent response
```

## Files Summary

| File | Action |
|------|--------|
| `src/lib/nodeConfig.ts` | Modify -- Replace ai-agent schema with real Gemini-backed config |
| `src/hooks/useExecution.ts` | Modify -- Add `ai-agent` case that calls `geminiChat()` |
| `src/components/canvas/CanvasNode.tsx` | Modify -- Show agent config summary (model, tools count) |
| `src/components/ExecutionResultsPanel.tsx` | Modify -- Handle ai-agent result display |
| `src/pages/WorkflowEditorPage.tsx` | Modify -- Update default workflow to include an agent example |

## What This Enables

After this change, you can:
1. Drop an AI Agent node on the canvas
2. Configure it with a system prompt (e.g., "You are a pirate captain named Blackbeard")
3. Set the user message (e.g., "Tell me about your ship")
4. Click Test and get a real Gemini-powered response
5. Chain it with other nodes -- e.g., Agent output feeds into Image Gen to visualize the character

## Future Iterations (Not in This PR)

- Tool-calling loop: Agent calls connected HTTP/Code tool nodes and feeds results back to LLM
- Memory persistence: Connected Memory node stores/retrieves conversation history from Supabase
- Multi-turn conversations: Chat panel that maintains context across runs
- Agent templates: Pre-built agent configs (Customer Support, Code Assistant, RPG Character, etc.)
