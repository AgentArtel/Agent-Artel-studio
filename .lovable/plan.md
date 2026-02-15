
# Add AI Map Agent Page

## Overview
Add a new "AI Map Agent" page to the sidebar and routing. This is a placeholder page that documents the vision for a programmatic map editor / map builder tool. The page will have a clear description of what we want to build here so we can circle back later.

## Changes

### 1. Create `src/pages/MapAgent.tsx`
A new placeholder page following the same pattern as other pages (accepts `onNavigate` prop). It will include:
- A header with a Map icon and "AI Map Agent" title
- A descriptive card explaining the planned functionality:
  - Programmatic map editing via AI commands
  - Map builder / visual map editor
  - Integration with game world data
  - Terrain, object placement, NPC spawn point management
- A "Coming Soon" badge to indicate this is a future feature

### 2. Update `src/components/ui-custom/Sidebar.tsx`
Add a new nav item for the Map Agent page:
- id: `'map-agent'`
- label: `'AI Map Agent'`
- icon: `Map` (from lucide-react)
- Placed after "NPCs" and before "Integrations" in the nav list

### 3. Update `src/App.tsx`
- Add `'map-agent'` to the `Page` type union
- Import the new `MapAgent` component
- Add a case in `renderPage()` for `'map-agent'`

## Technical Details

The page component will follow the exact same structure as `NPCs.tsx` and `Integrations.tsx`:
- Accepts `{ onNavigate: (page: string) => void }` props
- Uses the same layout padding (`p-6 md:p-8`)
- Dark theme styling consistent with the rest of the app

No database tables or queries are needed yet -- this is purely a UI placeholder with documentation of intent.

## Files Summary

| File | Action |
|------|--------|
| `src/pages/MapAgent.tsx` | Create -- placeholder page with vision notes |
| `src/components/ui-custom/Sidebar.tsx` | Modify -- add Map Agent nav item |
| `src/App.tsx` | Modify -- add routing for map-agent page |
