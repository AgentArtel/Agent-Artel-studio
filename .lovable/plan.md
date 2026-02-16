

# Ideas Page - Idea Dump & Save

## What This Does
Adds a new "Ideas" tab in the sidebar where you can quickly jot down ideas, tag them, and save them to the database for later. Think of it as a simple scratchpad that persists.

## Features
- Text area to type an idea and hit save
- Saved ideas displayed as cards in reverse chronological order (newest first)
- Optional tag/category chip (e.g. "NPC", "Map", "Gameplay", "UI", or custom)
- Delete ideas you no longer need
- Stored in Supabase so they persist across sessions

## Technical Details

### 1. Database Table
Create a new `studio_ideas` table:
- `id` (uuid, primary key, default gen_random_uuid())
- `user_id` (uuid, default placeholder)
- `content` (text, the idea)
- `tag` (text, nullable, optional category)
- `created_at` (timestamptz, default now())

RLS policy: allow all access (matching existing studio_ table pattern).

### 2. New Page: `src/pages/Ideas.tsx`
- Header with Lightbulb icon, title "Ideas"
- Input area: a textarea + optional tag dropdown + "Save" button
- List of saved ideas as simple cards showing content, tag chip, relative timestamp, and a delete button
- Uses React Query for fetching/mutations (same pattern as other pages)

### 3. Sidebar & Routing
- Add `ideas` entry to the sidebar nav items in `src/components/ui-custom/Sidebar.tsx` (using `Lightbulb` icon from lucide)
- Add `ideas` to the `Page` type union and routing switch in `src/App.tsx`
- Position it near the top of the sidebar for easy access (after "Play Game")

### 4. Files Changed
- `supabase/migrations/` -- new migration for `studio_ideas` table
- `src/pages/Ideas.tsx` -- new file
- `src/components/ui-custom/Sidebar.tsx` -- add nav item
- `src/App.tsx` -- add routing

