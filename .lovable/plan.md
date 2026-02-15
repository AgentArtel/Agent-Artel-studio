

# Master Implementation Plan

## Summary

This plan covers all outstanding work items from the Cursor agent's foundation pipeline completion plus the tasks already queued in the sprint backlog. It is organized into sequential phases so each step can be approved and built independently.

---

## Phase 1: Update Type Definitions for New Tables

**Why:** The `game-types.ts` file doesn't know about `map_entities` or `map_metadata`. All downstream work depends on these types being available.

**What:**
- Update `src/integrations/supabase/game-types.ts` to add `map_entities` and `map_metadata` table definitions matching the actual DB schema
- `map_entities` columns: `id`, `map_id`, `entity_type`, `display_name`, `position_x`, `position_y`, `tiled_class`, `role`, `sprite`, `ai_enabled`, `tools`, `area_id`, `metadata`, `agent_config_id`, `synced_at`
- `map_metadata` columns: `map_id`, `description`, `theme`, `ambient`, `synced_at`

**Files:** `src/integrations/supabase/game-types.ts`

---

## Phase 2: Fix Kimi Integration Seeding

**Why:** The 4 Kimi integration rows (`kimi_chat`, `kimi_vision`, `kimi_web_search`, `kimi_thinking`) were inserted via a migration targeting the `public` schema, but `api_integrations` lives in the `game` schema. Only the original `image-generation` row exists. The rows need to be inserted properly.

**What:**
- Insert the 4 Kimi API integration rows into `game.api_integrations` using a data insert (not a migration)
- Also update the NPC Builder's `MODEL_OPTIONS` array in `NPCFormModal.tsx` to include the new Kimi K2.5 models: `kimi-k2.5`, `kimi-k2-0905-preview`, `kimi-k2-turbo-preview`, `kimi-k2-thinking-turbo`, `kimi-k2-thinking`

**Files:** `src/components/npcs/NPCFormModal.tsx` (update MODEL_OPTIONS)

---

## Phase 3: Dashboard -- Add Map Stats

**Why:** The Dashboard already shows 4 game stat cards (NPCs, Messages, Integrations, Players). With `map_entities` and `map_metadata` now populated, we can add map-awareness.

**What:**
- Add two new stat cards to the game stats row: "Maps" (count of `map_metadata` rows) and "Map Entities" (count of `map_entities` rows)
- Update the `game-dashboard-stats` query to include these two counts

**Files:** `src/pages/Dashboard.tsx`

---

## Phase 4: S-4 -- NPC Memory Viewer

**Why:** This is the next unblocked sprint task. The foundation gate has passed, S-1 is merged, and `game.agent_memory` has 824 rows of real conversation data to display.

**What:**
- Create `src/components/npcs/MemoryViewer.tsx` -- a chat-style message viewer that queries `game.agent_memory` filtered by `agent_id`
- Convert `NPCFormModal` to a tabbed layout with "Configuration" (existing form) and "Memory" (new viewer) tabs
- Memory tab hidden when creating a new NPC (no agent_id)
- Chat bubbles styled by role: user (right, blue), assistant (left, green), system (center, gray), tool (left, amber)
- Each bubble shows: role label, content, relative timestamp, and collapsible metadata JSON
- Loading skeleton, empty state, refresh button
- All queries via `gameDb()` -- read-only on `agent_memory`

**Files:**
- `src/components/npcs/MemoryViewer.tsx` (create)
- `src/components/npcs/NPCFormModal.tsx` (modify -- add tab system)
- `src/components/npcs/index.ts` (export MemoryViewer)

---

## Phase 5: S-6 -- Map Entity Browser Page

**Why:** With `map_entities` and `map_metadata` synced from Tiled, Studio needs a page to browse entities by map, see their positions and types, and link `ai-npc` entities to the NPC Builder for editing.

**What:**
- Create `src/pages/MapEntities.tsx` -- a new page that:
  - Lists all maps from `map_metadata` as selectable tabs/cards
  - Shows entities for the selected map from `map_entities`, grouped or filterable by `entity_type`
  - Each entity card shows: display_name, type badge, position, sprite, role, tools, and whether it's linked to an `agent_config_id`
  - For `ai-npc` entities with an `agent_config_id`, show a "Configure NPC" button that navigates to the NPCs page (or opens the NPC editor)
- Add "Map Browser" nav item to Sidebar (using the `MapPin` icon)
- Add `'map-entities'` route to `App.tsx`

**Files:**
- `src/pages/MapEntities.tsx` (create)
- `src/components/ui-custom/Sidebar.tsx` (add nav item)
- `src/App.tsx` (add route)

---

## Phase 6: S-1/S-2/S-3 Verification Pass

**Why:** These features are merged but the sprint says "verify and polish." With the foundation pipeline now confirmed working, we should do a live verification pass.

**What:**
- Navigate to each page (NPCs, Integrations, Dashboard) and verify:
  - NPC Builder: CRUD works, form round-trips JSON fields correctly, API skills toggle inventory tokens, model dropdown has correct options
  - Integrations: CRUD works, env var tag input works, category filtering
  - Dashboard: All 4+ game stat cards show correct counts from live data
- Fix any issues found during verification

**Files:** Various, depending on what's found

---

## Execution Order

```text
Phase 1 (types)
  |
  v
Phase 2 (Kimi seed + model options)
  |
  v
Phase 3 (Dashboard map stats)
  |
  v
Phase 4 (NPC Memory Viewer -- S-4)
  |
  v
Phase 5 (Map Entity Browser -- S-6)
  |
  v
Phase 6 (Verification pass)
```

Phases 1-3 are small and quick (type updates, data inserts, a few stat cards). Phase 4 is the largest piece of new UI work. Phase 5 is a new page. Phase 6 is manual testing.

---

## Technical Notes

- All game table queries use `gameDb()` from `src/lib/gameSchema.ts` which calls `supabase.schema('game')`
- The `map_entities` table has a foreign-key-like relationship: `agent_config_id` references `agent_configs.id` (text), but it's not a formal FK constraint
- Current live data: 4 agent_configs, 5 map_entities (4 ai-npc + 1 plain npc), 2 maps, 824 agent_memory rows, 1 api_integration
- No new npm dependencies needed for any phase
- No database migrations needed -- all tables and grants already exist

