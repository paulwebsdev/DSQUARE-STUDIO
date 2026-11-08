# DSQUARE STUDIO — Roadmap

## Phase 1 — Foundation
- [x] Record product goals and approved decisions.
- [x] Define the initial architecture and module boundaries.
- [ ] Build the first responsive dashboard shell.
- [ ] Add navigation and accessible empty states.
- [ ] Run a production build and review responsive behavior.

## Phase 2 — Projects and clients
- [x] Define project and client types.
- [x] Build project list, create, rename, duplicate, archive and delete flows.
- [x] Add client directory and link clients to projects.
- [x] Add browser-local prototype persistence; replace with backend storage adapter when provider is selected.

## Phase 3 — Templates
- [x] Define template metadata and category system.
- [x] Build template browsing, category filters, search and preview.
- [x] Add starter template concepts across business, portfolio, e-commerce, blog, landing page, agency, restaurant, education and community categories.

## Phase 4 — Visual editor
- [x] Define versioned site/page/section/component schema and starter document factory.
- [x] Build first responsive editor canvas and section selection model.
- [x] Add starter section library and section properties panel.
- [x] Add desktop/tablet/mobile preview modes, undo/redo and browser-local autosave.

## Phase 5 — AI website generation
- [ ] Design prompt and requirements flow.
- [ ] Add provider adapter and secure server-side calls.
- [ ] Generate structured, editable site documents.
- [ ] Support iterative changes.

## Phase 6 — Export and publishing
- [ ] Build static-site export and asset packaging.
- [x] Add automated GitHub Pages preview deployment workflow (requires Pages source to be set to GitHub Actions).
- [ ] Define hosting adapter contract.
- [ ] Integrate the selected hosting platform when available.
- [ ] Add publish status and deployment history.

## Phase 7 — Production hardening
- [ ] Implement private server-side authentication and authorization.
- [ ] Add tests, accessibility review and security review.
- [ ] Add monitoring, backups and error handling.
- [ ] Verify end-to-end workflows before production use.

## Current milestone

The dashboard, browser-local project/client management, initial template library prototype and v1 provider-neutral site document schema are in place. Template previews are concept previews; full editable page layouts will be implemented with the visual editor. All service-dependent features remain clearly marked as planned until their backend integrations exist.
