

# Integrate Moonshot AI (Kimi K2 / K2.5) as Callable Tools

## Overview

Add a complete Moonshot AI / Kimi integration to the Studio, exposing every API capability as callable tools that can be used in agent workflows, NPC behaviors, and game scripting. The API is OpenAI-compatible (`POST /v1/chat/completions`), so integration is straightforward.

## What the Moonshot API Offers

Based on the official docs at `platform.moonshot.ai`, here is the full capability set:

### Available Models
| Model | Strengths | Context |
|-------|-----------|---------|
| `kimi-k2.5` | Most intelligent -- SoTA in agent, code, vision, multimodal (image + video) | 256K |
| `kimi-k2-0905-preview` | Upgraded K2 with better grounding and instruction following | 128K |
| `kimi-k2-turbo-preview` | Fast K2 variant for agentic tasks and coding | 256K |
| `kimi-k2-thinking-turbo` | Chain-of-thought reasoning (fast) | 128K |
| `kimi-k2-thinking` | Chain-of-thought reasoning (thorough) | 128K |
| `moonshot-v1-*-vision-preview` | Vision models (8k/32k/128k context) | varies |

### API Capabilities to Integrate as Tools
1. **Chat Completion** -- text generation with system/user/assistant messages
2. **Streaming Chat** -- SSE-based token streaming
3. **Vision / Multimodal** -- image + video understanding (base64 or file references)
4. **Tool Calling** -- OpenAI-compatible function calling (`tools` + `tool_choice` params)
5. **Web Search** -- built-in `$web_search` official tool for real-time internet access
6. **File Upload + Q&A** -- upload documents, reference via `ms://<file_id>`
7. **Token Estimation** -- count tokens before sending
8. **Thinking Mode** -- enable/disable chain-of-thought reasoning (K2.5)
9. **JSON Mode** -- structured output via `response_format: { type: "json_object" }`
10. **Context Caching** -- `prompt_cache_key` for session-based cache hits

## Implementation Plan

### Step 1: Add MOONSHOT_API_KEY Secret
- The user needs a Moonshot API key from `platform.moonshot.ai`
- Store as a Supabase secret `MOONSHOT_API_KEY`

### Step 2: Create Edge Function `supabase/functions/kimi-chat/index.ts`
A unified edge function that proxies all Kimi API calls. It accepts an `action` parameter to route to different capabilities:

**Supported actions:**
- `chat` -- Standard chat completion (streaming or non-streaming)
- `vision` -- Multimodal chat with images/video
- `web-search` -- Chat with built-in web search tool enabled
- `thinking` -- Chat with thinking mode enabled/disabled
- `list-models` -- List available models

The function will:
- Read `MOONSHOT_API_KEY` from env
- Forward requests to `https://api.moonshot.ai/v1/chat/completions`
- Support streaming by passing through the SSE response body
- Handle errors (429 rate limit, 401 auth, content filter, etc.)
- Support tool calling passthrough (tools array forwarded as-is)

### Step 3: Create Client Service `src/lib/kimiServices.ts`
A typed client library (mirroring the existing `geminiServices.ts` pattern) with functions:
- `kimiChat(params)` -- non-streaming chat
- `kimiChatStream(params)` -- streaming chat with SSE parsing
- `kimiVision(params)` -- vision/multimodal
- `kimiWebSearch(params)` -- chat with web search
- `kimiThinking(params)` -- chat with thinking mode
- `kimiListModels()` -- list available models

### Step 4: Register as API Integrations in `game.api_integrations`
Seed the database with integration records so these tools appear in the Integrations page and are available to NPCs/agents:

| Integration | skill_name | Category |
|-------------|-----------|----------|
| Kimi Chat | `kimi_chat` | api |
| Kimi Vision | `kimi_vision` | api |
| Kimi Web Search | `kimi_web_search` | knowledge |
| Kimi Thinking | `kimi_thinking` | api |

### Step 5: Update `supabase/config.toml`
Add the new edge function with `verify_jwt = false`.

## Technical Details

### Edge Function Structure (`kimi-chat/index.ts`)

```text
Request body:
{
  action: "chat" | "vision" | "web-search" | "thinking" | "list-models",
  messages: [...],           // chat messages
  model?: string,            // default: "kimi-k2.5"
  temperature?: number,      // default: 0.6
  maxTokens?: number,
  stream?: boolean,
  tools?: [...],             // OpenAI-format tool definitions
  toolChoice?: string,       // "auto" | "none" | null
  responseFormat?: object,   // { type: "json_object" } for JSON mode
  thinking?: object,         // { type: "enabled" | "disabled" }
  promptCacheKey?: string    // for context caching
}
```

The function maps these to the Moonshot API format and forwards the request. For web search, it injects the built-in `$web_search` tool into the tools array.

### Client Service Pattern

Each function in `kimiServices.ts` calls `supabase.functions.invoke('kimi-chat', { body })` for non-streaming, or uses `fetch()` with SSE parsing for streaming (same pattern as the Lovable AI streaming docs).

### File Summary

| File | Action |
|------|--------|
| `supabase/functions/kimi-chat/index.ts` | Create -- unified Kimi API proxy edge function |
| `src/lib/kimiServices.ts` | Create -- typed client service library |
| `supabase/config.toml` | Modify -- add `[functions.kimi-chat]` |

### Dependencies
- `MOONSHOT_API_KEY` secret must be added before the edge function will work
- No new npm packages needed -- the API is called via plain `fetch()` (OpenAI-compatible REST)

### What This Enables
Once integrated, you can:
- Add a "Kimi Chat" node type to the workflow canvas
- Use Kimi as an alternative LLM brain for NPCs alongside Gemini
- Give NPCs web search capability via Kimi's built-in `$web_search`
- Use Kimi Vision for NPCs that can "see" images players share
- Use thinking mode for complex NPC reasoning tasks
- Use tool calling to let Kimi-powered NPCs invoke game skills

