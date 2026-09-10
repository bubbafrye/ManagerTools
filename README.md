# ManagerTools

Local-first 1:1 workspace for managers and employees. See [Design.md](./Design.md) for product spec and [Architecture.md](./Architecture.md) for hosting and collaboration plans.

## Local development

```bash
npm install
npm run dev
```

That starts Vite and a local `y-websocket` server. Open `http://localhost:5173`. The header should say **Live**. Chrome and Safari on this machine stay in sync only while that server is running.

Use **New 1:1**, then open the copied URL in the other browser so both sides share the same `#/p/...` room.

## Two machines / different networks

GitHub Pages serves the app. A Cloudflare Worker hosts the live document.

Public app: https://bubbafrye.github.io/ManagerTools/

Sync host: `manager-tools-sync.bubbafrye.workers.dev`

On both machines, open the same invite URL from **New 1:1**. The header should say **Live**.

## Current scope

- Figma-faithful two-column layout (Action Items, Goals, Agenda)
- Design tokens from `src/styles.json` as CSS variables
- Yjs document state with IndexedDB persistence and websocket / PartyKit sync
- Shareable `#/p/:pageId` rooms via **New 1:1** (no passwords yet)

## Project structure

```
src/
  components/     Reusable UI (ActionItems, Goals, Agenda, …)
  hooks/          useDocumentState — local in-memory state
  pages/          OneOnOnePage layout
  styles/         tokens.css, global.css
  types/          Document data model
```
