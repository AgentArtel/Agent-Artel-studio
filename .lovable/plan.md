

# Add Game Scripts Placeholder Page

## Overview
Add a new "Game Scripts" page to the sidebar as a reminder and vision document for using the workflow builder to create scripted NPC events, cannon events, scripted dialogue, branching dialogue options, and other game scripting use cases.

## Changes

### 1. Create `src/pages/GameScripts.tsx`
A placeholder page (same pattern as `MapAgent.tsx`) that documents the vision:
- Header with a `ScrollText` icon and "Game Scripts" title, plus a "Coming Soon" badge
- Vision cards covering:
  - **Scripted NPC Events** -- Use workflow nodes to define triggered NPC behaviors (e.g. boss spawns, quest sequences, patrol changes)
  - **Scripted Dialogue** -- Build branching dialogue trees as workflows with condition nodes for player choices
  - **Cannon Events** -- Orchestrate timed or triggered world events (weather changes, sieges, spawns) as reusable workflow templates
  - **Dialogue Options & Branching** -- Model player choice trees with conditional paths, variable tracking, and outcome nodes
- A note section explaining that the existing Workflow Editor canvas is the intended runtime for these scripts, so no new editor is needed -- just specialized node types and templates

### 2. Update `src/components/ui-custom/Sidebar.tsx`
- Import `ScrollText` from lucide-react
- Add nav item `{ id: 'game-scripts', label: 'Game Scripts', icon: ScrollText }` placed after "AI Map Agent" and before "Integrations"

### 3. Update `src/App.tsx`
- Add `'game-scripts'` to the `Page` type union
- Import the `GameScripts` component
- Add a case in `renderPage()` for `'game-scripts'`

## Technical Details

No database or backend changes. This is a UI-only placeholder following the exact same structure as `MapAgent.tsx`:
- Props: `{ onNavigate: (page: string) => void }`
- Layout: `p-6 md:p-8`, dark theme, card grid

| File | Action |
|------|--------|
| `src/pages/GameScripts.tsx` | Create |
| `src/components/ui-custom/Sidebar.tsx` | Modify -- add nav item |
| `src/App.tsx` | Modify -- add route |

