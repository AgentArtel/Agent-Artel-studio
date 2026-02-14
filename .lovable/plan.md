
# Deploy `generate-image` Edge Function

## Overview

Create and deploy the Supabase Edge Function `generate-image` on the shared project, and set the `GEMINI_API_KEY` secret. No schema changes needed.

## Steps

### Step 1: Set the GEMINI_API_KEY secret

Before writing any code, we need the Gemini API key stored as a Supabase secret. You'll be prompted to paste your key (from Google AI Studio or Cloud Console). This key will only be accessible inside Edge Functions -- neither the game server nor Agent Artel Studio will see it directly.

### Step 2: Create the Edge Function

**File: `supabase/functions/generate-image/index.ts`** (Create)

The full implementation as provided in the request:
- CORS headers allowing `*` origin for MVP, supporting `POST` and `OPTIONS`
- Validates request body (`prompt` required, `style` optional defaulting to `"vivid"`, `agentId` optional)
- Reads `GEMINI_API_KEY` from Deno env (Edge Function secrets)
- Calls `ai.models.generateImages()` with model `imagen-4.0-generate-001`
- Returns `{ success: true, imageDataUrl: "data:image/png;base64,..." }` on success
- Returns typed error codes: `api_unavailable`, `invalid_prompt`, `no_result`, `content_policy`, `api_error`, `method_not_allowed`

### Step 3: Update `supabase/config.toml`

**File: `supabase/config.toml`** (Modify)

Add JWT verification disabled for this function so auth is handled in-code:

```toml
[functions.generate-image]
verify_jwt = false
```

### Step 4: Deploy

The function will be auto-deployed by Lovable after file creation. No manual `supabase functions deploy` needed.

## After Deployment

- **Open RPG** calls it via `supabase.functions.invoke('generate-image', { body: { prompt, style, agentId } })` -- will work immediately once the function exists and the secret is set.
- **Agent Artel Studio** can call the same endpoint with the same request shape for any image generation needs in the Studio UI.

## Files Summary

| File | Action |
|------|--------|
| `supabase/functions/generate-image/index.ts` | Create |
| `supabase/config.toml` | Modify (add `[functions.generate-image]`) |

## Secret Required

| Secret | Source |
|--------|--------|
| `GEMINI_API_KEY` | Google AI Studio or Cloud Console |
