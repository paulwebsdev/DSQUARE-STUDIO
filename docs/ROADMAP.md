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
- [x] Add clean in-editor preview mode.
- [x] Select individual text, heading and button elements on the canvas and edit their content.
- [x] Render image components in the editor canvas when present in the site document.

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

The dashboard, browser-local project/client management, initial template library prototype and v1 provider-neutral site document schema are in place. The visual editor now supports section editing, individual text/heading/button selection and content editing, image rendering, responsive device previews and a clean preview mode. Template previews are concept previews; full editable page layouts will be implemented with the visual editor. Project-specific documents, robust drag-and-drop, richer image controls, backend persistence, authentication and production publishing remain planned. All service-dependent features remain clearly marked as planned until their backend integrations exist.


### Project-specific editor documents
- [x] Give each project its own editor document key in browser storage.
- [x] Open the selected project directly from the project list.
- [x] Initialize a new project's editor document with its project name and website category.
- [ ] Replace browser-only storage with the future authenticated persistence adapter.


## Template-to-editor integration
- [x] Connect all nine starter templates to structured editable homepage documents.
- [x] Generate template-specific hero, feature, gallery, testimonial, and contact content.
- [x] Save the generated document under its new project ID before opening the visual editor.
- [ ] Expand template page plans into individually editable multi-page website documents.
- [ ] Replace concept-only template thumbnails with rendered page previews.


## Multi-page editor foundation
- [x] Add page switching within each project website document.
- [x] Create additional pages with a starter header, introduction and footer.
- [x] Rename pages and generate URL-friendly slugs.
- [x] Duplicate existing pages with independent section/component IDs.
- [x] Delete non-home pages while protecting the home page and final remaining page.
- [ ] Add page navigation links and rendered multi-page preview/export routing.
