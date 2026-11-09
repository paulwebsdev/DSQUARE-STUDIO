# DSQUARE STUDIO — Roadmap

## Template marketplace expansion — 2026-11-09
- [x] Expand the library to 33 website categories with 10 named starter options per category (330 options total).
- [x] Add a dedicated School category with 10 school-specific starter concepts and school-focused page navigation.
- [x] Give template variants distinct colour combinations, typography pairings, button shapes, spacing and selected section-order/layout treatments.
- [x] Add category-matched hero imagery, differentiated homepage section orders, premium typography, colour palettes and responsive inner-page starter structures.
- [x] Add category-specific homepage copy, page plans and inner-page guidance for Automotive, Fitness & Sports, Wedding, Pet Care, Music & Entertainment and Personal Services.\n- [ ] Build fully bespoke category-specific inner-page modules (for example product grids, school admissions, restaurant menus, property listings, vehicle inventories and class timetables).
- [ ] Verify all 330 options can be selected and opened in the visual editor on desktop and Android.


## Button library and interaction polish — 2026-11-09
- [x] Add a searchable library of 20 ready-made social, contact and action buttons, plus a custom button preset.
- [x] Allow button destinations, internal page links, email/telephone actions and optional new-tab behaviour.
- [x] Add editable hover background, text colour, movement and shadow effects.
- [x] Preserve the selected social/action library style in the style selector and add a one-tap hover-effect reset.
- [ ] Verify button links, hover states and touch behaviour in desktop and Android browsers.


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
- [x] Expand the library to 210 named template options across 27 website categories, including real estate, healthcare, beauty, travel, finance, SaaS, nonprofit, events, construction, legal, school, automotive, fitness, wedding, pet care, music and personal services.
- [x] Add category-specific colour palettes, typography and button styling for premium brand direction.
- [x] Generate editable multi-page starter documents from each template, not just a homepage.
- [x] Improve template preview cards with a richer browser/page composition.
- [ ] Replace abstract preview cards with actual rendered screenshots of each complete template.

## Phase 4 — Visual editor
- [x] Define versioned site/page/section/component schema and starter document factory.
- [x] Build first responsive editor canvas and section selection model.
- [x] Add starter section library and section properties panel.
- [x] Add desktop/tablet/mobile preview modes, undo/redo and browser-local autosave.
- [x] Add in-editor preview mode with vertical scrolling and direct text editing while previewing.
- [x] Select individual text, heading and button elements on the canvas and edit their content.
- [x] Render image components in the editor canvas when present in the site document.

## Phase 5 — AI website generation
- [ ] Design prompt and requirements flow.
- [ ] Add provider adapter and secure server-side calls.
- [x] Generate structured, editable multi-page site documents from the brief using the built-in template/draft engine.
- [ ] Generate structured, editable site documents using a real AI provider.
- [x] Add local natural-language quick commands for a small set of editor changes.
- [ ] Support rich iterative changes through the secure AI provider.

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

## Workspace backup and restore
- [x] Download a versioned JSON backup of projects, clients and saved website documents.
- [x] Validate backup structure, unique record IDs, client references and website page structure before restore.
- [x] Confirm before replacing current workspace data and attempt rollback if browser storage writes fail.
- [x] Explain browser-local storage and private backup contents in Settings.
- [ ] Add encrypted cloud backup after authenticated backend storage is available.

## Current milestone

The dashboard, browser-local project/client management, expanded premium template library and v1 provider-neutral site document schema are in place. The library now offers 330 named options across 33 categories, with category-matched imagery, differentiated homepage treatments and editable multi-page drafts. Inner pages currently use a shared premium structure with category-aware copy; fully bespoke modules remain planned. The visual editor supports section editing, individual text/heading/button selection and content editing, image rendering, responsive device previews and a scrollable preview where text can also be edited in place. Template preview cards are still illustrative rather than live renderings of the finished websites. Backend persistence, authentication and production publishing remain planned. All service-dependent features remain clearly marked as planned until their backend integrations exist.


### Project-specific editor documents
- [x] Give each project its own editor document key in browser storage.
- [x] Open the selected project directly from the project list.
- [x] Initialize a new project's editor document with its project name and website category.
- [ ] Replace browser-only storage with the future authenticated persistence adapter.


## Template-to-editor integration
- [x] Connect all 19 starter templates to structured editable multi-page website documents.
- [x] Generate template-specific hero, feature, gallery, testimonial, contact and interior-page starter content.
- [x] Save the generated document under its new project ID before opening the visual editor.
- [x] Expand template page plans into individually editable multi-page website documents.
- [ ] Replace concept-only template thumbnails with rendered page previews.


## Multi-page editor foundation
- [x] Add page switching within each project website document.
- [x] Create additional pages with a starter header, introduction and footer.
- [x] Rename pages and generate URL-friendly slugs.
- [x] Duplicate existing pages with independent section/component IDs.
- [x] Delete non-home pages while protecting the home page and final remaining page.
- [ ] Add page navigation links and rendered multi-page preview/export routing.



## Editor upgrade batch
- [x] Reorder page sections by dragging on the canvas (header and footer stay fixed).
- [x] Add, replace and remove uploaded image components (5 MB per-image limit; stored in the browser document).
- [x] Edit selected text/component colour, font size, alignment and weight.
- [x] Show page navigation links in the website header and switch between pages in the editor.
- [ ] Add keyboard/touch-specific drag alternatives and move image assets to managed storage before production.


## Professional website building — editor batch 2
- [x] Add editable heading, text, button, form and shape/container elements.
- [x] Duplicate and delete selected elements.
- [x] Add per-device component style overrides for desktop, tablet and mobile previews.
- [x] Add configurable element destinations and preview-mode link behavior.
- [x] Add a contact-form layout preview with required name, email and message fields.
- [ ] Connect forms to a secure submission service before production.
- [ ] Add touch/keyboard drag alternatives and validate responsive controls on real devices.


## Website source export
- [x] Generate standalone HTML for every page in a site document.
- [x] Generate shared CSS and JavaScript source files.
- [x] Package all pages and shared assets into a downloadable ZIP archive.
- [x] Offer individual HTML, CSS and JavaScript source downloads.
- [ ] Add a managed asset library and copy image files into an assets folder during export.
- [ ] Add a production form-service integration and automated export tests.


## Media library, SEO and export assets
- [x] Add a project-level media library for uploaded images with preview, insert and remove actions.
- [x] Keep existing image components compatible while registering uploaded images as managed site assets.
- [x] Add website title, meta description and language controls.
- [x] Export uploaded image data into an assets folder and rewrite exported image paths.
- [x] Add editable image alt text and include descriptions in exported image markup.
- [x] Resize and compress supported large raster uploads while preserving PNG transparency and leaving SVG/GIF originals unchanged.
- [ ] Add Open Graph/social sharing metadata and an optional social preview image.
- [ ] Add automated tests for multi-page export and media asset packaging.

Note: media assets remain in browser-local project storage for this prototype; a future authenticated storage adapter will replace this before production.


## Mobile editor usability update
- [x] Add a mobile bottom navigation entry for Add, Layers, Media and SEO.
- [x] Open editor panels in a scrollable mobile drawer with a close control.
- [x] Keep the desktop/tablet side-panel layout unchanged.
- [ ] Validate interactions on a range of physical Android and iOS devices.


### Responsive element layout controls
- [x] Add per-device width, maximum width, height, padding, margin and corner-radius controls for selected elements.
- [x] Store layout overrides independently for desktop, tablet and mobile.


## Image layout controls
- [x] Add image-specific fit modes: cover/crop, contain, stretch and original size.
- [x] Add image focal positioning presets (centre, edges and corners).
- [x] Store controls in per-device responsive styles so desktop/tablet/mobile can differ.


## Element positioning controls
- [x] Add normal-flow, relative, absolute and sticky positioning modes.
- [x] Add top, right, bottom and left offsets plus layer-order control.
- [x] Store positioning settings in per-device responsive styles.


## Advanced visual editor batch — 2026-11-09
- [x] Add stacked, flexible-row and CSS-grid section layouts with editable grid columns and gaps.
- [x] Add section background image selection from the project media library.
- [x] Add section entrance animations and speed presets, with reduced-motion support.
- [x] Add global theme controls for primary/accent colours and heading/body fonts.
- [x] Add expanded component typography controls including font family, line height, letter spacing and text transform.
- [x] Save selected elements as reusable project-library elements and insert them into other sections.
- [ ] Validate touch interactions and exported layout/effect styling on physical devices before production.
- [x] Add eight direct image-resize handles for corner and edge sizing, with per-device dimensions and position adjustments.
- [x] Cancel an interrupted image gesture cleanly instead of saving a partial pointer-cancel movement.


## AI website builder — first intake and draft milestone
- [x] Add an AI-builder workspace with a structured website brief, brand name, category, design direction and requested page list.
- [x] Create a multi-page editable starter project from the brief and open it directly in the visual editor.
- [x] Preserve the brief as site metadata and starter page copy for further editing.
- [ ] Connect a real AI provider through a secure server-side adapter; current generation is a built-in draft generator, not an AI model call.
- [ ] Add AI-generated sitemap proposals, content generation, image suggestions and iterative edit requests.
- [ ] Add validation and tests for generated multi-page site documents.


## AI draft page-content upgrade
- [x] Generate page introductions that respond to common page purposes such as About, Services, Portfolio, Shop, Menu, Courses, Events and FAQ.
- [x] Add a relevant secondary content section to generated Services, Portfolio/Work, Shop/Product, Menu, Course/Program and Event/Testimonial pages.
- [ ] Expand page-specific copy and section structures using the real AI provider after backend integration.


## Natural-language editor quick actions
- [x] Add a dedicated AI Edit panel in desktop and mobile editor navigation.
- [x] Support safe local commands for adding common sections, changing the selected section background, changing primary/accent theme colours and replacing a selected section heading.
- [x] Show supported examples and clear feedback when an instruction is not recognized.
- [ ] Replace the local command matcher with authenticated natural-language AI revisions through the secure backend adapter.


## Secure AI integration design
- [x] Document a provider-neutral server-side AI adapter contract for website generation and natural-language revisions.
- [x] Define authentication, validation, sanitization, rate-limit, secret-management and failure-handling requirements.
- [ ] Implement the adapter in the selected trusted backend after the hosting/database platform decision.
- [ ] Add mock-provider tests and validate generated documents against the shared site schema.


## Independent element styling controls
- [x] Add independent per-device background and text colour controls for each selected element.
- [x] Add independent border colour, width and style controls.
- [x] Add selectable shadow presets without changing other elements.
- [ ] Add richer custom shadow and border-radius presets after usability testing.

## Export fidelity and reusable element batch — 2026-11-09
- [x] Include section background images in exported asset packages and rewrite their references to local asset files.
- [x] Deduplicate repeated image assets during export to reduce ZIP size.
- [x] Preserve heading and body theme fonts in generated website CSS.
- [x] Include the editor's fade, slide and zoom entrance animation keyframes in exported CSS.
- [x] Respect reduced-motion preferences and collapse CSS-grid sections to one column on narrow screens.
- [x] Preserve per-device responsive styles when saving and inserting reusable elements.
- [x] Add a repeatable manual editor/export QA checklist (`docs/EXPORT-QA.md`).
- [ ] Add automated export regression tests and verify exported sites in desktop and mobile browsers.

## Editor reliability and export correction — 2026-11-09
- [x] Correct the data-URL matcher used to rewrite section background images in exported HTML.
- [x] Debounce autosave briefly to avoid writing to browser storage on every keystroke.
- [x] Catch browser storage quota or write errors and show a visible save-status warning instead of silently failing.
- [x] Add Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z and Ctrl/Cmd+Y undo/redo shortcuts while protecting text fields and inline editing.
- [ ] Add automated export regression tests and verify exported sites in desktop and mobile browsers.


## SEO, accessibility and page reliability batch — 2026-11-09
- [x] Add Open Graph title, description and website type metadata to exported pages.
- [x] Add Twitter summary-card metadata and browser theme-colour metadata.
- [x] Add a keyboard-accessible skip-to-content link and visible keyboard focus styles to exported websites.
- [x] Add accessible labels to exported page sections.
- [x] Preserve intentionally empty image alt text for decorative images and add asynchronous image decoding.
- [x] Add an additional tablet-width responsive grid fallback and active-page navigation styling.
- [x] Prevent duplicate page slugs when adding, renaming or duplicating pages.
- [x] Generate collision-resistant IDs for duplicated page content.
- [x] Add a live website-title character counter to the SEO panel.
- [ ] Validate exported metadata and accessibility in browser-based QA and automated tests.

## Mobile editing and preview refinement — 2026-11-09
- [x] Add touch drag handles to move sections on touchscreens without making the whole canvas a drag target.
- [x] Keep section dragging visually indicated while a reorder is in progress.
- [x] Allow headings, text, buttons and containers to be edited in the scrollable preview mode.
- [x] Document physical-device touch-reordering checks in the editor/export QA checklist.
- [ ] Validate touch reordering on physical Android and iOS devices and add automated editor interaction tests.


## Project data reliability batch — 2026-11-09
- [x] Guard browser-local project and client persistence against storage quota and availability errors.
- [x] Display a dismissible warning when browser storage cannot save workspace data.
- [x] Duplicate a project together with its saved editable website document when available.
- [x] Update the copied website title to match the duplicated project name.
- [x] Keep duplicated projects in Draft status with fresh creation and update timestamps.
- [x] Remove a project's browser-local editor document when the project is permanently deleted.
- [x] Return to the project list if the currently open project is deleted.
- [x] Refresh project update timestamps when archiving or restoring.
- [x] Refresh linked project timestamps when a client is deleted and projects become unassigned.
- [x] Normalize client names and email addresses when saving new client records.
- [ ] Add workspace backup/restore and cloud persistence after the secure storage adapter is selected.


## Image accessibility and editor consistency batch — 2026-11-09
- [x] Show each uploaded image's saved alt text in the editor canvas instead of a generic placeholder.
- [x] Edit the selected image's alt text directly in its properties panel.
- [x] Add a decorative-image option that intentionally stores empty alt text.
- [x] Keep image descriptions synchronized with the media-library asset record.
- [x] Generate collision-resistant IDs for newly added sections and their starter components.
- [x] Generate collision-resistant IDs for newly inserted image and general components.
- [x] Deep-copy responsive style maps when duplicating an element.
- [x] Generate collision-resistant IDs for saved and inserted reusable elements.
- [x] Clear stale component selection and close mobile panels when switching website pages.
- [ ] Verify keyboard-only editor selection and screen-reader announcements in a real browser accessibility pass.


## Workspace backup and restore — 2026-11-09
- [x] Add a downloadable JSON backup containing project records, client records and saved editable website documents.
- [x] Add a restore flow with an explicit replacement confirmation.
- [x] Validate backup format, version, record fields, project references and website-document JSON before restoring.
- [x] Reject oversized backup files and show clear success or failure feedback.
- [x] Explain that backup files contain private workspace data and that current persistence is browser-local, not cloud sync.
- [ ] Test backup/restore with large media libraries and across different mobile browsers.
- [ ] Add encrypted cloud backup and cross-device sync after the secure backend is selected.


## Multi-page editor reliability batch
- [x] Generate collision-resistant IDs for every section and component when creating a page.
- [x] Deep-copy section, component and per-device styles when duplicating a page so copied pages remain independent.
- [ ] Verify add/duplicate/edit flows on desktop and Android, including device-specific style changes.


## Editor accessibility and export safety batch — 2026-11-09
- [x] Make page-layer selection clear stale component and inline-edit state.
- [x] Reset stale selections and mobile drawers when adding, duplicating or deleting pages.
- [x] Keep undo history bounded during redo and refresh document timestamps on history navigation.
- [x] Add keyboard focus and Enter/Space selection to canvas sections.
- [x] Add Alt+ArrowUp/Down section movement when a canvas section or its drag handle is focused.
- [x] Report image file-reader failures instead of silently ignoring unreadable uploads.
- [x] Restrict exported links to safe web, email, telephone, anchor and relative destinations.
- [x] Strip control characters and markup delimiters from exported inline CSS values.
- [ ] Run keyboard-only, screen-reader and exported-link security checks in a real browser.


## Section management and keyboard editing batch — 2026-11-09
- [x] Duplicate editable sections with fresh section/component IDs and independent desktop/tablet/mobile styles.
- [x] Add a section visibility toggle and identify hidden sections in the Layers panel.
- [x] Fix keyboard section movement so it moves the focused section, not a previously selected section.
- [x] Keep selection on the moved section and clear stale component/inline-edit state after structural changes.
- [x] Disable section movement at the header/footer boundaries.
- [x] Add keyboard selection for heading, text, button, image and container elements.
- [x] Support F2 to begin inline editing of keyboard-selected text-capable elements.
- [x] Reset stale inline-edit state when adding, duplicating or deleting components.
- [x] Prevent case-insensitive collisions in exported page filenames.
- [x] Preserve query strings and anchor fragments when resolving internal page links.
- [ ] Complete real-browser keyboard and exported multi-page link regression tests.


## Multi-page isolation, keyboard shortcuts and export hardening — 2026-11-09
- [x] Ensure adding a section changes only the active page; avoid sharing the same section ID/object across every page.
- [x] Ensure section property updates are scoped to the active page.
- [x] Generate distinct, case-insensitive page names when adding, renaming or duplicating pages.
- [x] Generate distinct names when duplicating sections.
- [x] Bound the undo future stack to prevent unbounded browser memory growth.
- [x] Support Escape to leave inline editing, close export/mobile panels, and exit preview in sequence.
- [x] Clear inline editing before toggling preview.
- [x] Expose preview and device selection state through accessible pressed-state attributes.
- [x] Package only recognised image data URL formats and skip malformed embedded images without aborting the export.
- [x] Prevent unrecognised or unsafe image source schemes from being written into exported image tags.
- [x] Sanitize exported theme font, colour and button-radius values.
- [ ] Run multi-page isolation, keyboard and malformed-image export checks in desktop and mobile browsers.


## Image workflow, keyboard editing and export hardening — 2026-11-09
- [x] Make Replace image update the selected image instead of inserting a second image.
- [x] Preserve the existing image element ID and design styles when replacing its file.
- [x] Generate collision-resistant media asset IDs.
- [x] Reset replacement mode when starting a normal upload.
- [x] Close the mobile media drawer after inserting a library image.
- [x] Confirm before removing an asset from the media library; explain existing page placements remain.
- [x] Keep image selection stable after replacement.
- [x] Support Escape to exit inline text editing.
- [x] Support Enter to finish single-line heading and button editing.
- [x] Preserve keyboard selection shortcuts without overwriting the heading handler.
- [x] Move the section identified by the focused touch-drag handle, not a stale selection.
- [x] Focus the export dialog close button when the dialog opens.
- [x] Close the export dialog with Escape when no export is running.
- [x] Allow more time before revoking downloaded object URLs for mobile browser downloads.
- [x] Strip control characters from exported link destinations.
- [x] Block unsafe external/data URLs in exported CSS values.
- [x] Fall back safely when an embedded section background image cannot be packaged.
- [ ] Verify image replacement, keyboard editing and downloads on physical Android devices.

- [x] Validate missing, unsupported and oversized image uploads with clear feedback.
- [x] Clear replacement mode after cancelled or failed image reads and rejected uploads.
- [x] Restore keyboard focus to the Export button when the export dialog closes.
- [x] Handle individual source-file export errors without crashing the editor.


## Export package usability batch — 2026-11-09
- [x] Show live percentage progress while the website ZIP is being compressed.
- [x] Expand the exported README with getting-started steps, included page filenames, asset count and clear service limitations.
- [x] Keep the ZIP download object URL alive longer to improve download handoff reliability on mobile browsers.
- [ ] Verify ZIP progress, README contents and completed downloads on Android and desktop browsers.


## Export manifest batch — 2026-11-09
- [x] Add a versioned manifest.json to each complete website ZIP.
- [x] Record site name, generation timestamp, language, exported page filenames, stylesheets, scripts and packaged assets.
- [x] Keep the manifest free of workspace client records and browser-local editor data.
- [x] Document that forms and external services remain unconnected in the export manifest.
- [ ] Validate the manifest against the actual ZIP contents on Android and desktop.


## Export experience improvements
- [x] Show a pre-download inventory of pages, active sections and media assets.
- [x] Explain that the package contains the current design while forms and connected services still require integration.


## Editor navigation improvements — 2026-11-09
- [x] Add live search to Page layers by section name and type.
- [x] Show matching versus total section counts and a clear empty-search state.
- [x] Add media-library search across image filenames and alt descriptions.
- [x] Add media sorting by newest, filename and approximate file size.
- [x] Keep media search and sorting local to the editor without changing exported website content.
- [ ] Verify search, sorting and selection behaviour with large media libraries on desktop and Android.


## Full-page preview usability — 2026-11-09
- [x] Rework preview layout sizing so the canvas scroll container receives the available viewport height.
- [x] Enable momentum and vertical touch scrolling for the full-page preview on mobile.
- [ ] Physically verify long-page scrolling and page navigation on Android.


- [x] Fix compact-phone Preview layout: remove the zero-height workspace rule and retain a full-height touch scroll container at narrow widths.
- [ ] Physically verify Preview scrolling on Android and iPhone at both compact and expanded viewport sizes.


- [x] Add an explicit mobile touch-scroll handler to the Preview canvas so vertical finger movement updates the canvas scroll position.
- [ ] Physically verify actual content movement on Android and iPhone; automated deployment cannot substitute for device testing.
