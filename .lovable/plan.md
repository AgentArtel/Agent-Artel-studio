

# Wire generate-image into Studio UI + Add GenAI Edge Functions

## Overview

Two parts: (1) integrate the existing `generate-image` edge function as a callable node type in Agent Artel Studio, and (2) add additional Gemini-powered edge functions for the most common GenAI capabilities agents would need.

---

## Part 1: Wire generate-image into the Studio UI

### 1.1 Add `image-gen` node type

**File: `src/types/index.ts`**

Add `'image-gen'` to the `NodeType` union.

### 1.2 Add node config schema

**File: `src/lib/nodeConfig.ts`**

Add an `imageGenConfigSchema` entry:
- Section "Image Settings" with fields:
  - `prompt` (textarea, required) -- the image description
  - `style` (select) -- options: vivid, photorealistic, anime, watercolor, pixel-art, film-noir
  - `agentId` (text, optional) -- for logging which agent requested it
- Register it in the `schemas` record under `'image-gen'`

### 1.3 Create ImageGenNode component

**File: `src/components/nodes/ImageGenNode.tsx`** (Create)

A node card similar to `HTTPRequestNode` but with an `Image` icon from lucide-react. Shows title, subtitle, and input/output ports.

### 1.4 Register in node exports

**File: `src/components/nodes/index.ts`**

Add `export { ImageGenNode } from './ImageGenNode'`

### 1.5 Add to NodeSearchPalette

**File: `src/components/canvas/NodeSearchPalette.tsx`**

Add an entry in the "Tools" category:
```
{ id: 'image-gen', type: 'image-gen', label: 'Image Generator', description: 'Generate images via Gemini Imagen', icon: ImageIcon }
```

### 1.6 Add to CanvasNode renderer

**File: `src/components/canvas/CanvasNode.tsx`**

Add case for `'image-gen'` in the node type switch, rendering `ImageGenNode`.

### 1.7 Create a service helper

**File: `src/lib/generateImage.ts`** (Create)

A thin wrapper that calls the edge function:
```typescript
import { supabase } from '@/integrations/supabase/client';

export async function generateImage(params: {
  prompt: string;
  style?: string;
  agentId?: string;
}) {
  const { data, error } = await supabase.functions.invoke('generate-image', {
    body: params,
  });
  if (error) throw error;
  return data as { success: boolean; imageDataUrl?: string; error?: string; message?: string };
}
```

---

## Part 2: Additional GenAI Edge Functions

These cover the most common Gemini API capabilities an agent workflow would need. All follow the same pattern as `generate-image`: Deno edge function reading `GEMINI_API_KEY` from secrets, CORS headers, typed request/response.

### 2.1 `gemini-chat` -- Text/chat completions

**File: `supabase/functions/gemini-chat/index.ts`** (Create)

- Accepts `{ messages: {role, content}[], model?, temperature?, maxTokens? }`
- Calls Gemini `generateContent` via `@google/genai`
- Returns `{ success: true, text: "...", usage: {...} }` or streaming SSE
- Supports models: `gemini-2.5-flash`, `gemini-2.5-pro`
- Default model: `gemini-2.5-flash`

### 2.2 `gemini-embed` -- Text embeddings

**File: `supabase/functions/gemini-embed/index.ts`** (Create)

- Accepts `{ text: string | string[], model? }`
- Calls Gemini `embedContent`
- Returns `{ success: true, embeddings: number[][] }`
- Default model: `text-embedding-004`

### 2.3 `gemini-vision` -- Image understanding / analysis

**File: `supabase/functions/gemini-vision/index.ts`** (Create)

- Accepts `{ prompt: string, imageUrl: string, model? }`
- Sends image + text to Gemini multimodal
- Returns `{ success: true, text: "..." }`
- Default model: `gemini-2.5-flash`

### 2.4 Config updates

**File: `supabase/config.toml`**

Add entries for each new function:
```toml
[functions.gemini-chat]
verify_jwt = false

[functions.gemini-embed]
verify_jwt = false

[functions.gemini-vision]
verify_jwt = false
```

### 2.5 Add corresponding node types + config schemas

**File: `src/types/index.ts`** -- Add `'gemini-chat' | 'gemini-embed' | 'gemini-vision'` to `NodeType`

**File: `src/lib/nodeConfig.ts`** -- Add config schemas for each:
- `gemini-chat`: model selector, temperature, maxTokens, system prompt
- `gemini-embed`: model selector, input text
- `gemini-vision`: model selector, prompt, image source

**File: `src/components/canvas/NodeSearchPalette.tsx`** -- Add entries in a new "Gemini AI" category

### 2.6 Service helpers

**File: `src/lib/geminiServices.ts`** (Create)

Thin wrappers for each edge function using `supabase.functions.invoke(...)`.

---

## Files Summary

| File | Action |
|------|--------|
| `src/types/index.ts` | Modify -- add new node types |
| `src/lib/nodeConfig.ts` | Modify -- add config schemas |
| `src/components/nodes/ImageGenNode.tsx` | Create |
| `src/components/nodes/index.ts` | Modify -- add export |
| `src/components/canvas/NodeSearchPalette.tsx` | Modify -- add palette entries |
| `src/components/canvas/CanvasNode.tsx` | Modify -- add render cases |
| `src/lib/generateImage.ts` | Create |
| `src/lib/geminiServices.ts` | Create |
| `supabase/functions/gemini-chat/index.ts` | Create |
| `supabase/functions/gemini-embed/index.ts` | Create |
| `supabase/functions/gemini-vision/index.ts` | Create |
| `supabase/config.toml` | Modify -- add function entries |

No new secrets needed -- all functions reuse the existing `GEMINI_API_KEY`.

