

# Fix Game Schema TypeScript Errors

## Problem
The `Database` type (auto-generated, cannot be edited) only defines `"public"` as a valid schema key. Calling `supabase.schema('game')` in `gameSchema.ts` produces:
```
TS2345: Argument of type '"game"' is not assignable to parameter of type '"public"'
```

## Solution
Create a `GameDatabase` type that extends `Database` with a `game` schema entry, then use it as the generic parameter for `createClient`. This makes `.schema('game')` fully type-safe without touching the auto-generated types file.

## Changes

### 1. Create `src/integrations/supabase/game-types.ts`

Defines `GameDatabase` by extending `Database` with a `game` key that reuses the same table definitions already in `public` (since the column shapes are identical):

```typescript
import type { Database } from './types';

export type GameDatabase = Database & {
  game: {
    Tables: {
      agent_configs: Database['public']['Tables']['agent_configs'];
      api_integrations: Database['public']['Tables']['api_integrations'];
      agent_memory: Database['public']['Tables']['agent_memory'];
      player_state: Database['public']['Tables']['player_state'];
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
```

### 2. Modify `src/integrations/supabase/client.ts`

Change the generic from `Database` to `GameDatabase`:

```typescript
import type { GameDatabase } from './game-types';

export const supabase = createClient<GameDatabase>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { ... });
```

This is the only runtime-adjacent change. Every call to `supabase.schema('game')` across the entire app (NPCs.tsx, Integrations.tsx, Dashboard stats, gameSchema.ts) becomes valid TypeScript immediately.

### 3. No changes to any other files

- `src/integrations/supabase/types.ts` -- untouched (auto-generated)
- `src/lib/gameSchema.ts` -- untouched (already correct)
- `src/pages/NPCs.tsx` -- untouched (already uses `gameDb()`)
- `src/pages/Integrations.tsx` -- untouched (already uses `gameDb()`)

## Note on the Edge Function Error

The other build error (`Could not find 'npm:@google/genai'` in `gemini-chat/index.ts`) is a pre-existing Deno dependency issue unrelated to this merge. It can be addressed separately.

## Files Summary

| File | Action |
|------|--------|
| `src/integrations/supabase/game-types.ts` | Create |
| `src/integrations/supabase/client.ts` | Modify (swap Database for GameDatabase generic) |

