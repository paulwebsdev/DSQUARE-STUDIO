# DSQUARE STUDIO — Architecture

## 1. Product goal

Build a private studio that lets its owner create, edit, manage, export and publish websites for clients. It must be extensible enough to support all kinds of websites, including categories and capabilities added in the future.

## 2. Product principles

1. **Universal website support:** do not hard-code the product around a small fixed set of website categories.
2. **Composable building blocks:** pages are assembled from reusable sections and components.
3. **Responsive by default:** every generated or edited site must support desktop, tablet and mobile layouts.
4. **Human control:** AI proposes and generates; the owner can inspect and edit the result.
5. **Portable output:** project data should not be tightly coupled to one hosting provider.
6. **Private by design:** no public self-registration; owner access must be enforced server-side.
7. **Provider independence:** hosting, database and AI services should sit behind adapters so providers can be connected or changed later.

## 3. High-level modules

- **Studio shell:** navigation, dashboard, account and global settings.
- **Authentication:** private owner sign-in, session management and server-side authorization.
- **Dashboard:** recent work, project activity and creation shortcuts.
- **Project manager:** client records, projects, duplication, archive and project status.
- **Template library:** searchable templates, categories, previews and starter content.
- **Visual editor:** canvas, component/section library, properties panel, responsive controls, undo/redo and autosave.
- **AI generator:** prompt intake, requirements clarification, page planning, generation and iterative changes.
- **Site renderer:** turns a portable page document into a rendered website.
- **Asset manager:** images, logos, fonts and other project assets.
- **Export service:** packages a website and its assets into downloadable files.
- **Publishing service:** deploys a project through a hosting-provider adapter.
- **Integrations layer:** database, storage, AI and hosting provider adapters.

## 4. Website document model

The editor should work from a structured, versioned project document rather than treating the page as arbitrary HTML.

Conceptual model:

- Project: client, name, status, settings and timestamps.
- Site: global theme, navigation, page list and shared assets.
- Page: route, metadata, layout and ordered sections.
- Section: reusable block with a defined type and properties.
- Component: text, image, button, form, video, gallery, product grid and other elements.
- Theme: colour tokens, typography, spacing and breakpoints.
- Asset: file reference, type, dimensions and metadata.

The schema will be versioned so older projects can be migrated safely when the editor evolves.

## 5. Visual editor experience

Approved direction: **Option 4 — Hybrid Professional Editor**.

- Left panel: sections, elements, layers and assets.
- Centre: editable page canvas.
- Right panel: properties for the selected element.
- Top toolbar: page selection, undo/redo, save state, preview, responsive mode and publish/export actions.
- Guided mode: simplified step-by-step editing for users who prefer it.
- Focus mode: expand the canvas and reduce panel clutter.
- Mobile interface: panels become drawers or compact sheets; editing must remain usable on a phone.

## 6. AI generation flow

1. Collect the user's prompt and any relevant brand information.
2. Identify the website's purpose, audience, pages and required features.
3. Propose a site map and design direction.
4. Generate a structured project document using approved components.
5. Render a preview.
6. Let the owner request changes or edit manually.
7. Save the result as a normal editable project.

AI output must use the same project schema and component system as manually created websites.

## 7. Integrations and provider adapters

The hosting and database provider is intentionally undecided until the platform being developed by the user's contact is ready. Avoid locking the product into a provider prematurely.

Define adapter boundaries for:
- Authentication/session provider
- Database
- File/object storage
- AI model provider
- Hosting/deployment provider

Provider credentials must remain server-side and must never be exposed in browser code.

## 8. Security

- No public registration.
- Server-side authorization for every private project and administrative operation.
- Secure, hashed password handling through a trusted authentication implementation; never store plaintext passwords.
- Secure session cookies and appropriate CSRF protections where applicable.
- Validate and sanitize user-supplied content.
- Keep secrets out of GitHub.
- Add audit-friendly logging for sensitive operations without logging credentials.

## 9. Initial implementation sequence

1. Repository and product documentation.
2. Responsive dashboard shell and design system.
3. Project and client data model.
4. Template catalogue and preview flow.
5. Visual editor foundation and versioned page schema.
6. Save/load persistence through the chosen backend.
7. AI generation integration.
8. Export pipeline.
9. Hosting-provider integration and publishing.
10. Security review, testing and production readiness.

## 10. Current scope boundary

The first frontend milestone is a navigable dashboard shell with realistic empty states and creation entry points. It does not claim to provide real authentication, AI generation, persistence, export or deployment until those services are implemented and tested.
