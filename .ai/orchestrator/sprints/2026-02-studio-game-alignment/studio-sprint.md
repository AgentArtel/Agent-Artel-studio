# Studio Sprint Slice — 2026-02

> Lovable's view of the master sprint. Studio repo (Agent-Artel-studio) tasks only.
> Master: [master.md](master.md)

---

## Studio Tasks

| ID | Title | Status | Brief |
|----|-------|--------|-------|
| S-1 | NPC Builder Page (CRUD for agent_configs) | **MERGED** — verify & polish | [Brief](../../briefs/lovable/2026-02/TASK-S-1-npc-builder-ui.md) |
| S-2 | Integrations Page (CRUD for api_integrations) | **MERGED** — verify & polish | [Brief](../../briefs/lovable/2026-02/TASK-S-2-integrations-page.md) |
| S-3 | Dashboard Game Stats | **MERGED** — verify & polish | [Brief](../../briefs/lovable/2026-02/TASK-S-3-dashboard-game-stats.md) |
| S-4 | NPC Memory Viewer | TODO — unblocked, brief ready | [Brief](../../briefs/lovable/2026-02/TASK-S-4-npc-memory-viewer.md) |
| S-5 | Lovable Feed Integration | TODO | Brief TBD (depends on game social feed) |
| S-6 | Map Entity Browser | TODO | Browse `game.map_entities` per map, link ai-npc rows to NPC Builder; depends on D-6 |

## Order

1. **S-1, S-2, S-3** are MERGED — briefs now say "verify, test, polish" (not build from scratch)
2. **S-4** is unblocked (S-1 merged) — NPC Memory Viewer is a tab inside the NPC detail view
3. **S-6** after D-6 ships — Map Entity Browser reads `game.map_entities`, links ai-npc rows to NPC Builder for full config
4. **S-5** after game finishes G-4 — social feed UI needs game data to render

## What's Already Built

All three features are in the Studio repo on main:
- `src/lib/gameSchema.ts` — `gameDb()` helper (all game queries use it)
- `src/pages/NPCs.tsx` + `src/components/npcs/` — full NPC CRUD with form modal
- `src/pages/Integrations.tsx` — full Integrations CRUD with env var tag input
- `src/pages/Dashboard.tsx` — game stats section with 4 cards
- Sidebar: NPCs (Users icon), Integrations (Puzzle icon) both in nav
- App.tsx: routing for both pages

## Key Constraints (still apply for verify & polish)

- **Every game table query MUST use `supabase.schema('game').from(...)`** or the `gameDb()` helper — already the case, verify it stays that way.
- Studio tables (`studio_*`) use default schema (no prefix).
- JSON columns (`model`, `spawn`, `behavior`) are built/parsed from individual form fields — verify correct round-trip.
- When an API skill is selected in the NPC form, `required_item_id` is auto-added to inventory — verify this works.

## Existing Specs (in Studio repo)

These contain full detail — briefs reference them:
- `docs/game-integration/NPC-BUILDER-PLAN.md` — canonical NPC Builder spec
- `docs/game-integration/TASK-game-schema-integration.md` — full schema integration task
- `docs/game-integration/VISION-studio-game-architecture.md` — architecture context
- `docs/game-integration/LOVABLE-PROMPTS.md` — pre-written Lovable prompts
