# ManagerTools

Local-first 1:1 workspace for managers and employees. See [Design.md](./Design.md) for product spec and [Architecture.md](./Architecture.md) for hosting and collaboration plans.

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## Current scope

- Figma-faithful two-column layout (Action Items, Goals, Agenda)
- Design tokens from `src/styles.json` as CSS variables
- In-memory document state with editable fields, add-item, checkboxes, progress bars
- No server, persistence, or admin panel yet — those come in later build phases per Architecture.md

## Project structure

```
src/
  components/     Reusable UI (ActionItems, Goals, Agenda, …)
  hooks/          useDocumentState — local in-memory state
  pages/          OneOnOnePage layout
  styles/         tokens.css, global.css
  types/          Document data model
```
